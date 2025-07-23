import { supabase } from "@/utils/supabase/client";
import StudyGroupDetail from "../components/StudyGroupDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase
    .from("study_groups")
    .select("*, group_members(*, users(id, username)), group_likes(*), group_bookmarks(*)")
    .eq("id", Number(id))
    .single();

  return <StudyGroupDetail data={data ?? null} />;
}
