// app/data-upload/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Papa from "papaparse";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import UploadData from "@/app/components/UploadData";
import StorageComponent from "@/app/components/StorageComponent";
import SmilesDataTable from "@/app/components/SmilesDataTable";
import { Switch } from "@headlessui/react";
import {
  FaTrain,
  FaBrain,
  FaCalculator,
  FaCogs,
  FaUpload,
  FaFileCsv,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRocket,
  FaDatabase,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import StaggeredDropDown from "@/app/components/StaggeredDropDown";
import CustomTour from "@/app/components/CustomTour";
import tutorialSteps from "@/app/tutorialSteps";

const TRAIN_API_URL = "http://localhost:5000/train";
const PREDICT_API_URL = "http://localhost:5000/predict";
const MATH_PREDICT_API_URL = "http://localhost:5000/calculate_properties_async";
const GENERATIVE_API_URL = "http://localhost:5000/generate";

interface SMILESDatum {
  name: string;
  smiles: string;
  molecularWeight?: string;
  meltingPoint?: string;
  dateAdded?: string;
  [key: string]: string | number | undefined;
}

// Professional Card Component
const ProfessionalCard = ({
  title,
  icon: Icon,
  children,
  className = "",
  gradient = "from-blue-600 to-blue-700",
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 ${className}`}
  >
    <div className="flex items-center mb-6">
      <div className={`p-3 bg-gradient-to-r ${gradient} rounded-xl mr-4`}>
        <Icon className="text-white text-xl" />
      </div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    {children}
  </motion.div>
);

// Stats Card Component
const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  trend = null,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  trend?: { value: number; isPositive: boolean } | null;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={`text-sm ${
                trend.isPositive ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-gray-500 text-sm ml-1">vs last upload</span>
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-600/20 rounded-xl`}>
        <Icon className={`text-${color}-400 text-xl`} />
      </div>
    </div>
  </motion.div>
);

const DataUploadPage = () => {
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPredictMode, setIsPredictMode] = useState(false);
  const [predictionMethod, setPredictionMethod] = useState<
    "transformer" | "math"
  >("transformer");
  const [selectedModel, setSelectedModel] =
    useState<string>("Predictive Model");
  const [calculationStatus, setCalculationStatus] = useState<string | null>(
    null
  );
  // calculationStatus is used in checkCalculationStatus function for status tracking
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [pollingIntervalId, setPollingIntervalId] =
    useState<NodeJS.Timeout | null>(null);
  const [smilesData, setSmilesData] = useState<SMILESDatum[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
  } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const trainButtonRef = useRef<HTMLButtonElement>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Handle file selection from UploadData component
  const handleFileSelected = (file: File) => {
    console.log("File selected:", file.name); // Debug log
    setFileInfo({ name: file.name, size: file.size });
    setUploadProgress(0);
    setError(null);
    setSuccessMessage(null);
    setIsDataLoaded(false);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        console.log("Parsed data:", results.data); // Debug log
        const parsedData = results.data as SMILESDatum[];
        setSmilesData(parsedData);
        setSuccessMessage(
          `File parsed successfully! Loaded ${parsedData.length} records.`
        );
        setError(null);
        setUploadProgress(100);
        setIsDataLoaded(true);
        setTimeout(() => setUploadProgress(0), 2000);
      },
      error: function () {
        setError(
          "Failed to parse CSV file. Please ensure the file is in the correct format."
        );
        setSuccessMessage(null);
        setUploadProgress(0);
        setIsDataLoaded(false);
      },
    });
  };

  const handleStartAction = async () => {
    const fileInput = document.querySelector<HTMLInputElement>("#fileInput");

    if (!fileInput?.files?.length) {
      setError("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let apiUrl = TRAIN_API_URL;

      if (isPredictMode) {
        if (selectedModel === "Predictive Model") {
          if (predictionMethod === "transformer") {
            apiUrl = PREDICT_API_URL;
          } else {
            apiUrl = MATH_PREDICT_API_URL;
          }
        } else if (selectedModel === "Generative Model") {
          apiUrl = GENERATIVE_API_URL;
        }
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (selectedModel === "Generative Model") {
          setSuccessMessage("Generation started successfully!");
          if (data.generated_url) {
            setDownloadUrl(`http://localhost:5000${data.generated_url}`);
          }
        } else if (predictionMethod === "math") {
          const { task_id } = data;
          setCalculationStatus("Calculation started successfully!");
          setSuccessMessage("Calculation started successfully!");

          const intervalId = setInterval(() => {
            checkCalculationStatus(task_id);
          }, 5000);

          setPollingIntervalId(intervalId);
        } else {
          setSuccessMessage(
            isPredictMode
              ? "Predictions started successfully!"
              : "Model training started successfully!"
          );
          setTimeout(() => {
            router.push(
              isPredictMode
                ? "/pages/model-predicting"
                : "/pages/model-training"
            );
          }, 2000);
        }
      } else {
        setError(data.error || "An error occurred during the operation.");
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const checkCalculationStatus = async (taskId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/calculate_properties_status/${taskId}`
      );
      const data = await response.json();

      if (response.ok) {
        setCalculationStatus(data.status);

        if (data.status === "completed") {
          setSuccessMessage("Calculation completed successfully!");
          setDownloadUrl(`http://localhost:5000${data.download_url}`);

          if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            setPollingIntervalId(null);
          }
        } else if (data.status === "error") {
          setError(
            data.error_detail || "An error occurred during calculation."
          );
          if (pollingIntervalId) {
            clearInterval(pollingIntervalId);
            setPollingIntervalId(null);
          }
        } else {
          setSuccessMessage(data.message);
        }
      } else {
        setError(data.error || "Failed to get calculation status.");
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId);
          setPollingIntervalId(null);
        }
      }
    } catch {
      setError("Failed to connect to the server.");
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [pollingIntervalId]);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("hasCompletedTour");
    if (!hasCompletedTour) {
      setIsTourOpen(true);
      localStorage.setItem("hasCompletedTour", "true");
    }
  }, []);

  useEffect(() => {
    const autoToggle = searchParams.get("autoToggle");
    if (autoToggle === "true" && trainButtonRef.current) {
      trainButtonRef.current.click();
      router.replace("/pages/data-upload");
    }
  }, [searchParams, router]);

  return (
    <div className="bg-mainBg min-h-screen text-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg mr-4">
                <FaUpload className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Data Upload & Processing
                </h1>
                <p className="text-gray-400 mt-1">
                  Upload your molecular data and choose your processing method
                </p>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Records"
              value={smilesData.length > 0 ? smilesData.length : "0"}
              icon={FaDatabase}
              color="blue"
              trend={isDataLoaded ? { value: 15, isPositive: true } : null}
            />
            <StatsCard
              title="Processing Time"
              value="2.3s"
              icon={FaRocket}
              color="green"
              trend={{ value: 8, isPositive: false }}
            />
            <StatsCard
              title="Success Rate"
              value="98.5%"
              icon={FaCheckCircle}
              color="purple"
              trend={{ value: 2.1, isPositive: true }}
            />
            <StatsCard
              title="Active Models"
              value="3"
              icon={FaBrain}
              color="orange"
            />
          </div>

          {/* Model Selection */}
          <ProfessionalCard
            title="Model Configuration"
            icon={FaCogs}
            className="mb-8"
          >
            <div className="space-y-6">
              {/* Model Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Model Type
                </label>
                <StaggeredDropDown
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                />
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {isPredictMode ? "Predict Mode" : "Train Mode"}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {isPredictMode
                      ? "Use trained models to make predictions"
                      : "Train new models with your data"}
                  </p>
                </div>
                <Switch
                  checked={isPredictMode}
                  onChange={setIsPredictMode}
                  className={`${
                    isPredictMode ? "bg-blue-600" : "bg-gray-600"
                  } relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <span
                    className={`${
                      isPredictMode ? "translate-x-8" : "translate-x-0"
                    } inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform`}
                  />
                </Switch>
              </div>

              {/* Prediction Method Selection */}
              {isPredictMode && selectedModel === "Predictive Model" && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Select Prediction Method
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPredictionMethod("transformer")}
                      className={`p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                        predictionMethod === "transformer"
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white border-2 border-blue-500"
                          : "bg-zinc-800/50 text-gray-300 border-2 border-transparent hover:border-blue-500/50"
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <FaBrain className="text-2xl mr-3" />
                        <h4 className="text-lg font-semibold">
                          Transformer Model
                        </h4>
                      </div>
                      <p className="text-sm opacity-90">
                        Advanced AI-powered predictions using transformer
                        architecture
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPredictionMethod("math")}
                      className={`p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                        predictionMethod === "math"
                          ? "bg-gradient-to-r from-green-600 to-green-700 text-white border-2 border-green-500"
                          : "bg-zinc-800/50 text-gray-300 border-2 border-transparent hover:border-green-500/50"
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        <FaCalculator className="text-2xl mr-3" />
                        <h4 className="text-lg font-semibold">
                          Math-Based Approach
                        </h4>
                      </div>
                      <p className="text-sm opacity-90">
                        Calculate properties using mathematical formulas and
                        descriptors
                      </p>
                    </motion.div>
                  </div>
                </div>
              )}
            </div>
          </ProfessionalCard>

          {/* Upload and Storage Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Upload Component */}
            <ProfessionalCard
              title="Data Upload"
              icon={FaUpload}
              gradient="from-green-600 to-green-700"
            >
              <div className="space-y-6">
                <UploadData onFileSelected={handleFileSelected} />

                {/* File Info Display */}
                {fileInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-800/50 p-4 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {fileInfo.name}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {(fileInfo.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <FaCheckCircle className="text-green-400 text-xl" />
                    </div>
                  </motion.div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Processing...</span>
                      <span className="text-white">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <motion.button
                  ref={trainButtonRef}
                  onClick={handleStartAction}
                  disabled={loading || !isDataLoaded}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                    loading || !isDataLoaded
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full" />
                      {isPredictMode ? "Processing..." : "Training..."}
                    </>
                  ) : (
                    <>
                      {isPredictMode ? (
                        selectedModel === "Generative Model" ? (
                          <FaCogs className="mr-2" />
                        ) : predictionMethod === "transformer" ? (
                          <FaBrain className="mr-2" />
                        ) : (
                          <FaCalculator className="mr-2" />
                        )
                      ) : (
                        <FaTrain className="mr-2" />
                      )}
                      {isPredictMode
                        ? selectedModel === "Generative Model"
                          ? "Start Generation"
                          : "Start Prediction"
                        : "Start Training"}
                    </>
                  )}
                </motion.button>

                {/* Status Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                    >
                      <FaExclamationTriangle className="text-red-400 mr-2" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </motion.div>
                  )}
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
                    >
                      <FaCheckCircle className="text-green-400 mr-2" />
                      <span className="text-green-400 text-sm">
                        {successMessage}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Download Link */}
                {downloadUrl && (
                  <motion.a
                    href={downloadUrl}
                    download
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    <FaUpload className="mr-2" />
                    Download Results
                  </motion.a>
                )}
              </div>
            </ProfessionalCard>

            {/* Storage Component */}
            <ProfessionalCard
              title="Storage & Management"
              icon={FaDatabase}
              gradient="from-purple-600 to-purple-700"
            >
              <StorageComponent />
            </ProfessionalCard>
          </div>

          {/* Data Preview */}
          {smilesData.length > 0 && (
            <ProfessionalCard
              title="Data Preview"
              icon={FaFileCsv}
              gradient="from-orange-600 to-orange-700"
            >
              <SmilesDataTable data={smilesData} />
            </ProfessionalCard>
          )}
        </div>
      </div>

      {/* Loading Modal */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-2xl shadow-2xl border border-zinc-700"
            >
              <div className="flex items-center space-x-4">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                <div>
                  <p className="text-white font-semibold text-lg">
                    {isPredictMode
                      ? selectedModel === "Generative Model"
                        ? "Generating..."
                        : "Processing..."
                      : "Training..."}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Please wait while we process your data
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CustomTour Component */}
      <CustomTour
        steps={tutorialSteps}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        darkMode={false}
      />
    </div>
  );
};

export default DataUploadPage;
