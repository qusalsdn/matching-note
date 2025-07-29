import { z } from "zod";

export const category = ["프로그래밍", "외국어", "자격증", "독서", "취업/이직", "디자인", "운동", "기타"] as const;
export const status = ["모집 중", "진행 중", "종료"] as const;

export const groupSchema = z
  .object({
    leader_id: z.string(),
    group_name: z
      .string()
      .min(3, "스터디 그룹 이름은 3~30자 이내여야 합니다.")
      .max(30, "스터디 그룹 이름은 3~30자 이내여야 합니다."),
    description: z.string().min(3, "스터디 설명은 3~30자 이내여야 합니다.").max(200, "스터디 설명은 3~30자 이내여야 합니다."),
    category: z.enum(category),
    max_members: z.coerce.number().min(2, "인원은 본인 포함 최소 2명 이상이어야 합니다."),
    is_online: z.boolean(),
    location: z.string().max(30).optional(),
    status: z.enum(status),
  })
  .superRefine((data, ctx) => {
    if (!data.is_online && (!data.location || data.location.trim().length < 3 || data.location.trim().length > 30)) {
      ctx.addIssue({
        path: ["location"],
        code: z.ZodIssueCode.custom,
        message: "오프라인 장소는 3~30자 이내여야 합니다.",
      });
    }
  });

export type StudyGroupFormData = z.infer<typeof groupSchema>;
