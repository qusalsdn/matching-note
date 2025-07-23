import toast from "react-hot-toast";
import { supabase } from "./client";

export const getUserId = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return toast.error(error.message);

  const {
    data: [{ id }],
  } = (await supabase
    .from("users")
    .select("id")
    .eq("user_id", user?.id ?? "")) as { data: { id: number }[] };

  return id;
};
