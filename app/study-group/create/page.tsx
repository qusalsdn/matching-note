"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWatch } from "react-hook-form";

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { getUserId } from "@/utils/supabase/getUser";
import { useRouter } from "next/navigation";

const category = ["프로그래밍", "외국어", "자격증", "독서", "취업/이직", "디자인", "운동", "기타"] as const;
const status = ["모집 중", "진행 중", "종료"] as const;

const groupSchema = z
  .object({
    leader_id: z.coerce.number().min(1),
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

type GroupFormData = z.infer<typeof groupSchema>;

export default function GroupForm() {
  const router = useRouter();
  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      leader_id: 0,
      group_name: "",
      description: "",
      category: "프로그래밍",
      max_members: 2,
      is_online: true,
      location: undefined,
      status: "모집 중",
    },
  });
  const [userId, setUserId] = useState(0);
  const [loading, setLoading] = useState(false);

  const isOnline = useWatch({
    control: form.control,
    name: "is_online",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await getUserId();
      if (typeof userId === "number") {
        setUserId(userId);
        form.setValue("leader_id", userId);
      }
    };

    fetchUser();
  }, [form]);

  const onSubmit = async (formData: GroupFormData) => {
    setLoading(true);
    try {
      const { data: insertedGroups, error: insertGroupError } = await supabase.from("study_groups").insert(formData).select();
      if (insertGroupError) return toast.error("스터디 생성 중 오류가 발생하였습니다..ㅜ");

      const groupId = insertedGroups[0].id;

      const { error: insertMemberError } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: userId, role: "리더" });
      if (insertMemberError) return toast.error("스터디 멤버 생성 중 오류가 발생하였습니다..ㅜ");

      toast.success("스터디 그룹 생성 완료!");

      router.replace(`/study-group/${groupId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5 border rounded-xl shadow-sm">
        <FormField
          control={form.control}
          name="group_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>스터디 그룹명</FormLabel>
              <FormControl>
                <Input placeholder="스터디 그룹명을 입력해주세요." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => {
            const currentLength = field.value.length;
            return (
              <FormItem>
                <FormLabel>스터디 설명</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea placeholder="스터디에 대한 설명을 입력하세요" {...field} maxLength={200} />
                    <p className="absolute right-0 text-sm text-muted-foreground mt-1">{currentLength}/200</p>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {category.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_members"
          render={({ field }) => (
            <FormItem>
              <FormLabel>최대 인원</FormLabel>
              <FormControl>
                <Input type="number" placeholder="예: 10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_online"
          render={({ field }) => (
            <FormItem className="flex items-center">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="font-normal">온라인 여부</FormLabel>
            </FormItem>
          )}
        />

        {!isOnline && (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>오프라인 장소</FormLabel>
                <FormControl>
                  <Input placeholder="장소 입력" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>그룹 상태</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="모집 중">모집 중</SelectItem>
                  <SelectItem value="진행 중">진행 중</SelectItem>
                  <SelectItem value="종료">종료</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button type="submit" disabled={loading} className="w-full">
            스터디 생성
          </Button>

          <Button type="button" onClick={() => router.back()} className="w-full bg-rose-500 hover:bg-rose-400 mt-2">
            취소
          </Button>
        </div>
      </form>
    </Form>
  );
}
