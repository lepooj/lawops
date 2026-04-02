import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "tesseract.js", "heic-convert"],
  outputFileTracingRoot: path.join(import.meta.dirname),
};

export default nextConfig;
