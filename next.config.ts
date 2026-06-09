import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["**.*", "localhost"],
  output: "standalone",
};

export default nextConfig;
