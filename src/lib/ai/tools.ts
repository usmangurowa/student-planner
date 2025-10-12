import { z } from "zod";

// Tool schemas for AI function-calling
export const CreateEventSchema = z.object({
  type: z
    .enum(["event", "task"]) // task: start=reminder, end=due
    .describe(
      "event uses start/end; task uses start as reminder and end as due"
    ),
  title: z.string().min(1),
  description: z.string().optional(),
  color: z.enum(["blue", "orange", "violet", "rose", "emerald"]).optional(),
  location: z.string().optional(),
  start: z.string().describe("ISO date-time"),
  end: z.string().describe("ISO date-time"),
});
export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const ReadCalendarSchema = z.object({
  from: z.string().optional().describe("ISO start of range"),
  to: z.string().optional().describe("ISO end of range"),
  onlyTasks: z.boolean().optional().default(false),
});
export type ReadCalendarInput = z.infer<typeof ReadCalendarSchema>;
