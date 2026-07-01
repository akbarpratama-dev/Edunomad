import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // App Router enables React Strict Mode by default, which double-invokes effects
  // in DEV only (production already runs once). That doubled every on-mount fetch
  // during navigation, making dev feel slow. Disabled so dev mirrors production's
  // single invoke. Trade-off: lose Strict Mode's dev-only effect-bug detection.
  reactStrictMode: false,
};

export default nextConfig;
