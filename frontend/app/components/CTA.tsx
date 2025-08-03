// components/CTA.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import ChemicalReaction from "./ChemicalReaction";
import {
  FaReact,
  FaBolt,
  FaFire,
  FaRocket,
  FaArrowRight,
  FaCheckCircle,
  FaStar,
  FaBrain,
} from "react-icons/fa";

const CTA: React.FC = () => {
  // Example chemical reactions
  const reactions = [
    {
      reaction: "Combustion of Methane",
      equation: "CH₄ + 2 O₂ → CO₂ + 2 H₂O",
      icon: <FaFire size={24} className="text-orange-500" />,
      description: "Complete oxidation of methane",
    },
    {
      reaction: "Photosynthesis",
      equation: "6 CO₂ + 6 H₂O + light → C₆H₁₂O₆ + 6 O₂",
      icon: <FaBolt size={24} className="text-green-500" />,
      description: "Light-driven carbon fixation",
    },
    {
      reaction: "Formation of Water",
      equation: "2 H₂ + O₂ → 2 H₂O",
      icon: <FaReact size={24} className="text-blue-500" />,
      description: "Hydrogen-oxygen combination",
    },
  ];

  const benefits = [
    "Accurate molecular property predictions",
    "Interactive 3D visualizations",
    "Explainable AI insights",
    "Real-time analytics",
    "Secure data handling",
    "24/7 expert support",
  ];

  // Animation variants for the container
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for each reaction card
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="cta"
      className="py-16 bg-gradient-to-br from-neutral-900 via-zinc-900 to-neutral-900 relative overflow-hidden"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-gradient-to-tr from-orange-500/20 via-yellow-400/20 to-orange-500/20 h-full w-full"></div>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to Transform Your Chemical Research?
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Join thousands of researchers who are already accelerating their
            discoveries with ExplainMat's advanced AI platform.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
            >
              <FaCheckCircle className="text-green-400 mr-2 flex-shrink-0" />
              <span className="text-white text-sm font-medium">{benefit}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Reactions Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {reactions.map((reaction, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="flex justify-center"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <ChemicalReaction
                  reaction={reaction.reaction}
                  equation={reaction.equation}
                />
                <div className="mt-4 text-center">
                  <p className="text-gray-300 text-sm">
                    {reaction.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a
            href="/pages/dashboard"
            className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-lg hover:shadow-xl flex items-center justify-center text-lg font-semibold"
          >
            <FaRocket className="mr-2 group-hover:animate-bounce" />
            Start Free Trial
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="/contact"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30 border border-white/20 flex items-center justify-center text-lg font-semibold"
          >
            Schedule Demo
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-2" />
            <span>Trusted by 1000+ researchers</span>
          </div>
          <div className="flex items-center">
            <FaCheckCircle className="text-green-400 mr-2" />
            <span>99.2% accuracy rate</span>
          </div>
          <div className="flex items-center">
            <FaBolt className="text-blue-400 mr-2" />
            <span>24/7 expert support</span>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Why Choose ExplainMat?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaBrain className="text-white text-xl" />
              </div>
              <h4 className="font-semibold text-white mb-2">Advanced AI</h4>
              <p className="text-sm">
                State-of-the-art machine learning models for accurate
                predictions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaReact className="text-white text-xl" />
              </div>
              <h4 className="font-semibold text-white mb-2">Interactive 3D</h4>
              <p className="text-sm">
                Real-time molecular visualization and manipulation
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <h4 className="font-semibold text-white mb-2">Explainable</h4>
              <p className="text-sm">
                Understand how AI makes predictions with detailed explanations
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
