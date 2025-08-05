import { StudyGroup } from "@/app/study-group/components/StudyGroupPostCard";
import { supabase } from "@/utils/supabase/client";
import toast from "react-hot-toast";

type ToggleItemParams = {
  studyGroupId: number;
  key: "group_likes" | "group_bookmarks";
  table: "group_likes" | "group_bookmarks";
  userId: string;
  data: StudyGroup[] | null | undefined;
  mutate: (data?: any, options?: { rollbackOnError?: boolean; populateCache?: boolean; revalidate?: boolean }) => Promise<any>;
};

export async function toggleItem({ studyGroupId, key, table, userId, data, mutate }: ToggleItemParams) {
  if (!userId) return toast.error("로그인을 해주세요.!");
  if (!data) return;

  await mutate(
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

      const { error } = isToggled
        ? await supabase.from(table).delete().eq("group_id", studyGroupId).eq("user_id", userId)
        : await supabase.from(table).insert({ group_id: studyGroupId, user_id: userId });

      if (error) throw error;

      return updatedData;
    },
    { rollbackOnError: true, populateCache: true, revalidate: false }
  );
}
