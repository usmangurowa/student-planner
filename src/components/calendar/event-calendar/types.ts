export type CalendarView = "month" | "week" | "day" | "agenda";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: EventColor;
  label?: string;
  location?: string;
  reminder?: Date; // for tasks: original reminder datetime (DB start)
}

export type EventColor = "blue" | "orange" | "violet" | "rose" | "emerald";
