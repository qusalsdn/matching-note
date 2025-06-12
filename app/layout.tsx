import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "매칭노트 | 스터디 그룹 매칭 플랫폼",
  description: "스터디 그룹을 쉽게 찾기 위한 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
