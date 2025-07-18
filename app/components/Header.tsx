"use client";

import { isLoggedInAtom } from "@/atoms/authAtom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import { useAtom } from "jotai";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Header() {
  const router = useRouter();
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
      setIsLoggedIn(user ? true : false);
      setIsLoaded(true);
    };

    getCurrentUser();
  }, [pathname, setIsLoggedIn]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    toast.success("로그아웃 성공!");
    router.replace("/");
  };

  return (
    <header className="mx-auto max-w-5xl px-5 lg:px-0 flex flex-col">
      {/* 로고 및 로그아웃 부분 */}
      <section className="flex items-center justify-between">
        <div className="relative w-32 h-20">
          <Link href={"/"}>
            <Image src={"/logo/matchingNoteLogo.png"} alt="logo" fill className="p-2" />
          </Link>
        </div>

        {isLoaded &&
          !shouldHideLoginButton &&
          (isLoggedIn ? (
            <Button type="button" size={"sm"} onClick={handleLogout} className="bg-rose-500 hover:bg-rose-400">
              로그아웃
            </Button>
          ) : (
            <Link href={"/signin"}>
              <Button type="button" size={"sm"}>
                로그인
              </Button>
            </Link>
          ))}
      </section>

      {/* 검색 및 스터디 그룹 생성 부분 */}
      <section className="flex items-center space-x-3">
        <div className="relative flex items-center flex-grow">
          <Search className="absolute left-3 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="스터디명, 과목, 키워드로 검색"
            className="p-5 rounded-full pl-12 w-full text-sm lg:text-base"
          />
        </div>

        <Button type="submit">검색</Button>

        <Link href={"/study-group/create"}>
          <Button type="button">
            <p className="text-xl">+</p>
          </Button>
        </Link>
      </section>
    </header>
  );
}
