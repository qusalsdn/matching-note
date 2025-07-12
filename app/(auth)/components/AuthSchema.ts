import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  password: z.string().min(6, "비밀번호는 최소 6자리입니다."),
});

export type AuthSchemaType = z.infer<typeof authSchema>;
