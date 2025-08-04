import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify 배포 설정
  trailingSlash: true,
  
  // 이미지 최적화 설정
  images: {
    unoptimized: true, // Netlify에서 정적 익스포트 시 필요
  },
  
  // 환경 변수
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 실험적 기능
  experimental: {
    // 필요시 추가
  },
};

export default nextConfig;
