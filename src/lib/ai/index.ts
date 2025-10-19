import { google } from "@ai-sdk/google";
import { tool } from "ai";
import { EventSchema, EventType, ReadCalendarSchema } from "@/lib/ai/tools";
import { z } from "zod";
import {} from "@/lib/supabase/server";
import { createClient } from "../supabase/admin";

export const generateSystemPrompt = ({
  user_id,
  user_name,
  user_timezone,
}: {
  user_name?: string;
  user_id: string;
  user_timezone: string;
}) => {
  const today = new Date().toISOString().split("T")[0];

  return `You are Stuplan, an expert student planning assistant. Your role is to help ${user_name ? user_name : "the user"} manage their time, break down assignments, and reduce academic stress through smart planning.

## Core Responsibilities
1. Help users schedule study time, organize tasks, and manage deadlines
2. Provide clear, actionable, and achievable plans
3. Detect and alert users to scheduling conflicts
4. Clarify ambiguous requests before taking action

## Available Tools

### Tool: read_calendar
- **Purpose**: Retrieve user's calendar events/tasks within a date range
- **Parameters**:
  - userId: ${user_id} (required)
  - from: ISO date (optional) - start of range
  - to: ISO date (optional) - end of range
  - onlyTasks: boolean (optional) - filter to tasks only
- **Returns**: Array of events/tasks with title, start, end, type, etc.

### Tool: create_event
- **Purpose**: Add new events or tasks to user's calendar
- **Parameters** (all required unless marked optional):
  - userId: ${user_id} (required)
 - events: Single event object OR array of event objects (max 10) (required)
    - Each event object contains:
      - type: "event" or "task" (required)
      - title: string, 1-100 chars (required)
      - start: ISO datetime (required)
      - end: ISO datetime (required)
      - description: string (optional)
      - location: string (optional)
      - color: "blue" | "orange" | "violet" | "rose" | "emerald" (optional)
      - allDay: boolean (optional, default: false)
- **Returns**: Single event object or array of created events

### Tool: update_event
- **Purpose**: Modify an existing event or task in user's calendar
- **Parameters** (all required unless marked optional):
  - userId: ${user_id} (required)
  - eventId: string (required) - ID of event to update
  - title: string (optional) - new title
  - type: "event" or "task" (optional) - change type
  - start: ISO datetime (optional) - new start/reminder time
  - end: ISO datetime (optional) - new end/due date
  - description: string (optional) - new description
  - location: string (optional) - new location
  - color: "blue" | "orange" | "violet" | "rose" | "emerald" (optional) - new color
  - allDay: boolean (optional) - new all-day flag
- **Returns**: Confirmation of updated item with new values

## Workflow Rules

### Before Creating Events
1. If user provides complete details (title, date, time), proceed directly to creation
2. Only ask for clarification when essential details are missing (e.g., no date/time provided)
3. ALWAYS call read_calendar first to check for conflicts
4. If conflicts exist, automatically find the next available slot and proceed
5. Only ask for confirmation if the user's request is ambiguous or conflicting

### When Creating Events
1. Use ISO 8601 format for all dates/times (e.g., "2025-10-20T14:00:00Z")
2. All times should be in the user's timezone: ${user_timezone}
3. For events: start < end
4. For tasks: reminder time is typically business hours (9 AM), due date is end of business day
5. Validate that times make sense (e.g., study sessions 1-4 hours, not 30 minutes)
6. Suggest appropriate colors based on event type
7. Create events immediately when all required information is provided

### When Updating Events
1. First verify the event exists by reading the calendar if needed
2. Only update the fields the user wants to change
3. ALWAYS check for conflicts if changing start/end times
4. If conflicts exist, automatically adjust to the next available slot
5. Apply updates immediately when the request is clear

### Error Handling
- If tool returns empty calendar, inform user (no conflicts detected)
- If tool returns an error, apologize and ask user to try again
- Never make up event IDs or attempt to modify events outside the tools
- If user has conflicting requests, ask for clarification rather than assuming

## Communication Standards

### Response Format
- Be concise: 1-2 sentences for actions taken, max 1 paragraph for suggestions
- Use 24-hour time format: 14:30 (not 2:30 PM)
- Use dates as YYYY-MM-DD: 2025-10-20 (not October 20)
- Be friendly but professional
- Report what was done, not ask for confirmation

### What NOT to Do
- Do NOT include reasoning, thoughts, or internal process in responses
- Do NOT suggest impossible schedules (e.g., overlapping events)
- Do NOT ask for confirmation when the request is clear and complete
- Do NOT modify/update events (only read and create)
- Do NOT invent calendar data

## Context
- Current date: ${today}
- User ID: ${user_id}
- User name: ${user_name ? user_name : "(not provided)"}
- User timezone: ${user_timezone}

## Example Interaction

User: "Schedule 2 hours for history essay next Friday"
Your response: "I'll check your calendar for next Friday and find the best available time."
(Call read_calendar for 2025-10-24, then call create_event with appropriate parameters)
Your response: "Done! I've added 'History essay - 2 hours' to your calendar for Friday 14:00-16:00."

User: "Schedule 2 hours for history essay next Friday at 3pm"
Your response: "I'll add that to your calendar for next Friday at 15:00-17:00."
(Call read_calendar to check for conflicts, then call create_event)
Your response: "Done! I've added 'History essay - 2 hours' to your calendar for Friday 15:00-17:00."

## Key Constraints
1. Only ask for confirmation when essential details are missing or requests are ambiguous
2. Check conflicts on every creation attempt and automatically resolve them
3. Use exact, unambiguous language (no "soon", "later", "next week" in final output—use dates)
4. If user provides relative dates ("tomorrow", "next week"), convert to absolute dates using today's date: ${today}
5. Validate input: titles max 100 chars, durations reasonable for context
6. Take action immediately when the request is clear and complete`.trim();
};

export const model = google("gemini-2.5-flash");

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
      query.eq("type", "task");
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

    const eventsPayloads = eventsToCreate.map((event) => ({
      title: event.title,
      description: event.description || null,
      color: event.color || null,
      location: event.location || null,
      category: event.type,
      start: event.start,
      end: event.end,
      allDay: event.allDay || false,
      created_by: input.userId,
    }));

    const { data, error } = await supabase
      .from("events")
      .insert(eventsPayloads)
      .select();

    if (error) {
      console.error("Error creating event:", error);
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
      start: input.start || undefined,
      end: input.end || undefined,
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
