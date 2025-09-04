"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { FaUpload, FaDownload } from "react-icons/fa";

// Dynamically import Plotly components to prevent SSR issues
const PlotlyChart = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
});

// Dynamically import Plotly to prevent SSR issues
const Plotly = dynamic(
  () => import("plotly.js-basic-dist").then((mod) => ({ default: mod })),
  {
    ssr: false,
  }
);

const ShapExplanationChart = () => {
  const [status, setStatus] = useState("idle"); // "idle" | "running" | "completed" | "error"
  const [message, setMessage] = useState("");
  const [shapValues, setShapValues] = useState([]);
  const [features, setFeatures] = useState([]);
  const [errorDetail, setErrorDetail] = useState("");
  const [uploading, setUploading] = useState(false); // Indicates if a file is being uploaded
  const [selectedFile, setSelectedFile] = useState(null); // Stores the selected file

  const fileInputRef = useRef(null); // Reference to the hidden file input
  const plotRef = useRef(null); // Reference to the Plotly chart

  const fetchShapData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/shap_data");
      const data = response.data;

      if (data.error) {
        setStatus("error");
        setMessage("SHAP data not available.");
        setErrorDetail(data.error);
        return;
      }

      const { shap_values, features: featureNames } = data;

      // Sort features by the average magnitude of their SHAP values and select the top 5
      const averagedShapValues = shap_values.map(
        (values) =>
          values.reduce((sum, val) => sum + Math.abs(val), 0) / values.length
      );
      const sortedIndices = averagedShapValues
        .map((avg, index) => ({ avg, index }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 5) // Limit to top 5 features
        .map((item) => item.index);

      const filteredShapValues = sortedIndices.map(
        (index) => shap_values[index]
      );
      const filteredFeatures = sortedIndices.map(
        (index) => featureNames[index]
      );

      setShapValues(filteredShapValues);
      setFeatures(filteredFeatures);
      setStatus("completed");
      setMessage("SHAP data loaded successfully.");
    } catch (error) {
      console.error("Error fetching SHAP data:", error);
      setStatus("error");
      setMessage("Failed to fetch SHAP data.");
      setErrorDetail(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    // Fetch SHAP data once when component mounts
    fetchShapData();
  }, []); // Only run once when component mounts

  const uploadShapFile = async (file) => {
    setUploading(true);
    setErrorDetail("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://127.0.0.1:5000/start_shap_explanation",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 202) {
        setStatus("running");
        setMessage("SHAP explanation started. Processing...");
      } else {
        setStatus("error");
        setMessage("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error starting SHAP explanation:", error);
      setStatus("error");
      setMessage("Failed to start SHAP explanation.");
      setErrorDetail(error.response?.data?.error || error.message);
    } finally {
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the file input
      }
    }
  };

  const generatePlotlyData = () => {
    if (
      !shapValues ||
      shapValues.length === 0 ||
      !features ||
      features.length === 0
    ) {
      return [];
    }

    const customColors = [
      "#FF6B6B", // Red
      "#1FAB89", // Green
      "#FFD700", // Gold
      "#6495ED", // Cornflower Blue
      "#FF69B4", // Hot Pink
    ];

    return shapValues.map((values, index) => ({
      type: "violin",
      x: values,
      y: Array(values.length).fill(features[index]), // Align y-axis categories
      points: "all",
      box: { visible: false },
      meanline: { visible: true },
      marker: {
        color: customColors[index % customColors.length],
        opacity: 0.8,
      },
      line: { color: customColors[index % customColors.length] },
      hoverinfo: "x+y",
      orientation: "h",
    }));
  };

  const downloadChart = async () => {
    if (plotRef.current) {
      try {
        await Plotly.downloadImage(plotRef.current, {
          format: "png",
          filename: "shap_explanation_chart",
          width: 800,
          height: 450,
        });
      } catch (error) {
        console.error("Error downloading chart:", error);
      }
    }
  };

  return (
    <div className="bg-sidebarBg p-6 rounded-xl shadow-lg">
      <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
        <h3 className="text-gray-200 text-lg font-bold mb-4">
          SHAP Explanation Chart
        </h3>

        {status === "idle" && (
          <div className="mb-6">
            <button
              onClick={() => fileInputRef.current.click()}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={uploading}
            >
              <FaUpload className="mr-2" /> Start SHAP Explanation
            </button>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) setSelectedFile(file);
                uploadShapFile(file);
              }}
              className="hidden"
              aria-label="Upload CSV file for SHAP analysis"
              title="Upload CSV file for SHAP analysis"
            />
          </div>
        )}

        {status === "completed" &&
          shapValues.length > 0 &&
          features.length > 0 && (
            <>
              <div ref={plotRef}>
                <PlotlyChart
                  data={generatePlotlyData()}
                  layout={{
                    title: {
                      text: "<b>SHAP Values (Impact on Model Output)</b>",
                      font: { color: "white", size: 16 },
                    },
                    yaxis: {
                      title: "",
                      automargin: true,
                      tickfont: { color: "#A0AEC0", size: 12 },
                      tickcolor: "#A0AEC0",
                    },
                    xaxis: {
                      title: {
                        text: "<b>SHAP Value</b>",
                        font: { color: "#A0AEC0", size: 14 },
                      },
                      tickfont: { color: "#A0AEC0", size: 12 },
                      tickcolor: "#A0AEC0",
                    },
                    plot_bgcolor: "rgba(0, 0, 0, 0)",
                    paper_bgcolor: "rgba(0, 0, 0, 0)",
                    margin: { l: 120, r: 50, t: 50, b: 40 },
                    showlegend: false,
                  }}
                  style={{ width: "100%", height: "450px" }}
                  config={{ displayModeBar: false }}
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={downloadChart}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <FaDownload className="mr-2" /> Download Chart
                </button>
              </div>
            </>
          )}
      </div>
    </div>
  );
};

export default ShapExplanationChart;
