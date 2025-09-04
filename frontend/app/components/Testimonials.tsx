// components/Testimonials.tsx
"use client";

import { motion } from "framer-motion";
import {
  FaQuoteLeft,
  FaQuoteRight,
  FaStar,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import Image from "next/image";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  rating: number;
  social: {
    linkedin?: string;
    twitter?: string;
  };
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      quote:
        "ExplainMat has revolutionized our drug discovery process. The AI predictions are incredibly accurate, and the 3D visualizations help us understand molecular interactions like never before. We've accelerated our research timeline by 40%.",
      name: "Dr. Sarah Chen",
      title: "Senior Research Scientist",
      company: "Pfizer",
      avatar: "/avatars/sarah-chen.jpg",
      rating: 5,
      social: {
        linkedin: "https://linkedin.com/in/sarah-chen",
        twitter: "https://twitter.com/sarahchen",
      },
    },
    {
      quote:
        "As a chemistry professor, I've been searching for tools that can make complex molecular concepts accessible to students. ExplainMat's interactive visualizations and AI explanations have transformed how I teach organic chemistry.",
      name: "Prof. Michael Rodriguez",
      title: "Associate Professor",
      company: "MIT",
      avatar: "/avatars/michael-rodriguez.jpg",
      rating: 5,
      social: {
        linkedin: "https://linkedin.com/in/michael-rodriguez",
      },
    },
    {
      quote:
        "The explainable AI features are game-changing for our research. We can now understand why certain compounds show specific properties, which helps us design better molecules. The platform is intuitive and powerful.",
      name: "Dr. Emily Watson",
      title: "Lead Chemist",
      company: "Merck",
      avatar: "/avatars/emily-watson.jpg",
      rating: 5,
      social: {
        linkedin: "https://linkedin.com/in/emily-watson",
        twitter: "https://twitter.com/emilywatson",
      },
    },
    {
      quote:
        "ExplainMat's real-time analytics and monitoring capabilities have streamlined our workflow significantly. The batch processing feature saves us hours of work, and the results are consistently reliable.",
      name: "Dr. James Kim",
      title: "Research Director",
      company: "Novartis",
      avatar: "/avatars/james-kim.jpg",
      rating: 5,
      social: {
        linkedin: "https://linkedin.com/in/james-kim",
      },
    },
    {
      quote:
        "The molecular visualization tools are exceptional. Being able to rotate, zoom, and manipulate 3D structures in real-time has given us insights we couldn't get from static images. Highly recommend for any chemistry lab.",
      name: "Dr. Lisa Thompson",
      title: "Principal Investigator",
      company: "Stanford University",
      avatar: "/avatars/lisa-thompson.jpg",
      rating: 5,
      social: {
        linkedin: "https://linkedin.com/in/lisa-thompson",
        twitter: "https://twitter.com/lisathompson",
      },
    },
    {
      quote:
        "We've integrated ExplainMat into our high school chemistry curriculum, and the results are amazing. Students are more engaged and understand complex concepts much better with the interactive visualizations.",
      name: "Jennifer Park",
      title: "Chemistry Teacher",
      company: "St. Paul's High School",
      avatar: "/avatars/jennifer-park.jpg",
      rating: 5,
      social: {
        linkedin: "https://linkedin.com/in/jennifer-park",
      },
    },
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

  // Animation variants for each testimonial card
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`${
          index < rating ? "text-yellow-400" : "text-gray-300"
        } text-sm`}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-16 bg-gray-50 dark:bg-zinc-900">
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
            Trusted by Leading Researchers
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-zinc-400 max-w-3xl mx-auto">
            See how ExplainMat is transforming chemical research and education
            across the globe.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-zinc-700 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-zinc-600"
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              {/* Quote Icon */}
              <div className="flex justify-start mb-4">
                <FaQuoteLeft className="text-orange-500 text-2xl" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {testimonial.rating}.0
                </span>
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 dark:text-zinc-300 italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-zinc-100">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">
                      {testimonial.title}
                    </p>
                    <p className="text-sm text-orange-500 font-medium">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-2">
                  {testimonial.social.linkedin && (
                    <a
                      href={testimonial.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin size={16} />
                    </a>
                  )}
                  {testimonial.social.twitter && (
                    <a
                      href={testimonial.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      aria-label="Twitter"
                    >
                      <FaTwitter size={16} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-lg text-gray-600 dark:text-zinc-400 mb-4">
            Join thousands of researchers already using ExplainMat
          </p>
          <a
            href="/pages/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300 shadow-lg"
          >
            Start Your Free Trial
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
