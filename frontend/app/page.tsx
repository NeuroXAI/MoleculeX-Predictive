// pages/index.tsx
"use client";

import React, { Suspense, useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import AboutUs from "./components/AboutUs";
import CTA from "./components/CTA";
import Contact from "./components/Contact";
import FloatingParticle from "./components/FloatingParticle";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  FaRocket,
  FaBrain,
  FaChartLine,
  FaFlask,
  FaArrowRight,
  FaPlay,
  FaStar,
  FaShieldAlt,
  FaBolt,
  FaUsers,
  FaAward,
  FaArrowDown,
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";

// Lazy load components for performance optimization
const ChemicalBond = dynamic(() => import("./components/ChemicalBond"), {
  ssr: false,
  loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
});
const RotatingAtoms = dynamic(() => import("./components/RotatingAtoms"), {
  ssr: false,
  loading: () => <div className="h-64 bg-zinc-800 rounded animate-pulse" />,
});

// Define animation variants outside the component for reusability
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Set dark mode by default on page load
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  // Array of particles with different properties
  const particles = [
    {
      size: 8,
      color: "#F97316",
      initialPosition: { x: 20, y: 30 },
      hoverScale: 1.5,
    },
    {
      size: 6,
      color: "#3B82F6",
      initialPosition: { x: 70, y: 60 },
      hoverScale: 1.3,
    },
    {
      size: 10,
      color: "#06B6D4",
      initialPosition: { x: 40, y: 80 },
      hoverScale: 1.4,
    },
    {
      size: 7,
      color: "#34D399",
      initialPosition: { x: 85, y: 20 },
      hoverScale: 1.2,
    },
    {
      size: 9,
      color: "#8B5CF6",
      initialPosition: { x: 10, y: 70 },
      hoverScale: 1.6,
    },
    {
      size: 5,
      color: "#EC4899",
      initialPosition: { x: 90, y: 40 },
      hoverScale: 1.1,
    },
  ];

  const features = [
    {
      icon: FaBrain,
      title: "AI-Powered Predictions",
      description:
        "Advanced machine learning models for accurate chemical property predictions",
      color: "from-blue-500 to-cyan-500",
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: FaChartLine,
      title: "Real-time Analytics",
      description:
        "Interactive charts and visualizations for comprehensive data analysis",
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: FaFlask,
      title: "Molecular Modeling",
      description: "3D molecular visualization and structure analysis tools",
      color: "from-purple-500 to-pink-500",
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      icon: FaRocket,
      title: "High Performance",
      description: "Optimized algorithms for fast and efficient processing",
      color: "from-orange-500 to-red-500",
      gradient: "from-orange-500/20 to-red-500/20",
    },
  ];

  const stats = [
    { number: "99.2%", label: "Accuracy Rate", icon: FaShieldAlt },
    { number: "10K+", label: "Molecules Analyzed", icon: FaFlask },
    { number: "50+", label: "Research Papers", icon: FaAward },
    { number: "24/7", label: "AI Processing", icon: FaBolt },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: "Upload Your Data",
      description:
        "Import your chemical structures in SMILES format or upload CSV files",
      icon: FaUsers,
    },
    {
      step: "02",
      title: "AI Analysis",
      description:
        "Our advanced AI models analyze and predict molecular properties",
      icon: FaBrain,
    },
    {
      step: "03",
      title: "Visualize Results",
      description:
        "Get interactive 3D visualizations and detailed analytics reports",
      icon: FaChartLine,
    },
  ];

  return (
    <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 min-h-screen flex flex-col overflow-hidden dark">
      {/* Navbar */}
      <Navbar />

      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <FloatingParticle
          key={index}
          size={particle.size}
          color={particle.color}
          initialPosition={particle.initialPosition}
          hoverScale={particle.hoverScale}
        />
      ))}

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center flex-1 p-8 sm:p-16 lg:p-24 text-center mt-16 md:mt-24">
        {/* Animated Background Elements */}
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
          }
        >
          <RotatingAtoms />
        </Suspense>

        {/* Content Container */}
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
          className="relative z-10 max-w-6xl px-4"
        >
          {/* Main Heading */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-full text-sm font-medium text-orange-800 dark:text-orange-200 mb-6"
            >
              <FaStar className="mr-2 text-yellow-500" />
              Revolutionizing Chemical AI
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 text-transparent bg-clip-text leading-tight mb-6 animate-gradient relative z-10"
            >
              Transforming Chemical Insights with{" "}
              <span className="text-yellow-300 drop-shadow-lg">ExplainMat</span>
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-zinc-400 mb-8 max-w-4xl mx-auto leading-relaxed tracking-wide"
          >
            Leveraging advanced AI to enhance chemical visualization and
            prediction for accurate and efficient scientific discoveries.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/pages/dashboard"
              className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <FaRocket className="mr-2 group-hover:animate-bounce" />
              Get Started
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="px-8 py-4 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 shadow-lg hover:shadow-xl flex items-center justify-center border border-gray-200 dark:border-zinc-700"
            >
              <FaPlay className="mr-2" />
              Watch Demo
            </button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col items-center mt-8"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-gray-400 dark:text-gray-500 mb-2"
            >
              <FaArrowDown size={20} />
            </motion.div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Scroll to explore
            </span>
          </motion.div>
        </motion.div>

        {/* Chemical Bonds in Hero Section */}
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center">
              Loading Bonds...
            </div>
          }
        >
          <ChemicalBond from={{ x: 25, y: 50 }} to={{ x: 75, y: 50 }} />
        </Suspense>
      </section>

      {/* Statistics Section */}
      <section className="py-16 px-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Trusted by Researchers Worldwide
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="text-white text-2xl" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Interactive Features Preview */}
      <section className="py-16 px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Powerful Features at Your Fingertips
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${
                  feature.color
                } text-white cursor-pointer transition-all duration-300 ${
                  activeFeature === index ? "ring-4 ring-white/30" : ""
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-center mb-4">
                  <feature.icon className="text-2xl mr-3" />
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm opacity-90">{feature.description}</p>

                {activeFeature === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-8 bg-gray-50 dark:bg-zinc-800">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ scale: 1.02 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="text-white text-2xl" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Testimonials Section */}
      <Testimonials />

      {/* About Us Section */}
      <AboutUs />

      {/* Call-to-Action Section */}
      <CTA />

      {/* Contact Section */}
      <Contact />

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                ExplainMat
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Revolutionizing chemical research with AI-powered insights and
                predictions.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="https://twitter.com/explainmat"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition"
                  aria-label="Twitter"
                >
                  <FaTwitter size={20} />
                </Link>
                <Link
                  href="https://github.com/explainmat"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                  aria-label="GitHub"
                >
                  <FaGithub size={20} />
                </Link>
                <Link
                  href="https://linkedin.com/company/explainmat"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={20} />
                </Link>
                <Link
                  href="https://youtube.com/explainmat"
                  className="text-gray-600 dark:text-gray-400 hover:text-red-600 transition"
                  aria-label="YouTube"
                >
                  <FaYoutube size={20} />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/pages/dashboard"
                    className="hover:text-orange-500 transition"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/data-upload"
                    className="hover:text-orange-500 transition"
                  >
                    Data Upload
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/model-training"
                    className="hover:text-orange-500 transition"
                  >
                    Model Training
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/predictions"
                    className="hover:text-orange-500 transition"
                  >
                    Predictions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/bio-activity"
                    className="hover:text-orange-500 transition"
                  >
                    Bio Activity
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-orange-500 transition"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-orange-500 transition"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="hover:text-orange-500 transition"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-orange-500 transition"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-orange-500 transition"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                Support
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-orange-500 transition"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="hover:text-orange-500 transition"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="hover:text-orange-500 transition"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    href="/status"
                    className="hover:text-orange-500 transition"
                  >
                    System Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} ExplainMat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white dark:bg-zinc-800 rounded-2xl p-6 max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-gray-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FaPlay className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Demo video coming soon...
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default Home;
