import { supabase } from "@/utils/supabase/client";
import { toast } from "react-hot-toast";
import { KeyedMutator } from "swr";
import { StudyGroup } from "../study-group/components/StudyGroupPostCard";

type ToggleItemParams = {
  studyGroupId: number;
  key: "group_likes" | "group_bookmarks";
  table: "group_likes" | "group_bookmarks";
};

export function useGroupInteraction({ userId, data, mutate }: { userId: string; data: StudyGroup[]; mutate: KeyedMutator<any> }) {
  const toggleItem = async ({ studyGroupId, key, table }: ToggleItemParams) => {
    if (!userId) {
      toast.error("로그인을 해주세요.!");
      return;
    }

    mutate(
      async () => {
        const isToggled = data?.find((group) => group.id === studyGroupId)?.[key]?.some((item) => item.user_id === userId);

        const updatedData = data?.map((group) =>
          group.id === studyGroupId
            ? {
                ...group,
                [key]: isToggled
                  ? group[key].filter((item) => item.user_id !== userId)
                  : [...group[key], { group_id: studyGroupId, user_id: userId }],
              }
            : group
        );

        const { error } = isToggled
          ? await supabase.from(table).delete().eq("group_id", studyGroupId).eq("user_id", userId)
          : await supabase.from(table).insert({ group_id: studyGroupId, user_id: userId });

        if (error) {
          toast.error("처리에 실패했습니다.");
          console.error(error);
          throw error;
        }

        return updatedData;
      },
      { rollbackOnError: true, populateCache: true, revalidate: false }
    );
  };

  return {
    toggleLike: (id: number) => toggleItem({ studyGroupId: id, key: "group_likes", table: "group_likes" }),
    toggleBookmark: (id: number) => toggleItem({ studyGroupId: id, key: "group_bookmarks", table: "group_bookmarks" }),
  };
}
