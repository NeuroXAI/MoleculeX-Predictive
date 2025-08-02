// components/ModelPredictingLoader.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBrain,
  FaChartLine,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRocket,
  FaFlask,
  FaDatabase,
  FaLightbulb,
} from "react-icons/fa";

interface PredictionStep {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "active" | "completed" | "error";
}

const ModelPredictingLoader = () => {
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Initializing prediction model..."
  );
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<string>("");

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Define prediction steps
  const predictionSteps: PredictionStep[] = [
    {
      id: "init",
      name: "Model Initialization",
      description: "Loading trained model and preparing for prediction",
      icon: FaBrain,
      status: "pending",
    },
    {
      id: "data",
      name: "Data Processing",
      description: "Processing input data and extracting features",
      icon: FaDatabase,
      status: "pending",
    },
    {
      id: "predict",
      name: "Prediction Generation",
      description: "Generating predictions using AI model",
      icon: FaChartLine,
      status: "pending",
    },
    {
      id: "analysis",
      name: "Result Analysis",
      description: "Analyzing and formatting prediction results",
      icon: FaLightbulb,
      status: "pending",
    },
    {
      id: "complete",
      name: "Completion",
      description: "Finalizing and preparing results for display",
      icon: FaCheckCircle,
      status: "pending",
    },
  ];

  // Update step status based on progress
  useEffect(() => {
    const stepProgress = progress / 20; // Each step is 20% of total progress
    const activeStep = Math.floor(stepProgress);

    setCurrentStep(Math.min(activeStep, predictionSteps.length - 1));
  }, [progress]);

  useEffect(() => {
    const fetchTrainingStatus = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/get_prediction_status"
        );
        const data = await response.json();

        setStatusMessage(data.message || "Predicting in progress...");

        if (data.progress !== undefined) {
          setProgress(data.progress);
        }

        if (data.eta !== undefined) {
          setEstimatedTimeLeft(data.eta);
        }

        // Redirect when progress reaches 100%
        if (data.progress === 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/pages/predictions");
          }, 2000); // Give user time to see completion
        }

        // Handle completion status
        if (data.status === "completed") {
          clearInterval(interval);
          setTimeout(() => {
            router.push("/pages/predictions");
          }, 2000);
        } else if (data.status === "error") {
          clearInterval(interval);
          setError(data.message || "An error occurred during prediction");
        }
      } catch (error) {
        console.error("Error fetching predicting status:", error);
        setError("Failed to connect to prediction service");
      }
    };

    // Initial fetch
    fetchTrainingStatus();

    // Set up interval to fetch status every 3 seconds
    const interval = setInterval(fetchTrainingStatus, 3000);

    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, [router]);

  // Animated particles for background
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 min-h-screen flex items-center justify-center p-4">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-blue-500/20 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-8 rounded-2xl shadow-2xl border border-zinc-700 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4"
          >
            <FaBrain className="text-white text-3xl" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Prediction in Progress
          </h1>
          <p className="text-gray-400">{statusMessage}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Overall Progress</span>
            <span className="text-blue-400 font-bold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Prediction Steps */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Prediction Pipeline
          </h3>
          {predictionSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${
                index === currentStep
                  ? "bg-blue-500/20 border-blue-500/50"
                  : index < currentStep
                  ? "bg-green-500/20 border-green-500/50"
                  : "bg-zinc-700/50 border-zinc-600"
              }`}
            >
              <div
                className={`p-2 rounded-full mr-4 ${
                  index === currentStep
                    ? "bg-blue-500 text-white"
                    : index < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-zinc-600 text-gray-400"
                }`}
              >
                {index === currentStep ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <step.icon className="text-lg" />
                  </motion.div>
                ) : (
                  <step.icon className="text-lg" />
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={`font-medium ${
                    index === currentStep
                      ? "text-blue-400"
                      : index < currentStep
                      ? "text-green-400"
                      : "text-gray-300"
                  }`}
                >
                  {step.name}
                </h4>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
              {index < currentStep && (
                <FaCheckCircle className="text-green-400 text-xl" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FaRocket className="text-blue-400 mr-2" />
              <span className="text-white font-medium">Status</span>
            </div>
            <p className="text-gray-300 text-sm">{statusMessage}</p>
          </div>

          {estimatedTimeLeft && (
            <div className="bg-zinc-800/50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FaFlask className="text-purple-400 mr-2" />
                <span className="text-white font-medium">ETA</span>
              </div>
              <p className="text-gray-300 text-sm">{estimatedTimeLeft}</p>
            </div>
          )}
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-4"
            >
              <div className="flex items-center">
                <FaExclamationTriangle className="text-red-400 mr-2" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion Message */}
        <AnimatePresence>
          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <FaCheckCircle className="text-green-400 text-2xl mr-2" />
                <span className="text-green-400 font-semibold">
                  Prediction Complete!
                </span>
              </div>
              <p className="text-green-400/80 text-sm">
                Redirecting to results...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ModelPredictingLoader;
