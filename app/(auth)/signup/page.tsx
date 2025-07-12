"use client";

import AuthForm from "../components/AuthForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authSchema, AuthSchemaType } from "../components/AuthSchema";

export default function Signup() {
  const router = useRouter();
  const methods = useForm({ resolver: zodResolver(authSchema) });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: AuthSchemaType) => {
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
