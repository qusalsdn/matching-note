"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import AuthForm from "../components/AuthForm";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { signinSchema, SigninSchemaType } from "../components/AuthSchema";
import { useSetAtom } from "jotai";
import { isLoggedInAtom } from "@/atoms/authAtom";
import toast from "react-hot-toast";

export default function Signin() {
  const methods = useForm({ resolver: zodResolver(signinSchema) });
  const setIsLoggedInAtom = useSetAtom(isLoggedInAtom);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: SigninSchemaType) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(formData);

      if (error) {
        switch (error.message) {
          case "Invalid login credentials":
            toast.error("이메일 또는 비밀번호가 잘못되었습니다.");
            return;
          case "Email not confirmed":
            toast.error("이메일 인증이 필요합니다.");
            return;
          default:
            toast.error("오류가 발생했습니다. 다시 시도해주세요.");
            return;
        }
      }

      setIsLoggedInAtom(true);

      toast.success("로그인 성공!");

      window.location.href = "/";
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return <AuthForm cardActionText="회원가입" buttonText="로그인" onSubmit={onSubmit} methods={methods} loading={loading} />;
}
