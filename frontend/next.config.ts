import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build de produção enxuto para Docker (Dockerfile.prod gera .next/standalone/server.js)
  output: "standalone",
};

export default nextConfig;
