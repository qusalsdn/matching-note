"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { groupSchema, StudyGroupFormData } from "../types/studyGroup";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { StudyGroupForm } from "./StudyGroupForm";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";

export default function StudyGroupUpdate({ data, studyGroupId }: { data: StudyGroupFormData; studyGroupId: string }) {
  const router = useRouter();
  const form = useForm<StudyGroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: data,
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: StudyGroupFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("study_groups").update(formData).eq("id", Number(studyGroupId));
      if (error) return toast.error("스터디 그룹 수정 중 에러가 발생하였습니다..ㅜ");

      toast.success("스터디 그룹 수정 완료!");

      router.replace(`/study-group/${studyGroupId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudyGroupForm
      router={router}
      form={form}
      onSubmit={onSubmit}
      submitButtonLabel="스터디 수정"
      loading={loading}
      isEditMode={true}
    />
  );
}
