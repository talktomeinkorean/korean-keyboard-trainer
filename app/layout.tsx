import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans, DM_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { SITE_URL } from "@/lib/site";
import { SITE_NAME } from "@/lib/seo";
import "./globals.css";

// GTM 컨테이너. GA4·픽셀 등 실제 태그는 GTM 웹 화면에서 관리한다.
const GTM_ID = "GTM-P9W6Z64Q";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 홈 화면 디자인 폰트 (Figma: DM Sans / DM Mono)
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // OG 이미지 등 상대 경로를 절대 URL 로 바꿀 기준
  metadataBase: new URL(SITE_URL),
  // 아래 값은 자체 메타데이터가 없는 페이지(404 등)의 폴백이다.
  // 실제 페이지는 각자 lib/seo 의 pageMetadata 로 고유한 제목을 붙인다.
  title: SITE_NAME,
  description: "Learn the Korean keyboard, one key at a time.",
  // Search Console 소유권 확인 — 제거하면 소유권이 해제된다.
  // GTM/GA 방식은 스크립트가 클라이언트에서 삽입돼 검증기가 찾지 못하므로 메타 태그를 쓴다.
  verification: { google: "YKbQhezyX2QD0WdIiWsAI4q9rtczLq5ryD2UmMcHGa4" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
    >
      {/* 로컬 개발 트래픽이 집계에 섞이지 않도록 프로덕션에서만 로드 */}
      {process.env.NODE_ENV === "production" && <GoogleTagManager gtmId={GTM_ID} />}
      <body className="min-h-full flex flex-col">
        {/* PC 에서도 모바일과 같은 화면을 보여주기 위해 시안 폭으로 고정한다 */}
        <div className="mx-auto flex w-full max-w-[var(--app-width)] flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
