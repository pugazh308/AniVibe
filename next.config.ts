import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Omit the `X-Powered-By: Next.js` response header.
  poweredByHeader: false,
};

export default nextConfig;
