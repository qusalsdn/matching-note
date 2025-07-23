"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import StudyGroupPostCard from "./category/components/StudyGroupPostCard";
import { Database } from "@/utils/supabase/types";
import toast from "react-hot-toast";

export type StudyGroup = Database["public"]["Tables"]["study_groups"]["Row"] & {
  group_members: Database["public"]["Tables"]["group_members"]["Row"][];
  group_likes: Database["public"]["Tables"]["group_likes"]["Row"][];
  group_bookmarks: Database["public"]["Tables"]["group_bookmarks"]["Row"][];
};

export default function StudyGroup() {
  const category = useSearchParams().get("category");
  const [data, setData] = useState<StudyGroup[]>([]);

  useEffect(() => {
    if (!category) return;

    const fetchStudyGroup = async () => {
      const { data, error } = await supabase
        .from("study_groups")
        .select("*, group_members(*), group_likes(*), group_bookmarks(*)")
        .eq("category", category)
        .order("pinned_until", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        return toast.error("서버에 오류가 발생하였습니다...ㅠ");
      }

      setData(data);
    };

    fetchStudyGroup();
  }, [category]);

  if (!category) return <div className="text-center">페이지를 찾을 수 없습니다...</div>;

  return (
    <section className="space-y-3">
      {data.map((item) => (
        <StudyGroupPostCard key={item.id} item={item} />
      ))}
    </section>
  );
}
