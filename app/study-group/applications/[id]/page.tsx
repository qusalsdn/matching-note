"use client";

import { useUserId } from "@/app/hooks/useUserId";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const status = ["대기", "승인", "거절"] as const;

const applicationsSchema = z.object({
  group_id: z.number(),
  applicant_id: z.string(),
  application_message: z
    .string()
    .min(3, "신청 메시지는 3~200자 이내여야 합니다.")
    .max(200, "신청 메시지는 3~200자 이내여야 합니다."),
  status: z.enum(status),
});

type applicationsFormData = z.infer<typeof applicationsSchema>;

export default function StudyGroupApplications({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const userId = useUserId();
  const form = useForm<applicationsFormData>({
    resolver: zodResolver(applicationsSchema),
    defaultValues: { group_id: Number(id), applicant_id: userId, application_message: "", status: "대기" },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: applicationsFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("group_applications").insert(data);
      if (error) return toast.error("스터디 신청 중 오류가 발생했습니다..ㅜ");
      router.replace(`/study-group/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>스터디 그룹 가입 신청</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
            <FormField
              control={form.control}
              name="application_message"
              render={({ field }) => {
                const currentLength = field.value.length;
                return (
                  <FormItem>
                    <FormLabel>신청 메시지</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea placeholder="신청 메시지를 입력하세요" {...field} maxLength={200} />
                        <p className="absolute right-0 text-sm text-muted-foreground">{currentLength}/200</p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <div>
              <Button type="submit" disabled={loading} className="w-full">
                신청
              </Button>

              <Button type="button" onClick={() => router.back()} className="w-full bg-rose-500 hover:bg-rose-400 mt-2">
                취소
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
