import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 멀티스테이지 빌드용 — 런타임 슬림화 (Dockerfile runner 단계에서 .next/standalone 복사).
  // 로컬 npm run dev/build엔 영향 없음.
  output: "standalone",
};

export default nextConfig;
