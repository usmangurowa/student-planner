import { createClient } from "@/lib/supabase/client";

export type UpsertProfileInput = {
  first_name: string;
  last_name: string;
  display_name: string;
};

export const upsertCurrentUserProfile = async (input: UpsertProfileInput) => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null, error: userError?.message ?? "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        first_name: input.first_name ?? null,
        last_name: input.last_name ?? null,
        display_name: input.display_name,
      },
      { onConflict: "id" }
    )
    .select()
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: data, error: null };
};
