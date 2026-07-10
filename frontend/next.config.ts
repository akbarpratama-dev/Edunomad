import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // npm-workspaces monorepo: deps hoist to the repo root, not `frontend/node_modules`.
  // The file tracer must root at the monorepo base (one level up) so it bundles the
  // hoisted `node_modules` into each serverless function. Pinning this to `frontend/`
  // dropped lazily-required files like `next/dist/compiled/source-map`, 500ing every
  // dynamically-rendered route on Vercel ("Cannot find module … source-map"). See D-DEPLOY-3.
  outputFileTracingRoot: path.join(__dirname, ".."),
  // App Router enables React Strict Mode by default, which double-invokes effects
  // in DEV only (production already runs once). That doubled every on-mount fetch
  // during navigation, making dev feel slow. Disabled so dev mirrors production's
  // single invoke. Trade-off: lose Strict Mode's dev-only effect-bug detection.
  reactStrictMode: false,
};

export default nextConfig;
