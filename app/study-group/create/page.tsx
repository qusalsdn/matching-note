"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { getUserUuid } from "@/utils/supabase/getUser";
import { useRouter } from "next/navigation";
import { StudyGroupFormData, groupSchema } from "../types/studyGroup";
import { StudyGroupForm } from "../components/StudyGroupForm";

export default function StudyGroupCreate() {
  const router = useRouter();
  const form = useForm<StudyGroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      leader_id: "",
      group_name: "",
      description: "",
      category: "프로그래밍",
      max_members: 2,
      is_online: true,
      location: undefined,
      status: "모집 중",
    },
  });
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = await getUserUuid();

      if (typeof userId !== "string") return;

      setUserId(userId);
      form.setValue("leader_id", userId);
    };

    fetchUser();
  }, [form]);

  const onSubmit = async (formData: StudyGroupFormData) => {
    setLoading(true);
    try {
      const { data: insertedGroups, error: insertGroupError } = await supabase
        .from("study_groups")
        .insert(formData)
        .select()
        .single();

      if (insertGroupError) return toast.error("스터디 생성 중 오류가 발생하였습니다..ㅜ");

      const groupId = insertedGroups.id;

      const { error: insertMemberError } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: userId, role: "리더" });

      if (insertMemberError) return toast.error("스터디 멤버 생성 중 오류가 발생하였습니다..ㅜ");

      const { data: chatRoom, error: chatRoomError } = await supabase
        .from("chat_rooms")
        .insert({
          group_id: groupId,
          room_name: formData.group_name,
          is_private: false,
        })
        .select("id")
        .single();

      if (chatRoomError) return toast.error("채팅방 생성 중 오류가 발생하였습니다..ㅜ");

      const { error: chatParticipantsError } = await supabase
        .from("chat_participants")
        .insert({ room_id: chatRoom?.id ?? 0, user_id: userId });

      if (chatParticipantsError) return toast.error("채팅방 멤버 생성 중 오류가 발생하였습니다..ㅜ");

      toast.success("스터디 그룹 생성 완료!");

      router.replace(`/study-group/${groupId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return <StudyGroupForm router={router} form={form} onSubmit={onSubmit} submitButtonLabel="스터디 생성" loading={loading} />;
}
