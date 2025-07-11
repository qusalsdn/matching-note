import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserLock } from "lucide-react";
import Link from "next/link";

export default function Signin() {
  return (
    <div className="flex items-center justify-center mt-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            <UserLock size={33} />
          </CardTitle>

          <CardAction>
            <Link href={"/signup"} className="hover:underline">
              회원가입
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
                <Link href={"#"} className="hover:underline">
                  비밀번호를 잊어버리셨나요?
                </Link>
              </Label>
              <Input type="password" />
            </div>
          </CardContent>

          <CardFooter className="mt-5">
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
