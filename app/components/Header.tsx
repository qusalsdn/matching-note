"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const hiddenOnPaths = ["/signin", "/signup"];
  const shouldHideLoginButton = hiddenOnPaths.includes(pathname);

  return (
    <header className="flex items-start justify-between">
      <div className="relative w-32 h-20">
        <Link href={"/"}>
          <Image src={"/logo/matchingNoteLogo.png"} alt="logo" fill className="p-2" />
        </Link>
      </div>

      {!shouldHideLoginButton && (
        <Link href={"/signin"}>
          <Button type="button" size={"sm"}>
            로그인
          </Button>
        </Link>
      )}
    </header>
  );
}
