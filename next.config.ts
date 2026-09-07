import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 같은 와이파이의 휴대폰 등 LAN 기기에서 접속해 테스트할 때,
  // Next.js dev 리소스(HMR/클라이언트 번들)의 cross-origin 차단을 허용한다.
  // 프로덕션(Vercel)에는 영향 없음.
  allowedDevOrigins: ['172.30.1.67'],

  // OG 이미지는 assets/ 의 폰트와 png 를 런타임에 읽는다. 경로를 변수로 넘기는 탓에
  // @vercel/nft 의 정적 분석이 못 잡을 수 있어 배포 번들에 직접 포함시킨다.
  outputFileTracingIncludes: {
    '/result/**': ['./assets/**'],
  },
  // Basics 를 시안대로 3개 레슨으로 합치면서 예전 레슨 주소 7개가 사라졌다.
  // 이미 색인됐을 수 있어 합쳐진 레슨으로 영구 이동시킨다.
  async redirects() {
    return [
      { source: '/lesson/c1', destination: '/lesson/consonants', permanent: true },
      { source: '/lesson/c2', destination: '/lesson/consonants', permanent: true },
      { source: '/lesson/c3', destination: '/lesson/consonants', permanent: true },
      { source: '/lesson/v1', destination: '/lesson/vowels', permanent: true },
      { source: '/lesson/v2', destination: '/lesson/vowels', permanent: true },
      { source: '/lesson/s1', destination: '/lesson/syllables', permanent: true },
      { source: '/lesson/s2', destination: '/lesson/syllables', permanent: true },
    ];
  },
};

export default nextConfig;
