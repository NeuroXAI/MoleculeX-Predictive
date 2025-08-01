"use client";

import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaFileExcel,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

interface ReportStatus {
  status: string;
  message: string;
  can_generate: boolean;
  report_contents?: {
    predicted_properties: number;
    molecular_descriptors: boolean;
    binding_affinity: boolean;
    shap_explanations: boolean;
    lime_explanations: boolean;
    detailed_explanations: boolean;
  };
  sheets?: string[];
  download_url?: string;
}

const ComprehensiveDownload: React.FC = () => {
  const [reportStatus, setReportStatus] = useState<ReportStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const checkReportStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/comprehensive_report_status"
      );
      const data = await response.json();

      if (response.ok) {
        setReportStatus(data);
      } else {
        setError(data.error || "Failed to check report status");
      }
    } catch (err) {
      setError("Network error while checking report status");
      console.error("Error checking report status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      const response = await fetch(
        "http://localhost:5000/api/download_comprehensive_report"
      );

      if (response.ok) {
        // Create a blob from the response
        const blob = await response.blob();

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `comprehensive_report_${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.xlsx`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to download report");
      }
    } catch (err) {
      setError("Network error while downloading report");
      console.error("Error downloading report:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    checkReportStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-sidebarBg p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">
            Checking report availability...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-sidebarBg p-6 rounded-xl shadow-lg">
        <div className="flex items-center text-red-400 mb-4">
          <FaExclamationTriangle className="mr-2" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={checkReportStatus}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!reportStatus?.can_generate) {
    return (
      <div className="bg-sidebarBg p-6 rounded-xl shadow-lg">
        <div className="flex items-center text-yellow-400 mb-4">
          <FaExclamationTriangle className="mr-2" />
          <h3 className="text-lg font-semibold">Report Not Available</h3>
        </div>
        <p className="text-gray-300 mb-4">
          {reportStatus?.message || "No predictions data available"}
        </p>
        <p className="text-sm text-gray-400">
          Please run predictions first to generate the comprehensive report.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-sidebarBg p-6 rounded-xl shadow-lg">
      <div className="flex items-center text-green-400 mb-4">
        <FaCheckCircle className="mr-2" />
        <h3 className="text-lg font-semibold">
          Comprehensive Report Available
        </h3>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 mb-4">
          Download a comprehensive Excel report containing all predicted
          properties, SHAP values, LIME explanations, and detailed
          interpretations.
        </p>

        {reportStatus.report_contents && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-900 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Predictions</p>
              <p className="text-lg font-semibold text-blue-400">
                {reportStatus.report_contents.predicted_properties} compounds
              </p>
            </div>
            <div className="bg-zinc-900 p-3 rounded-lg">
              <p className="text-sm text-gray-400">Sheets</p>
              <p className="text-lg font-semibold text-green-400">
                {reportStatus.sheets?.length || 4}
              </p>
            </div>
          </div>
        )}

        {reportStatus.sheets && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Report Contents:</p>
            <div className="grid grid-cols-2 gap-2">
              {reportStatus.sheets.map((sheet, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-300"
                >
                  <FaFileExcel className="mr-2 text-green-400" />
                  {sheet}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={downloadReport}
        disabled={isDownloading}
        className={`flex items-center px-6 py-3 font-semibold rounded-md transition-colors ${
          isDownloading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        } text-white shadow focus:outline-none focus:ring-2 focus:ring-green-500`}
      >
        {isDownloading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Downloading...
          </>
        ) : (
          <>
            <FaDownload className="mr-2" />
            Download Comprehensive Report
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-400">
        <p>• Excel file with 4 detailed sheets</p>
        <p>• Includes SHAP and LIME explanations</p>
        <p>• Complete interpretation guide</p>
      </div>
    </div>
  );
};

export default ComprehensiveDownload;
