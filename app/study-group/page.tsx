"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/utils/supabase/client";
import StudyGroupPostCard from "./components/StudyGroupPostCard";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import useSWR from "swr";
import { useUserId } from "../hooks/useUserId";

function StudyGroup() {
  const router = useRouter();
  const category = useSearchParams().get("category");
  const search = useSearchParams().get("search");
  const userId = useUserId();

  const fetcher = async (category: string | null, search: string | null) => {
    if (category) {
      let query = supabase.from("study_groups").select("*, group_members(*), group_likes(*), group_bookmarks(*)");

      if (category !== "ALL") {
        query = query.eq("category", category);
      }

      const { data } = await query.order("pinned_until", { ascending: false }).order("created_at", { ascending: false });

      return data;
    }

    if (search) {
      const { data } = await supabase
        .from("study_groups")
        .select("*, group_members(*), group_likes(*), group_bookmarks(*)")
        .or(`group_name.ilike.%${search}%, description.ilike.%${search}%, category.ilike.%${search}%`);

      return data;
    }

    return null;
  };

  const { data, error, mutate } = useSWR([category, search], ([category, search]) => fetcher(category, search));

  if (error) {
    console.error(error);
    return toast.error("서버에 오류가 발생하였습니다...ㅠ");
  }

  const toggleItem = async ({
    studyGroupId,
    key,
    table,
  }: {
    studyGroupId: number;
    key: "group_likes" | "group_bookmarks";
    table: "group_likes" | "group_bookmarks";
  }) => {
    if (!userId) return toast.error("로그인을 해주세요.!");
    if (!data) return;

    mutate(
      async () => {
        const isToggled = data?.find((group) => group.id === studyGroupId)?.[key].some((item) => item.user_id === userId);

        const updatedData = data?.map((group) => {
          if (group.id === studyGroupId) {
            return {
              ...group,
              [key]: isToggled
                ? group[key].filter((item) => item.user_id !== userId)
                : [...group[key], { group_id: studyGroupId, user_id: userId }],
            };
          }
          return group;
        });

        const supabaseOp = isToggled
          ? supabase.from(table).delete().eq("group_id", studyGroupId).eq("user_id", userId)
          : supabase.from(table).insert({ group_id: studyGroupId, user_id: userId });

        const { error } = await supabaseOp;
        if (error) throw error;

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );
  };

  const handleLike = (id: number) => toggleItem({ studyGroupId: id, key: "group_likes", table: "group_likes" });
  const handleBookmark = (id: number) => toggleItem({ studyGroupId: id, key: "group_bookmarks", table: "group_bookmarks" });

  const increaseViewCount = async (id: number, viewCount: number) => {
    const { error } = await supabase.from("study_groups").update({ view_count: ++viewCount }).eq("id", id);
    if (error) return console.error(error);
  };

  if (!category && !search) return <div className="text-center">페이지를 찾을 수 없습니다...</div>;

  return (
    <div className="space-y-3">
      <section className="flex items-center space-x-1">
        <ChevronLeft size={28} onClick={() => router.back()} className="cursor-pointer" />
        {category && <span className="text-lg font-bold mb-1">{category}</span>}
      </section>

      {data?.map((item) => (
        <div key={item.id}>
          <Link href={`/study-group/${item.id}`}>
            <StudyGroupPostCard
              item={item}
              handleLike={handleLike}
              handleBookmark={handleBookmark}
              increaseViewCount={increaseViewCount}
            />
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function StudyGroupPage() {
  return (
    <Suspense>
      <StudyGroup />
    </Suspense>
  );
}
