"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCalendarStore } from "./event-calendar/calendar-store";

import { EventCalendar, type CalendarEvent } from "./event-calendar";

// Etiquettes data for calendar filtering
export { etiquettes } from "./event-calendar/etiquettes";

import {
  listCurrentUserEvents,
  toCalendarEvent,
  fromCalendarEvent,
} from "@/lib/supabase/queries/events";
import {
  upsertEvent,
  deleteEvent as deleteEventMutation,
} from "@/lib/supabase/mutations/events";

export default function Component() {
  const isColorVisible = useCalendarStore((s) => s.isColorVisible);
  const queryClient = useQueryClient();

  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: listCurrentUserEvents,
  });

  const events = useMemo<CalendarEvent[]>(
    () => rows.map(toCalendarEvent),
    [rows]
  );

  const visibleEvents = useMemo(() => {
    return events.filter((event) => isColorVisible(event.color));
  }, [events, isColorVisible]);

  const upsert = useMutation({
    mutationFn: async (event: CalendarEvent) => {
      const input = fromCalendarEvent(event);
      return upsertEvent({
        id: input.id,
        title: input.title,
        description: input.description ?? null,
        start:
          input.start instanceof Date ? input.start.toISOString() : input.start,
        end: input.end instanceof Date ? input.end.toISOString() : input.end,
        allDay: input.allDay ?? null,
        color: input.color ?? null,
        location: input.location ?? null,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => deleteEventMutation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const handleEventAdd = (event: CalendarEvent) => {
    upsert.mutate(event);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    upsert.mutate(updatedEvent);
  };

  const handleEventDelete = (eventId: string) => {
    remove.mutate(eventId);
  };

  return (
    <EventCalendar
      events={visibleEvents}
      isLoading={isLoading}
      isError={isError}
      onEventAdd={handleEventAdd}
      onEventUpdate={handleEventUpdate}
      onEventDelete={handleEventDelete}
      initialView="week"
    />
  );
}
