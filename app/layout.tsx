import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
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

export const metadata: Metadata = {
  title: "Korean Typing Practice",
  description: "Learn the Korean keyboard, one key at a time.",
  // Search Console 소유권 확인 — 제거하면 소유권이 해제된다.
  // GTM/GA 방식은 스크립트가 클라이언트에서 삽입돼 검증기가 찾지 못하므로 메타 태그를 쓴다.
  verification: { google: "zsgncQrO1UOJmG_cT-B71jCvjCfQOIFhU8cPHzO5-b4" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* 로컬 개발 트래픽이 집계에 섞이지 않도록 프로덕션에서만 로드 */}
      {process.env.NODE_ENV === "production" && <GoogleTagManager gtmId={GTM_ID} />}
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
