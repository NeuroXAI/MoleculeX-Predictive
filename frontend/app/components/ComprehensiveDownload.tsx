"use client";

import React, { useState, useEffect } from "react";
import {
  FaDownload,
  FaFileExcel,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaChartLine,
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
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `comprehensive_report_${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.xlsx`;
        document.body.appendChild(a);
        a.click();
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
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="text-gray-300">Checking report availability...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
        <div className="flex items-center text-red-400 mb-4">
          <FaExclamationTriangle className="mr-3 text-xl" />
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-gray-300 mb-4">{error}</p>
        <button
          onClick={checkReportStatus}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!reportStatus?.can_generate) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-6">
        <div className="flex items-center text-yellow-400 mb-4">
          <FaInfoCircle className="mr-3 text-xl" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center text-green-400 mb-6">
        <FaCheckCircle className="mr-3 text-xl" />
        <h3 className="text-lg font-semibold">
          Comprehensive Report Available
        </h3>
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-gray-300 mb-4 leading-relaxed">
          Download a comprehensive Excel report containing all predicted
          properties, SHAP values, LIME explanations, and detailed
          interpretations.
        </p>
      </div>

      {/* Report Contents */}
      {reportStatus.report_contents && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
            <p className="text-sm text-gray-400 mb-1">Predictions</p>
            <p className="text-xl font-semibold text-blue-400">
              {reportStatus.report_contents.predicted_properties} compounds
            </p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
            <p className="text-sm text-gray-400 mb-1">Sheets</p>
            <p className="text-xl font-semibold text-green-400">
              {reportStatus.sheets?.length || 4}
            </p>
          </div>
        </div>
      )}

      {/* Sheets List */}
      {reportStatus.sheets && (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3 font-medium">
            Report Contents:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reportStatus.sheets.map((sheet, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-gray-300 bg-zinc-800/30 p-3 rounded-lg border border-zinc-700/30"
              >
                <FaFileExcel className="mr-3 text-green-400 flex-shrink-0" />
                <span className="truncate">{sheet}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Button */}
      <div className="space-y-4">
        <button
          onClick={downloadReport}
          disabled={isDownloading}
          className={`w-full flex items-center justify-center px-6 py-4 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg ${
            isDownloading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          } text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-zinc-900`}
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Downloading...
            </>
          ) : (
            <>
              <FaDownload className="mr-3 text-lg" />
              Download Comprehensive Report
            </>
          )}
        </button>

        {/* Features List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400">
          <div className="flex items-center">
            <FaFileExcel className="mr-2 text-green-400" />
            Excel file with 4 detailed sheets
          </div>
          <div className="flex items-center">
            <FaChartLine className="mr-2 text-purple-400" />
            Includes SHAP and LIME explanations
          </div>
          <div className="flex items-center">
            <FaInfoCircle className="mr-2 text-blue-400" />
            Complete interpretation guide
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDownload;
