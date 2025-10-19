import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/admin";
import { EventSchema, EventType } from "@/lib/ai/tools";
import { parseLocalTimeToUTC } from "@/lib/utils";

const CreateEventInputSchema = z.object({
  userId: z.string().describe("User ID who is creating the event"),
  type: z
    .enum(["event", "task"])
    .describe(
      "event uses start/end; task uses start as reminder and end as due"
    ),
  title: z.string().min(1).describe("Event or task title"),
  description: z.string().optional().describe("Optional description"),
  color: z
    .enum(["blue", "orange", "violet", "rose", "emerald"])
    .optional()
    .describe("Color for the event"),
  location: z.string().optional().describe("Location for the event"),
  start: z.string().describe("ISO date-time for start/reminder"),
  end: z.string().describe("ISO date-time for end/due date"),
  allDay: z.boolean().optional().describe("Is this an all-day event?"),
});

export const createEventTool = tool({
  name: "create_event",
  description: "Create a new event or task in the user's calendar",
  inputSchema: z
    .object({
      userId: z.string().describe("User ID who is creating the event"),
      events: z
        .array(CreateEventInputSchema)
        .describe("Array of events to create"),
    })
    .describe("Single event or array of events to create"),
  outputSchema: z.array(EventSchema),
  execute: async (input) => {
    const supabase = await createClient();

    if (!input.userId) {
      throw new Error("User ID is required to create an event.");
    }

    const eventsToCreate = Array.isArray(input.events)
      ? input.events
      : [input.events];

    const eventsPayloads = eventsToCreate.map((event) => {
      // Convert timezone-aware ISO strings to UTC
      const startUTC = parseLocalTimeToUTC(event.start);
      const endUTC = parseLocalTimeToUTC(event.end);

      return {
        title: event.title,
        description: event.description || null,
        color: event.color || null,
        location: event.location || null,
        category: event.type,
        start: startUTC,
        end: endUTC,
        allDay: event.allDay || false,
        created_by: input.userId,
      };
    });

    const { data, error } = await supabase
      .from("events")
      .insert(eventsPayloads)
      .select();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return eventsPayloads.map((event) => ({
      type: event.category as EventType["type"],
      title: event.title || "",
      description: event.description || undefined,
      color: event.color || undefined,
      location: event.location || undefined,
      start: event.start || "",
      end: event.end || "",
    })) as EventType[];
  },
});
