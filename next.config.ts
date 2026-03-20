import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Cursor 등 IDE가 React props를 직렬화할 때 Promise params를 열거하면서 발생하는 경고 무시
    internal_disableSyncDynamicAPIWarnings: true,
  },
};

export default nextConfig;
