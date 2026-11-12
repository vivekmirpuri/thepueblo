import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // static site for Firebase Hosting (free tier); no API routes/SSR
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
