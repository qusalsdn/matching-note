import { useEffect } from "react";
import { useAtom } from "jotai";
import { userUuidAtom } from "@/atoms/authAtom";
import { getUserUuid } from "@/utils/supabase/getUser";

export const useUserId = () => {
  const [userId, setUserId] = useAtom(userUuidAtom);

  useEffect(() => {
    if (!userId) {
      getUserUuid().then((uuid) => uuid && setUserId(uuid));
    }
  }, [setUserId, userId]);

  return userId;
};
