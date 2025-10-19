import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/admin";
import { EventSchema, EventType, ReadCalendarSchema } from "@/lib/ai/tools";

export const readCalendarTool = tool({
  name: "read_calendar",
  description: "Read user calendar (optionally in a date range; filter tasks)",
  inputSchema: ReadCalendarSchema,
  outputSchema: z.array(EventSchema),
  execute: async (input) => {
    console.log("reading calendar");
    const supabase = await createClient();

    if (!input.userId) {
      throw new Error("User ID is required to read calendar.");
    }

    const query = supabase
      .from("events")
      .select("*")
      .eq("created_by", input.userId);

    if (input.from) {
      query.gte("start", input.from);
    }
    if (input.to) {
      query.lte("end", input.to);
    }

    if (input.onlyTasks) {
      query.eq("category", "task");
    }
    const { data, error } = await query;

    if (error) {
      console.error("Error reading calendar:", error);
      return [];
    }

    console.log("Events found", data.length);

    return data.map((event) => ({
      type: event.category as EventType["type"],
      title: event.title,
      description: event.description || undefined,
      color: event.color || undefined,
      location: event.location || undefined,
      start: event.start,
      end: event.end,
    })) as EventType[];
  },
});
