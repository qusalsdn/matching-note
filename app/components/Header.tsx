"use client";

import { isLoggedInAtom } from "@/atoms/authAtom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const searchSchema = z.object({
  search: z.string(),
});

type searchFromData = z.infer<typeof searchSchema>;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
  const form = useForm<searchFromData>({ resolver: zodResolver(searchSchema), defaultValues: { search: "" } });
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
    window.location.href = "/";
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
      <section>
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit(({ search }) => router.push(`/study-group?search=${encodeURIComponent(search)}`))}
            className="flex items-center space-x-2"
          >
            <div className="relative flex items-center flex-grow">
              <Search className="absolute left-3 text-gray-400" size={20} />
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="스터디명, 내용, 카테고리로 검색"
                        className="p-5 rounded-full pl-12 text-sm lg:text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-7 left-5" />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit">검색</Button>

            <Link href={"/study-group/create"}>
              <Button type="button">
                <p className="text-xl">+</p>
              </Button>
            </Link>
          </form>
        </Form>
      </section>
    </header>
  );
}
