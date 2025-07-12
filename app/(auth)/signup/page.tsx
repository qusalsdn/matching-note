"use client";

import { z } from "zod";
import AuthForm from "../components/AuthForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface Auth {
  email: string;
  password: string;
}

export const schema = z.object({
  email: z.string().email("유효한 이메일 형식을 입력해주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자리 입니다."),
});

export default function Signup() {
  const router = useRouter();
  const methods = useForm({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: Auth) => {
    setLoading(true);

    const { error, data } = await supabase.auth.signUp(formData);

    setLoading(false);

    if (data.user?.role !== "authenticated") return toast.error("이미 가입된 이메일입니다.");
    else if (error) toast.error("오류가 발생했습니다. 다시 시도해주세요.");

    toast.success("회원가입 성공! 이메일 인증 후 로그인해주세요.!");

    router.replace("/signin");
  };

  return <AuthForm cardActionText="로그인" buttonText="회원가입" onSubmit={onSubmit} methods={methods} loading={loading} />;
}
