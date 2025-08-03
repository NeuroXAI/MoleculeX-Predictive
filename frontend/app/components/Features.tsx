// components/Features.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ChemicalBond from "./ChemicalBond";
import {
  FaProjectDiagram,
  FaChartLine,
  FaBook,
  FaBrain,
  FaRocket,
  FaShieldAlt,
  FaFlask,
  FaCog,
  FaEye,
  FaDownload,
  FaShare,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";

const Features: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  // Animation variants for the container
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for each feature card
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  // Enhanced features data
  const features = [
    {
      icon: <FaProjectDiagram size={40} color="#ED8936" />,
      title: "3D Molecular Visualization",
      description:
        "Interactive 3D models of chemical compounds with real-time rotation, zoom, and manipulation capabilities for in-depth structural analysis.",
      benefits: [
        "High-resolution rendering",
        "Multiple visualization modes",
        "Export capabilities",
      ],
      color: "from-orange-500 to-red-500",
      gradient: "from-orange-500/10 to-red-500/10",
    },
    {
      icon: <FaChartLine size={40} color="#38A169" />,
      title: "AI-Powered Predictions",
      description:
        "Advanced machine learning models that predict chemical properties, reactivity, and biological activity with high accuracy.",
      benefits: [
        "99.2% accuracy rate",
        "Real-time predictions",
        "Multiple property types",
      ],
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-500/10 to-emerald-500/10",
    },
    {
      icon: <FaBrain size={40} color="#3182CE" />,
      title: "Explainable AI",
      description:
        "Understand how AI makes predictions with detailed explanations, feature importance, and interpretable results.",
      benefits: [
        "SHAP explanations",
        "Feature importance",
        "Model transparency",
      ],
      color: "from-blue-500 to-cyan-500",
      gradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      icon: <FaRocket size={40} color="#805AD5" />,
      title: "High Performance",
      description:
        "Optimized algorithms and parallel processing for lightning-fast analysis of large molecular datasets.",
      benefits: ["GPU acceleration", "Batch processing", "Cloud computing"],
      color: "from-purple-500 to-pink-500",
      gradient: "from-purple-500/10 to-pink-500/10",
    },
    {
      icon: <FaShieldAlt size={40} color="#E53E3E" />,
      title: "Data Security",
      description:
        "Enterprise-grade security with encrypted data transmission and secure cloud storage for sensitive research data.",
      benefits: ["End-to-end encryption", "GDPR compliance", "Regular backups"],
      color: "from-red-500 to-pink-500",
      gradient: "from-red-500/10 to-pink-500/10",
    },
    {
      icon: <FaCog size={40} color="#D69E2E" />,
      title: "Customizable Workflows",
      description:
        "Create and customize analysis workflows tailored to your specific research needs and experimental protocols.",
      benefits: [
        "Drag-and-drop interface",
        "Template library",
        "Workflow sharing",
      ],
      color: "from-yellow-500 to-orange-500",
      gradient: "from-yellow-500/10 to-orange-500/10",
    },
    {
      icon: <FaEye size={40} color="#319795" />,
      title: "Real-time Monitoring",
      description:
        "Monitor your experiments and model training progress with live updates and comprehensive analytics dashboards.",
      benefits: [
        "Live progress tracking",
        "Performance metrics",
        "Alert system",
      ],
      color: "from-teal-500 to-cyan-500",
      gradient: "from-teal-500/10 to-cyan-500/10",
    },
    {
      icon: <FaDownload size={40} color="#38B2AC" />,
      title: "Export & Integration",
      description:
        "Export results in multiple formats and integrate with popular chemistry software and databases.",
      benefits: ["Multiple formats", "API access", "Third-party integration"],
      color: "from-cyan-500 to-blue-500",
      gradient: "from-cyan-500/10 to-blue-500/10",
    },
  ];

  return (
    <section id="features" className="py-16 bg-gray-50 dark:bg-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-4">
            Powerful Features for Modern Chemistry
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Discover the comprehensive suite of tools designed to accelerate
            your chemical research and drug discovery efforts.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`bg-white dark:bg-zinc-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-zinc-600 ${
                activeFeature === index ? "ring-2 ring-orange-500" : ""
              }`}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => setActiveFeature(index)}
            >
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient}`}
                >
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-3 text-center">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-zinc-400 text-sm mb-4 text-center">
                {feature.description}
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div
                    key={benefitIndex}
                    className="flex items-center text-xs text-gray-500 dark:text-gray-400"
                  >
                    <FaCheckCircle
                      className="text-green-500 mr-2 flex-shrink-0"
                      size={12}
                    />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Active indicator */}
              {activeFeature === index && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
                >
                  <FaCheckCircle className="text-white text-xs" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Details Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: activeFeature !== null ? 1 : 0,
            y: activeFeature !== null ? 0 : 20,
          }}
          className="mt-12 bg-white dark:bg-zinc-700 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-zinc-600"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-4">
                {features[activeFeature]?.title}
              </h3>
              <p className="text-gray-600 dark:text-zinc-400 mb-6">
                {features[activeFeature]?.description}
              </p>
              <div className="space-y-3">
                {features[activeFeature]?.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-3" />
                    <span className="text-gray-700 dark:text-zinc-300">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div
                className={`p-8 rounded-xl bg-gradient-to-br ${features[activeFeature]?.color} text-white`}
              >
                {features[activeFeature]?.icon}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chemical Bonds Connecting Features */}
        <ChemicalBond
          from={{ x: "33.333%", y: "0%" }}
          to={{ x: "33.333%", y: "100%" }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
        />
        <ChemicalBond
          from={{ x: "66.666%", y: "0%" }}
          to={{ x: "66.666%", y: "100%" }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
        />
      </div>
    </section>
  );
};

export default Features;
