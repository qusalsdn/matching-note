import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserLock } from "lucide-react";
import Link from "next/link";
import { FormProvider, UseFormReturn } from "react-hook-form";
import { FormError } from "./FormError";
import type { AuthSchemaType } from "./AuthSchema";

type Props = {
  cardActionText: string;
  buttonText: string;
  onSubmit: (data: AuthSchemaType) => void;
  methods: UseFormReturn<AuthSchemaType>;
  loading: boolean;
};

export default function AuthForm({ cardActionText, buttonText, onSubmit, methods, loading }: Props) {
  return (
    <FormProvider {...methods}>
      <div className="flex items-center justify-center mt-10">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>
              <UserLock size={33} />
            </CardTitle>

            <CardAction>
              <Link href={cardActionText === "회원가입" ? "/signup" : "signin"} className="hover:underline">
                {cardActionText}
              </Link>
            </CardAction>
          </CardHeader>

          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>이메일</Label>
                <Input type="email" {...methods.register("email", { required: true })} />
                <FormError error={methods.formState.errors.email} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <p>비밀번호</p>
                  {cardActionText === "회원가입" && (
                    <Link href={"#"} className="hover:underline">
                      비밀번호를 잊어버리셨나요?
                    </Link>
                  )}
                </Label>
                <Input type="password" {...methods.register("password", { required: true })} />
                <FormError error={methods.formState.errors.password} />
              </div>
            </CardContent>

            <CardFooter className="mt-5">
              <Button type="submit" className="w-full" disabled={loading}>
                {buttonText}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </FormProvider>
  );
}
