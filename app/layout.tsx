import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";

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
      <body>
        <Header />
        <main className="mx-auto max-w-5xl px-5 lg:px-0 mt-5">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
