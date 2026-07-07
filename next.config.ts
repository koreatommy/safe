import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/yangju",
        destination: "/info",
        permanent: true,
      },
      {
        source: "/yangju/water-play202606",
        destination: "/report/yangju/water-play202606",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
