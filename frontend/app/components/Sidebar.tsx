"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import StarsIcon from "@/public/stars.svg";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdDashboard,
  MdCloudUpload,
  MdBarChart,
  MdLightbulb,
  MdSettings,
  MdPerson,
  MdLock,
  MdMenu,
  MdClose,
} from "react-icons/md";

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  customIcon,
  className,
  onClick,
}: {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  customIcon?: string;
  className?: string;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`relative group flex items-center space-x-4 py-4 px-4 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-600/20 to-blue-800/20 text-blue-400 border border-blue-500/30"
            : "hover:bg-zinc-800/50 text-gray-300 hover:text-white"
        } ${className}`}
      >
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-l-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {customIcon ? (
          <Image
            src={customIcon}
            alt={`${label} Icon`}
            width={24}
            height={24}
            className={`transition-colors duration-200 ${
              isActive
                ? "text-blue-400"
                : "text-gray-400 group-hover:text-white"
            }`}
          />
        ) : (
          Icon && (
            <Icon
              className={`h-6 w-6 transition-colors duration-200 ${
                isActive
                  ? "text-blue-400"
                  : "text-gray-400 group-hover:text-white"
              }`}
            />
          )
        )}
        <span
          className={`text-base font-medium transition-colors duration-200 ${
            isActive ? "text-blue-400" : "text-gray-300 group-hover:text-white"
          }`}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
};

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    {
      href: "/pages/dashboard",
      icon: MdDashboard,
      label: "Dashboard",
      className: "sidebar-dashboard",
    },
    {
      href: "/pages/data-upload",
      icon: MdCloudUpload,
      label: "Data Upload",
      className: "sidebar-data-upload",
    },
    {
      href: "/pages/model-training",
      label: "Model Training",
      customIcon: StarsIcon,
      className: "sidebar-model-training",
    },
    {
      href: "/pages/generative",
      icon: MdBarChart,
      label: "Generated Molecules",
      className: "sidebar-generated-molecules",
    },
    {
      href: "/pages/predictions",
      icon: MdLightbulb,
      label: "Predictions",
      className: "sidebar-predictions",
    },
    {
      href: "/pages/bio-activity",
      icon: MdLightbulb,
      label: "Bio Activity",
      className: "sidebar-bio-activity",
    },
    {
      href: "/pages/math-based-calculation",
      icon: MdBarChart,
      label: "Math Calculations",
      className: "sidebar-math-calculations",
    },
    {
      href: "/pages/model-predicting",
      icon: MdLightbulb,
      label: "Model Predicting",
      className: "sidebar-model-predicting",
    },
    {
      href: "/dashboard/settings",
      icon: MdSettings,
      label: "Settings",
      className: "sidebar-settings",
    },
    {
      href: "/dashboard/profile",
      icon: MdPerson,
      label: "Profile",
      className: "sidebar-profile",
    },
    {
      href: "/sign-in",
      icon: MdLock,
      label: "Sign In",
      className: "sidebar-sign-in",
    },
  ];

  return (
    <>
      {/* Mobile Menu Button - Only show on mobile */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-zinc-800 rounded-lg text-white hover:bg-zinc-700 transition-colors duration-200 shadow-lg"
        >
          {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <div className="fixed left-0 top-0 w-64 bg-gradient-to-b from-zinc-900 to-zinc-800 text-gray-100 min-h-screen border-r border-zinc-700/50 shadow-2xl z-40">
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="hidden lg:block h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-zinc-700/50">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold text-center text-white"
            >
              Explain Mat
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-center text-gray-400 mt-2"
            >
              AI-Powered Molecular Analysis
            </motion.p>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <AnimatePresence>
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SidebarLink
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    customIcon={item.customIcon}
                    className={item.className}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </nav>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-700/50">
            <div className="text-center">
              <p className="text-xs text-gray-500">© 2024 Explain Mat</p>
              <p className="text-xs text-gray-600 mt-1">Version 1.0.0</p>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar - Slide in from left */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 z-50 w-64 h-full bg-gradient-to-b from-zinc-900 to-zinc-800 text-gray-100 border-r border-zinc-700/50 shadow-2xl"
            >
              {/* Logo Section */}
              <div className="p-6 border-b border-zinc-700/50">
                <motion.h2
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl font-bold text-center text-white"
                >
                  Explain Mat
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-center text-gray-400 mt-2"
                >
                  AI-Powered Molecular Analysis
                </motion.p>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                <AnimatePresence>
                  {navigationItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <SidebarLink
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        customIcon={item.customIcon}
                        className={item.className}
                        onClick={closeMobileMenu}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </nav>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-700/50">
                <div className="text-center">
                  <p className="text-xs text-gray-500">© 2024 Explain Mat</p>
                  <p className="text-xs text-gray-600 mt-1">Version 1.0.0</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Sidebar;
