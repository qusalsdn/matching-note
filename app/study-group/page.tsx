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
    const fetchUserId = async () => {
      const userUuid = await getUserUuid();

      if (userUuid) setUserId(userUuid);
    };

    fetchUserId();
  }, [setUserId]);

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

  const handleLike = async (studyGroupId: number) => {
    mutate(
      async () => {
        const isLiked = data
          ?.find((studyGroup) => studyGroup.id === studyGroupId)
          ?.group_likes.some((like) => like.user_id === userId);

        const updatedData = data?.map((studyGroup) => {
          if (studyGroup.id === studyGroupId) {
            if (!isLiked) {
              return {
                ...studyGroup,
                group_likes: [...studyGroup.group_likes, { group_id: studyGroupId, user_id: userId }],
              };
            } else {
              return {
                ...studyGroup,
                group_likes: studyGroup.group_likes.filter((like) => like.user_id !== userId),
              };
            }
          }
          return studyGroup;
        });

        if (!isLiked) {
          const { error } = await supabase.from("group_likes").insert({ group_id: studyGroupId, user_id: userId });
          if (error) {
            console.error(error);
            throw error;
          }
        } else {
          const { error } = await supabase.from("group_likes").delete().eq("group_id", studyGroupId).eq("user_id", userId);
          if (error) {
            console.error(error);
            throw error;
          }
        }

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );
  };

  const handleBookmark = async (studyGroupId: number) => {
    mutate(
      async () => {
        const isBookmarked = data
          ?.find((studyGroup) => studyGroup.id === studyGroupId)
          ?.group_bookmarks.some((bookmark) => bookmark.user_id === userId);

        const updatedData = data?.map((studyGroup) => {
          if (studyGroup.id === studyGroupId) {
            if (!isBookmarked) {
              return {
                ...studyGroup,
                group_bookmarks: [...studyGroup.group_bookmarks, { group_id: studyGroupId, user_id: userId }],
              };
            } else {
              return {
                ...studyGroup,
                group_bookmarks: studyGroup.group_bookmarks.filter((bookmark) => bookmark.user_id !== userId),
              };
            }
          }
          return studyGroup;
        });

        if (!isBookmarked) {
          const { error } = await supabase.from("group_bookmarks").insert({ group_id: studyGroupId, user_id: userId });
          if (error) {
            console.error(error);
            throw error;
          }
        } else {
          const { error } = await supabase.from("group_bookmarks").delete().eq("group_id", studyGroupId).eq("user_id", userId);
          if (error) {
            console.error(error);
            throw error;
          }
        }

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );
  };

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
