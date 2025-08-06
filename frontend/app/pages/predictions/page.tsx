"use client";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import ChatComponent from "@/app/components/ChatComponent";
import PredictedPropertiesTable from "@/app/components/PredictedPropertiesTable";
import ComprehensiveDownload from "@/app/components/ComprehensiveDownload";
import {
  FaChartLine,
  FaTable,
  FaComments,
  FaDownload,
  FaFlask,
} from "react-icons/fa";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import Plotly-based components to prevent SSR issues
const ShapExplanationChart = dynamic(
  () => import("@/app/components/ShapExplanationChart"),
  {
    ssr: false,
    loading: () => <div className="h-80 bg-zinc-800 rounded animate-pulse" />,
  }
);

const Predictions = () => {
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
              <div className="p-3 bg-blue-600 rounded-lg mr-4">
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Predicted Properties
                </h1>
                <p className="text-gray-400 mt-1">
                  View and analyze molecular property predictions with AI
                  explanations
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
            {/* Left Column - Charts and Tables */}
            <div className="xl:col-span-8 space-y-6">
              {/* SHAP Explanation Chart */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-purple-600 rounded-lg mr-3">
                    <FaChartLine className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    SHAP Explanations
                  </h2>
                </div>
                <div className="bg-zinc-950 rounded-xl p-4">
                  <ShapExplanationChart />
                </div>
              </div>

              {/* Predicted Properties Table */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-green-600 rounded-lg mr-3">
                    <FaTable className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Predicted Properties
                  </h2>
                </div>
                <div className="bg-zinc-950 rounded-xl overflow-hidden">
                  <PredictedPropertiesTable />
                </div>
              </div>
            </div>

            {/* Right Column - Chat and Actions */}
            <div className="xl:col-span-4 space-y-6">
              {/* Chat Component */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-blue-600 rounded-lg mr-3">
                    <FaComments className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    AI Assistant
                  </h2>
                </div>
                <div className="bg-zinc-950 rounded-xl overflow-hidden">
                  <ChatComponent />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700">
                <div className="flex items-center mb-6">
                  <div className="p-2 bg-yellow-600 rounded-lg mr-3">
                    <FaFlask className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Quick Actions
                  </h2>
                </div>

                <div className="space-y-4">
                  <Link href="/pages/bio-activity" className="block">
                    <button className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                      <FaFlask className="mr-3" />
                      Check Biological Activity
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-green-600 rounded-lg mr-3">
                <FaDownload className="text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Download Reports
              </h2>
            </div>

            <div className="bg-zinc-950 rounded-xl p-6">
              <ComprehensiveDownload />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
