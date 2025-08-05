import { useEffect } from "react";
import { useAtom } from "jotai";
import { userUuidAtom } from "@/atoms/authAtom";
import { getUserUuid } from "@/utils/supabase/getUser";

export const useUserId = () => {
  const [userId, setUserId] = useAtom(userUuidAtom);

  useEffect(() => {
    if (!userId) {
      getUserUuid()
        .then((uuid) => {
          if (uuid) setUserId(uuid);
        })
        .catch((error) => console.error(error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return userId;
};
