import { supabase } from "@/utils/supabase/client";
import StudyGroupUpdate from "../../components/StudyGroupUpdate";
import { category, status } from "../../types/studyGroup";

export default async function StudyGroupUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase.from("study_groups").select("*").eq("id", Number(id)).single();

  return (
    <StudyGroupUpdate
      data={{
        leader_id: data?.leader_id ?? "",
        group_name: data?.group_name ?? "",
        description: data?.description ?? "",
        category: (data?.category as (typeof category)[number]) ?? "프로그래밍",
        max_members: data?.max_members ?? 2,
        is_online: data?.is_online ?? true,
        status: (data?.status as (typeof status)[number]) ?? "모집 중",
        location: data?.location ?? "",
      }}
      studyGroupId={id}
    />
  );
}
