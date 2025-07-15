"use client";

import { isLoggedInAtom } from "@/atoms/authAtom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const [isLoaded, setIsLoaded] = useState(false);

  const hiddenOnPaths = ["/signin", "/signup"];
  const shouldHideLoginButton = hiddenOnPaths.includes(pathname);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setIsLoggedIn(true);
      setIsLoaded(true);
    };

    getCurrentUser();
  }, [setIsLoggedIn]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    toast.success("로그아웃 성공!");
  };

  return (
    <header className="flex items-start justify-between">
      <div className="relative w-32 h-20">
        <Link href={"/"}>
          <Image src={"/logo/matchingNoteLogo.png"} alt="logo" fill className="p-2" />
        </Link>
      </div>

      {isLoaded &&
        !shouldHideLoginButton &&
        (isLoggedIn ? (
          <Button type="button" size={"sm"} variant={"destructive"} onClick={handleLogout}>
            로그아웃
          </Button>
        ) : (
          <Link href={"/signin"}>
            <Button type="button" size={"sm"}>
              로그인
            </Button>
          </Link>
        ))}
    </header>
  );
}
