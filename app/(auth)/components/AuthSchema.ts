import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자리입니다."),
  username: z.string().min(3, "닉네임을 최소 6자리입니다."),
});

export type SignupSchemaType = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자리입니다."),
});

export type SigninSchemaType = z.infer<typeof signinSchema>;
