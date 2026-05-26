import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles everything needed to run the app
  // Used by the Docker container to keep image size small
  output: "standalone",

  // Allow images from any https source (for user-submitted image posts)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Silence annoying build warnings for external packages
  serverExternalPackages: [],
};

export default nextConfig;
