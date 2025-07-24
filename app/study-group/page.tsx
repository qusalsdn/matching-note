"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import StudyGroupPostCard from "./components/StudyGroupPostCard";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import useSWR from "swr";
import { getUserUuid } from "@/utils/supabase/getUser";
import { useAtom } from "jotai";
import { userUuidAtom } from "@/atoms/authAtom";

function StudyGroup() {
  const router = useRouter();
  const category = useSearchParams().get("category");
  const [userId, setUserId] = useAtom(userUuidAtom);

  useEffect(() => {
    if (!userId) {
      getUserUuid().then((uuid) => uuid && setUserId(uuid));
    }
  }, [setUserId, userId]);

  const fetcher = async (category: string | null) => {
    if (!category) return null;

    const { data } = await supabase
      .from("study_groups")
      .select("*, group_members(*), group_likes(*), group_bookmarks(*)")
      .eq("category", category ?? "")
      .order("pinned_until", { ascending: false })
      .order("created_at", { ascending: false });

    return data;
  };

  const { data, error, mutate } = useSWR(category ?? null, fetcher);

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

  if (!category) return <div className="text-center">페이지를 찾을 수 없습니다...</div>;

  return (
    <div className="space-y-3">
      <section className="flex items-center space-x-1">
        <ChevronLeft size={28} onClick={() => router.back()} className="cursor-pointer" />
        <span className="text-lg font-bold mb-1">{category}</span>
      </section>

      {data?.map((item) => (
        <div key={item.id}>
          <Link href={`/study-group/${item.id}`}>
            <StudyGroupPostCard item={item} handleLike={handleLike} handleBookmark={handleBookmark} />
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
