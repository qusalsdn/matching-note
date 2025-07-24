import { supabase } from "./client";

export const getUserUuid = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id;
};

export const getUserId = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const {
    data: [{ id }],
  } = (await supabase
    .from("users")
    .select("id")
    .eq("user_id", user?.id ?? "")) as { data: { id: number }[] };

  return id;
};
