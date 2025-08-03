// components/AboutUs.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaBullseye,
  FaUsers,
  FaRocket,
  FaShieldAlt,
  FaGlobe,
  FaAward,
  FaLightbulb,
  FaChartLine,
  FaFlask,
  FaBrain,
} from "react-icons/fa";
import ChemicalBond from "./ChemicalBond";

const AboutUs: React.FC = () => {
  // Animation variants for the container
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for each content block
  const blockVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const values = [
    {
      icon: FaLightbulb,
      title: "Innovation",
      description:
        "Pushing the boundaries of what's possible in chemical AI and visualization",
    },
    {
      icon: FaShieldAlt,
      title: "Trust",
      description:
        "Building reliable, secure, and transparent AI systems for critical research",
    },
    {
      icon: FaUsers,
      title: "Collaboration",
      description:
        "Fostering partnerships between researchers, educators, and industry leaders",
    },
    {
      icon: FaGlobe,
      title: "Impact",
      description:
        "Making advanced chemical tools accessible to researchers worldwide",
    },
  ];

  const achievements = [
    {
      number: "50+",
      label: "Research Papers Published",
      icon: FaAward,
    },
    {
      number: "1000+",
      label: "Active Users",
      icon: FaUsers,
    },
    {
      number: "99.2%",
      label: "Accuracy Rate",
      icon: FaChartLine,
    },
    {
      number: "24/7",
      label: "Support Available",
      icon: FaShieldAlt,
    },
  ];

  return (
    <section id="about-us" className="py-16 bg-gray-50 dark:bg-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-zinc-100 mb-4">
            About ExplainMat
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto">
            We're revolutionizing chemical research through cutting-edge AI,
            advanced visualization, and explainable machine learning.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-12 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Image Section */}
          <motion.div className="lg:w-1/2" variants={blockVariants}>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <FaFlask size={80} className="mb-4" />
                    <h3 className="text-2xl font-bold">Chemical AI Platform</h3>
                    <p className="text-orange-100">
                      Advanced molecular analysis
                    </p>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
            </div>
          </motion.div>

          {/* Text Section */}
          <motion.div className="lg:w-1/2 space-y-8" variants={blockVariants}>
            {/* Our Mission */}
            <div>
              <div className="flex items-center mb-4">
                <FaBullseye size={24} className="text-orange-500 mr-3" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  Our Mission
                </h3>
              </div>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
                To democratize access to advanced chemical AI tools, enabling
                researchers, educators, and industry professionals to accelerate
                discoveries and make breakthrough innovations in drug discovery,
                materials science, and chemical engineering.
              </p>
            </div>

            {/* Our Vision */}
            <div>
              <div className="flex items-center mb-4">
                <FaRocket size={24} className="text-orange-500 mr-3" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  Our Vision
                </h3>
              </div>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
                A world where every chemist and researcher has access to
                powerful AI tools that make complex molecular analysis
                intuitive, accurate, and explainable, leading to faster
                scientific breakthroughs and better understanding of chemical
                processes.
              </p>
            </div>

            {/* Our Team */}
            <div>
              <div className="flex items-center mb-4">
                <FaUsers size={24} className="text-orange-500 mr-3" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">
                  Our Team
                </h3>
              </div>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed">
                A diverse team of chemists, data scientists, software engineers,
                and AI researchers committed to pushing the boundaries of what's
                possible in chemical research and education.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h3
            variants={blockVariants}
            className="text-2xl font-bold text-center text-gray-900 dark:text-zinc-100 mb-8"
          >
            Our Core Values
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={blockVariants}
                className="text-center p-6 bg-white dark:bg-zinc-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-white text-2xl" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                  {value.title}
                </h4>
                <p className="text-gray-600 dark:text-zinc-400 text-sm">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h3
            variants={blockVariants}
            className="text-2xl font-bold text-center text-gray-900 dark:text-zinc-100 mb-8"
          >
            Key Achievements
          </motion.h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={index}
                variants={blockVariants}
                className="text-center p-6 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl text-white"
              >
                <div className="flex justify-center mb-3">
                  <achievement.icon className="text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {achievement.number}
                </div>
                <div className="text-sm opacity-90">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Stack */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h3
            variants={blockVariants}
            className="text-2xl font-bold text-center text-gray-900 dark:text-zinc-100 mb-8"
          >
            Powered by Advanced Technology
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={blockVariants}
              className="text-center p-6 bg-white dark:bg-zinc-700 rounded-xl shadow-lg"
            >
              <FaBrain className="text-4xl text-orange-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                Machine Learning
              </h4>
              <p className="text-gray-600 dark:text-zinc-400">
                State-of-the-art neural networks and deep learning models for
                accurate molecular property predictions.
              </p>
            </motion.div>
            <motion.div
              variants={blockVariants}
              className="text-center p-6 bg-white dark:bg-zinc-700 rounded-xl shadow-lg"
            >
              <FaChartLine className="text-4xl text-orange-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                Data Analytics
              </h4>
              <p className="text-gray-600 dark:text-zinc-400">
                Advanced analytics and visualization tools for comprehensive
                chemical data analysis and interpretation.
              </p>
            </motion.div>
            <motion.div
              variants={blockVariants}
              className="text-center p-6 bg-white dark:bg-zinc-700 rounded-xl shadow-lg"
            >
              <FaFlask className="text-4xl text-orange-500 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-2">
                Chemical Informatics
              </h4>
              <p className="text-gray-600 dark:text-zinc-400">
                Specialized algorithms for molecular structure analysis,
                property calculation, and chemical space exploration.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Chemical Bonds */}
        <ChemicalBond
          from={{ x: "25%", y: "0%" }}
          to={{ x: "25%", y: "100%" }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10"
        />
        <ChemicalBond
          from={{ x: "75%", y: "0%" }}
          to={{ x: "75%", y: "100%" }}
          className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10"
        />
      </div>
    </section>
  );
};

export default AboutUs;
