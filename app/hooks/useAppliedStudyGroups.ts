import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import useSWR from "swr";
import { toggleItem } from "./helpers/toggleItem";

export function useAppliedStudyGroups(userId: string) {
  const fetcher = async () => {
    if (userId) {
      const { data: applicantIdObj } = await supabase
        .from("group_applications")
        .select("group_id")
        .eq("applicant_id", userId ?? "");

      const applicantIds = applicantIdObj?.map((item) => item.group_id) ?? [];

      const { data } = await supabase
        .from("study_groups")
        .select("*, group_members(*), group_likes(*), group_bookmarks(*)")
        .in("id", applicantIds);

      return data;
    } else {
      return null;
    }
  };

  const { data, error, mutate } = useSWR(userId ? ["appliedStudyGroups", userId] : null, fetcher);

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
      data: data,
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
