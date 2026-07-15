import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the Docker/K8s image stays small
  // (only the traced runtime deps are copied, not all of node_modules).
  output: "standalone",
};

export default nextConfig;
