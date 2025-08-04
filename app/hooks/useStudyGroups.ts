import { useSearchParams } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import useSWR from "swr";
import { useUserId } from "./useUserId";
import { useAtomValue } from "jotai";
import { userUuidAtom } from "@/atoms/authAtom";

export function useStudyGroups() {
  const category = useSearchParams().get("category");
  const search = useSearchParams().get("search");
  const userId = useUserId(useAtomValue(userUuidAtom));

  const fetcher = async (category: string | null, search: string | null) => {
    if (category) {
      let query = supabase.from("study_groups").select("*, group_members(*), group_likes(*), group_bookmarks(*)");

      if (category !== "ALL") {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("pinned_until", { ascending: false }).order("created_at", { ascending: false });

      if (error) throw error;

      return data;
    } else if (search) {
      const { data, error } = await supabase
        .from("study_groups")
        .select("*, group_members(*), group_likes(*), group_bookmarks(*)")
        .or(`group_name.ilike.%${search}%, description.ilike.%${search}%, category.ilike.%${search}%`);

      if (error) throw error;
      return data;
    } else if (!category && !search) {
      const { data } = await supabase.from("study_groups").select("*, group_members(*), group_likes(*), group_bookmarks(*)");
      return data;
    } else {
      return null;
    }
  };

  const { data, error, mutate } = useSWR([category, search], ([c, s]) => fetcher(c, s));

  if (error) {
    console.error(error);
    toast.error("서버에 오류가 발생하였습니다...ㅠ");
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
        const isToggled = data.find((group) => group.id === studyGroupId)?.[key].some((item) => item.user_id === userId);

        const updatedData = data.map((group) => {
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
    if (error) console.error(error);
  };

  return {
    data,
    isError: Boolean(error),
    handleLike,
    handleBookmark,
    increaseViewCount,
    category,
    search,
  };
}
