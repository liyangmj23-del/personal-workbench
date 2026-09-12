import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["jsdom", "@mozilla/readability"],
  agentRules: false,
  devIndicators: false,
};

export default nextConfig;
