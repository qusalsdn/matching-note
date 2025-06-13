import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

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
      <body className="mx-auto max-w-5xl p-5 lg:px-0">
        <header className="flex items-center justify-center">
          <div className="relative w-32 h-20">
            <Link href={"/"}>
              <Image src={"/logo/matchingNoteLogo.png"} alt="logo" fill className="p-2" />
            </Link>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
