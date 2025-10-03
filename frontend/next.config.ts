import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://43.205.121.157:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;
