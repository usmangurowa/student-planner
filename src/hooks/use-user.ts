"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUserProfile } from "@/lib/supabase/queries/profile";

export type CurrentUserProfile = Awaited<
  ReturnType<typeof getCurrentUserProfile>
>["data"];

export const useUser = () => {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await getCurrentUserProfile();
      if (error) throw new Error(error);
      if (!data) return null;
      return data;
    },
  });

  return query;
};
