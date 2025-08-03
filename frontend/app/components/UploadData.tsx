// components/UploadData.tsx
"use client";

import { useState } from "react";
import {
  FaUpload,
  FaFileCsv,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { motion } from "framer-motion";

interface UploadDataProps {
  onFileSelected: (file: File) => void;
}

const UploadData: React.FC<UploadDataProps> = ({ onFileSelected }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  // Validate file type and size
  const validateAndSetFile = (selectedFile: File) => {
    setUploadError("");

    // Check file type
    const allowedTypes = ["text/csv", "application/json"];
    if (
      !allowedTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setUploadError("Please select a valid CSV or JSON file.");
      return;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setUploadError("File size must be less than 10MB.");
      return;
    }

    setFile(selectedFile);
    onFileSelected(selectedFile);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          isDragOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 bg-zinc-800/30 hover:border-gray-500"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="fileInput"
          name="file"
          accept=".csv,.json"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
          aria-label="Upload CSV or JSON file"
          title="Click to upload or drag and drop a CSV or JSON file"
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <motion.div
            animate={{ scale: file ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {file ? (
              <FaCheckCircle className="text-green-400 text-4xl" />
            ) : (
              <FaUpload className="text-blue-400 text-4xl" />
            )}
          </motion.div>

          <div>
            <p className="text-white font-semibold text-lg">
              {file ? "File Selected!" : "Click to upload or drag and drop"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {file ? file.name : "CSV and JSON files allowed (max 10MB)"}
            </p>
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 w-full"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FaFileCsv className="text-green-400" />
                  <div>
                    <p className="text-green-400 font-medium text-sm">
                      {file.name}
                    </p>
                    <p className="text-green-400/70 text-xs">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <FaCheckCircle className="text-green-400" />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
        >
          <FaExclamationTriangle className="text-red-400 mr-2" />
          <span className="text-red-400 text-sm">{uploadError}</span>
        </motion.div>
      )}

      {/* Instructions */}
      {!file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-zinc-800/50 p-4 rounded-lg"
        >
          <h4 className="text-white font-medium mb-2">Upload Instructions:</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Supported formats: CSV, JSON</li>
            <li>• Maximum file size: 10MB</li>
            <li>• CSV should have headers (first row)</li>
            <li>• Required columns: name, smiles</li>
            <li>• Drag and drop files directly onto the upload area</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default UploadData;
