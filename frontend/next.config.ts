import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Remove optimizeCss as it requires critters module
    // optimizeCss: true,
  },
  optimizePackageImports: [
    "react-icons",
    "framer-motion",
    "recharts",
    "react-plotly.js",
  ],
  images: {
    domains: ["localhost"],
    formats: ["image/webp", "image/avif"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  swcMinify: true,
  output: "standalone",
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  // Removed redirect to allow root path (/) to be the entry point
  webpack: (config, { isServer }) => {
    // Handle Node.js modules in client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Mark plotly.js as external for server-side builds to prevent SSR issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("plotly.js-basic-dist");
    }

    return config;
  },
};

export default nextConfig;
