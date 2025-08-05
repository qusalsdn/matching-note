import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import useSWR from "swr";
import { toggleItem } from "./helpers/toggleItem";

export function useOpenedStudyGroups(userId: string) {
  const fetcher = async () => {
    if (userId) {
      const { data } = await supabase
        .from("study_groups")
        .select("*, group_members(*), group_likes(*), group_bookmarks(*)")
        .eq("leader_id", userId);

      return data;
    } else {
      return null;
    }
  };

  const { data, error, mutate } = useSWR(userId ? ["openedStudyGroups", userId] : null, fetcher);

  if (error) {
    console.error(error);
    toast.error("서버에 오류가 발생하였습니다...ㅠ");
  }

  const handleLike = (id: number) =>
    toggleItem({
      studyGroupId: id,
      key: "group_likes",
      table: "group_likes",
      userId,
      data,
      mutate,
    });

  const handleBookmark = (id: number) =>
    toggleItem({
      studyGroupId: id,
      key: "group_bookmarks",
      table: "group_bookmarks",
      userId,
      data,
      mutate,
    });

  return {
    data,
    isError: Boolean(error),
    handleLike,
    handleBookmark,
  };
}
