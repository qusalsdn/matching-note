"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserLock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthForm() {
  const pathname = usePathname().replace("/", "");
  console.log(pathname);

  return (
    <div className="flex items-center justify-center mt-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            <UserLock size={33} />
          </CardTitle>

          <CardAction>
            <Link href={pathname === "signin" ? "/signup" : "signin"} className="hover:underline">
              {pathname === "signin" ? "회원가입" : "로그인"}
            </Link>
          </CardAction>
        </CardHeader>

        <form>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>이메일</Label>
              <Input type="email" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <p>비밀번호</p>
                {pathname === "signin" && (
                  <Link href={"#"} className="hover:underline">
                    비밀번호를 잊어버리셨나요?
                  </Link>
                )}
              </Label>
              <Input type="password" />
            </div>
          </CardContent>

          <CardFooter className="mt-5">
            <Button type="submit" className="w-full">
              {pathname === "signin" ? "로그인" : "회원가입"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
