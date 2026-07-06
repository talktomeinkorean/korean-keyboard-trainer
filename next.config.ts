import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 같은 와이파이의 휴대폰 등 LAN 기기에서 접속해 테스트할 때,
  // Next.js dev 리소스(HMR/클라이언트 번들)의 cross-origin 차단을 허용한다.
  // 프로덕션(Vercel)에는 영향 없음.
  allowedDevOrigins: ['172.30.1.67'],
};

export default nextConfig;
