import { createClient } from "@/lib/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

export type InsertEvent = TablesInsert<"events">;
export type UpdateEvent = TablesUpdate<"events">;

export type UpsertEventFlexible = Omit<InsertEvent, "start" | "end"> & {
  id?: string;
  start?: string | Date | null;
  end?: string | Date | null;
};

export const upsertEvent = async (input: UpsertEventFlexible) => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "Not authenticated");
  }

  const payload: InsertEvent | UpdateEvent = {
    ...input,
    created_by: input.created_by ?? user.id,
    // Ensure dates are stored as ISO strings
    start: input.start ? new Date(input.start).toISOString() : null,
    end: input.end ? new Date(input.end).toISOString() : null,
  };

  const { data, error } = await supabase
    .from("events")
    .upsert(payload as InsertEvent, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data!;
};

export const deleteEvent = async (id: string) => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "Not authenticated");
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    throw new Error(error.message);
  }
};
