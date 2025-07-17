import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserLock } from "lucide-react";
import Link from "next/link";
import { FieldError, FieldValues, FormProvider, Path, UseFormReturn } from "react-hook-form";
import { FormError } from "./FormError";

type Props<T extends FieldValues> = {
  cardActionText: string;
  buttonText: string;
  onSubmit: (data: T) => void;
  methods: UseFormReturn<T>;
  loading: boolean;
};

export default function AuthForm<T extends FieldValues>({ cardActionText, buttonText, onSubmit, methods, loading }: Props<T>) {
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
                <Input type="email" {...methods.register("email" as Path<T>, { required: true })} />
                <FormError error={methods.formState.errors.email as FieldError} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  <p>비밀번호</p>
                  {buttonText === "로그인" && (
                    <Link href={"#"} className="hover:underline">
                      비밀번호를 잊어버리셨나요?
                    </Link>
                  )}
                </Label>
                <Input type="password" {...methods.register("password" as Path<T>, { required: true })} />
                <FormError error={methods.formState.errors.password as FieldError} />
              </div>

              {buttonText === "회원가입" && (
                <div className="space-y-2">
                  <Label>닉네임</Label>
                  <Input type="text" {...methods.register("username" as Path<T>, { required: true })} />
                  <FormError error={methods.formState.errors.username as FieldError} />
                </div>
              )}
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
