import type {
  CalendarEvent,
  EventColor,
} from "@/components/calendar/event-calendar/types";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";

export type EventRow = Tables<"events">;

const allowedColors: ReadonlyArray<EventColor> = [
  "blue",
  "orange",
  "violet",
  "rose",
  "emerald",
] as const;

export const isTaskRow = (row: EventRow) => row.category === "task";

export const toCalendarEvent = (row: EventRow): CalendarEvent => {
  const isTask = isTaskRow(row);

  // Tasks: display at due time (stored in row.end), reminder is row.start
  const displayStart = isTask
    ? row.end
      ? new Date(row.end)
      : new Date()
    : row.start
      ? new Date(row.start)
      : new Date();

  const displayEnd = isTask
    ? new Date(displayStart.getTime() + 30 * 60 * 1000)
    : row.end
      ? new Date(row.end)
      : new Date(displayStart.getTime() + 60 * 60 * 1000);

  const color = allowedColors.includes(
    (row.color as EventColor) ?? ("" as EventColor)
  )
    ? (row.color as EventColor)
    : undefined;

  return {
    id: row.id,
    title: row.title ?? "Untitled",
    description: row.description ?? undefined,
    start: displayStart,
    end: displayEnd,
    allDay: isTask ? false : (row.allDay ?? undefined),
    color,
    location: row.location ?? undefined,
    label: isTask ? "Task" : undefined,
    reminder: isTask && row.start ? new Date(row.start) : undefined,
  };
};

export type UpsertEventInput = {
  id?: string;
  title: string;
  description?: string;
  start: Date | string;
  end: Date | string;
  allDay?: boolean;
  color?: EventColor;
  location?: string;
};

export const fromCalendarEvent = (event: CalendarEvent): UpsertEventInput => {
  return {
    id: event.id && event.id.length > 0 ? event.id : undefined,
    title: event.title,
    description: event.description,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    color: event.color,
    location: event.location,
  };
};

export const listCurrentUserEvents = async (): Promise<EventRow[]> => {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message ?? "Not authenticated");
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", user.id)
    .order("start", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
