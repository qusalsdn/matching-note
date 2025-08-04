import { useSetAtom } from "jotai";
import { userUuidAtom } from "@/atoms/authAtom";
import { getUserUuid } from "@/utils/supabase/getUser";

export const useUserId = (userId: string) => {
  const setUserId = useSetAtom(userUuidAtom);

  if (!userId) {
    getUserUuid().then((uuid) => {
      if (uuid) {
        setUserId(uuid);
        return uuid;
      }
    });
  } else return userId;
};
