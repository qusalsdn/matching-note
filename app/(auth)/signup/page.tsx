"use client";

import AuthForm from "../components/AuthForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signupSchema, SignupSchemaType } from "../components/AuthSchema";

export default function Signup() {
  const router = useRouter();
  const methods = useForm({ resolver: zodResolver(signupSchema) });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: SignupSchemaType) => {
    setLoading(true);
    try {
      const { data } = await supabase.from("users").select("*").eq("username", formData.username);

      if (data && data.length > 0) {
        methods.setFocus("username");
        return toast.error("닉네임 이미 존재합니다.");
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.signUp(formData);

      if (user?.role !== "authenticated") return toast.error("이미 가입된 이메일입니다.");
      else if (error) toast.error("오류가 발생했습니다. 다시 시도해주세요.");

      const { error: insertError } = await supabase.from("users").insert({
        user_id: user.id,
        username: formData.username,
      });
      if (insertError?.code === "23505") return toast.error("닉네임이 중복됩니다.");

      toast.success("회원가입 성공! 이메일 인증 후 로그인해주세요.!");

      router.replace("/signin");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm cardActionText="로그인" buttonText="회원가입" onSubmit={onSubmit} methods={methods} loading={loading} />;
}
