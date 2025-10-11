import { createClient } from "@/lib/supabase/client";

export const getCurrentUserProfile = async () => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: userError?.message ?? "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { data: null, error: error.message };
  return {
    data: {
      ...data,
      email: user.email,
      avatar: user.user_metadata.avatar_url,
      updated_at: user.updated_at,
    },
    error: null,
  };
};
