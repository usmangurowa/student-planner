import { tool } from "ai";
import { z } from "zod";

import { EventSchema, EventType } from "@/lib/ai/tools";
import { createClient } from "@/lib/supabase/admin";
import { parseLocalTimeToUTC } from "@/lib/utils";

const UpdateEventInputSchema = z.object({
  userId: z.string().describe("User ID who is updating the event"),
  eventId: z.string().describe("ID of the event to update"),
  title: z.string().optional().describe("New title for the event"),
  type: z
    .enum(["event", "task"])
    .optional()
    .describe("New type for the event (event or task)"),
  start: z
    .string()
    .optional()
    .describe("New start/reminder time for the event"),
  end: z.string().optional().describe("New end/due date for the event"),
  description: z.string().optional().describe("New description for the event"),
  location: z.string().optional().describe("New location for the event"),
  color: z
    .enum(["blue", "orange", "violet", "rose", "emerald"])
    .optional()
    .describe("New color for the event"),
  allDay: z.boolean().optional().describe("New all-day flag for the event"),
});

export const updateEventTool = tool({
  name: "update_event",
  description: "Update an existing event or task in the user's calendar",
  inputSchema: UpdateEventInputSchema,
  outputSchema: EventSchema,
  execute: async (input) => {
    console.log("updating event/task", input.eventId);
    const supabase = await createClient();

    if (!input.userId) {
      throw new Error("User ID is required to update an event.");
    }

    const updatePayload = {
      title: input.title || undefined,
      category: input.type || undefined,
      start: input.start ? parseLocalTimeToUTC(input.start) : undefined,
      end: input.end ? parseLocalTimeToUTC(input.end) : undefined,
      description: input.description || undefined,
      location: input.location || undefined,
      color: input.color || undefined,
      allDay: input.allDay || undefined,
    };

    const { data, error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", input.eventId)
      .eq("created_by", input.userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return {
      type: data.category as EventType["type"],
      title: data.title || "",
      description: data.description || undefined,
      color: data.color || undefined,
      location: data.location || undefined,
      start: data.start || "",
      end: data.end || "",
    } as EventType;
  },
});
