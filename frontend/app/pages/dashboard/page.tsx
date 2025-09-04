// pages/dashboard.tsx

"use client";
import { useState, useEffect, Suspense } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import tutorialSteps from "@/app/tutorialSteps";
import CustomTour from "@/app/components/CustomTour";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StartTrainingComponent from "@/app/components/StartTrainingComponent";

// Import non-Plotly components normally
import LineChartComponent from "@/app/components/LineChartComponent";
import UploadComponent from "@/app/components/UploadComponent";
import MultiBarLineChartComponent from "@/app/components/MultiBarLineChartComponent";

// Dynamically import Plotly-based components to prevent SSR issues
const ShapExplanationChart = dynamic(
  () => import("@/app/components/ShapExplanationChart"),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-zinc-800 rounded animate-pulse" />,
  }
);

const StackedBarChart = dynamic(
  () => import("@/app/components/StackedBarChart"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
  }
);

const HorizontalBarChart = dynamic(
  () => import("@/app/components/HorizontalBarChart"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
  }
);

const LimeCharts = dynamic(() => import("@/app/components/LimeCharts"), {
  ssr: false,
  loading: () => <div className="h-80 bg-zinc-800 rounded animate-pulse" />,
});

const TrainingStatusTable = dynamic(
  () => import("@/app/components/TrainingStatusTable"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
  }
);

const ModelMetricsCard = dynamic(
  () => import("@/app/components/ModelMetricsCard"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
  }
);

const IntegratedGradientsView = dynamic(
  () => import("@/app/components/IntegratedGradientsView"),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
  }
);

const ActualVsPredictedDynamic = dynamic(
  () => import("@/app/components/ActualVsPredictedDynamic"),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-zinc-800 rounded animate-pulse" />,
  }
);

import {
  FaChartLine,
  FaUpload,
  FaBrain,
  FaLightbulb,
  FaCog,
  FaUser,
  FaLock,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaDatabase,
  FaFlask,
  FaChartBar,
  FaRocket,
} from "react-icons/fa";

// Loading Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4">
      <FaSpinner className="animate-spin text-4xl text-blue-500" />
      <p className="text-gray-400">Loading dashboard...</p>
    </div>
  </div>
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
            <span className="text-gray-500 text-sm ml-1">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-600/20 rounded-xl`}>
        <Icon className={`text-${color}-400 text-xl`} />
      </div>
    </div>
  </motion.div>
);

// Dashboard Card Component
const DashboardCard = ({
  title,
  icon: Icon,
  children,
  className = "",
  loading = false,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 ${className}`}
  >
    <div className="flex items-center mb-6">
      {Icon && (
        <div className="p-2 bg-blue-600 rounded-lg mr-3">
          <Icon className="text-white text-lg" />
        </div>
      )}
      <h2 className="text-xl font-semibold text-white">{title}</h2>
    </div>
    {loading ? (
      <div className="flex justify-center items-center py-8">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    ) : (
      children
    )}
  </motion.div>
);

const DashboardPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isTrained, setIsTrained] = useState<boolean | null>(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://127.0.0.1:5000/check-training-status"
        );
        const data = await response.json();
        setIsTrained(data.isTrained);
      } catch (error) {
        console.error("Error fetching training status:", error);
        setIsTrained(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainingStatus();

    const hasCompletedTutorial = localStorage.getItem("hasCompletedTutorial");
    if (!hasCompletedTutorial) {
      setIsTourOpen(true);
    }
  }, []);

  const handleStartTraining = async () => {
    try {
      const response = await fetch("http://localhost:5000/train", {
        method: "POST",
      });
      if (response.ok) {
        setIsTrained(true);
        toast.success("Training started successfully!");
      } else {
        toast.error("Failed to start training.");
      }
    } catch (error) {
      console.error("Error starting training:", error);
      toast.error("Error starting training.");
    }
  };

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("hasCompletedTutorial", "true");
  };

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } bg-mainBg min-h-screen text-gray-100`}
    >
      <CustomTour
        steps={tutorialSteps}
        isOpen={isTourOpen}
        onClose={closeTour}
        darkMode={darkMode}
      />

      {/* Main Layout with Sidebar */}
      <div className="flex min-h-screen">
        {/* Sidebar - Fixed on mobile, relative on desktop */}
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar - Fixed overlay */}
        <div className="lg:hidden">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header */}
          <Header />

          {/* Dashboard Content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-600 rounded-lg mr-4">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Dashboard
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Monitor model performance and manage your AI predictions
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <AnimatePresence>
                {isTrained ? (
                  // Trained Model Dashboard
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      <StatsCard
                        title="Total Predictions"
                        value="1,247"
                        icon={FaDatabase}
                        color="blue"
                        trend={{ value: 12, isPositive: true }}
                      />
                      <StatsCard
                        title="Model Accuracy"
                        value="94.2%"
                        icon={FaCheckCircle}
                        color="green"
                        trend={{ value: 2.1, isPositive: true }}
                      />
                      <StatsCard
                        title="Active Experiments"
                        value="8"
                        icon={FaFlask}
                        color="purple"
                      />
                      <StatsCard
                        title="Processing Time"
                        value="2.3s"
                        icon={FaRocket}
                        color="orange"
                        trend={{ value: 15, isPositive: false }}
                      />
                    </div>

                    {/* Main Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <DashboardCard
                        title="Model Performance"
                        icon={FaChartLine}
                      >
                        <Suspense
                          fallback={
                            <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <LineChartComponent />
                        </Suspense>
                      </DashboardCard>

                      <DashboardCard
                        title="Multi-Property Analysis"
                        icon={FaBrain}
                      >
                        <Suspense
                          fallback={
                            <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <MultiBarLineChartComponent />
                        </Suspense>
                      </DashboardCard>
                    </div>

                    {/* AI Explanations Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <DashboardCard
                        title="SHAP Explanations"
                        icon={FaLightbulb}
                      >
                        <Suspense
                          fallback={
                            <div className="h-80 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <ShapExplanationChart />
                        </Suspense>
                      </DashboardCard>

                      <DashboardCard title="LIME Analysis" icon={FaBrain}>
                        <Suspense
                          fallback={
                            <div className="h-80 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <LimeCharts />
                        </Suspense>
                      </DashboardCard>
                    </div>

                    {/* Model Metrics & Training Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <DashboardCard title="Model Metrics" icon={FaChartBar}>
                        <Suspense
                          fallback={
                            <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <ModelMetricsCard />
                        </Suspense>
                      </DashboardCard>

                      <DashboardCard title="Training Status" icon={FaCog}>
                        <Suspense
                          fallback={
                            <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <TrainingStatusTable />
                        </Suspense>
                      </DashboardCard>
                    </div>

                    {/* Data Upload & Advanced Features */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <DashboardCard title="Data Upload" icon={FaUpload}>
                        <Suspense
                          fallback={
                            <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <UploadComponent />
                        </Suspense>
                      </DashboardCard>

                      <DashboardCard
                        title="Integrated Gradients"
                        icon={FaBrain}
                      >
                        <Suspense
                          fallback={
                            <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <IntegratedGradientsView />
                        </Suspense>
                      </DashboardCard>
                    </div>

                    {/* Full Width Components */}
                    <div className="space-y-6">
                      <DashboardCard
                        title="Actual vs Predicted"
                        icon={FaChartLine}
                      >
                        <Suspense
                          fallback={
                            <div className="h-80 bg-zinc-800 rounded animate-pulse" />
                          }
                        >
                          <ActualVsPredictedDynamic />
                        </Suspense>
                      </DashboardCard>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DashboardCard
                          title="Stacked Analysis"
                          icon={FaChartBar}
                        >
                          <Suspense
                            fallback={
                              <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                            }
                          >
                            <StackedBarChart />
                          </Suspense>
                        </DashboardCard>

                        <DashboardCard
                          title="Horizontal Analysis"
                          icon={FaChartBar}
                        >
                          <Suspense
                            fallback={
                              <div className="h-64 bg-zinc-800 rounded animate-pulse" />
                            }
                          >
                            <HorizontalBarChart />
                          </Suspense>
                        </DashboardCard>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Start Training Component
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center items-center min-h-[600px]"
                  >
                    <StartTrainingComponent onStart={handleStartTraining} />
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        theme="dark"
      />
    </div>
  );
};

export default DashboardPage;
