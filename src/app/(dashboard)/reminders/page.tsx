"use client";
import { useQuery } from "@tanstack/react-query";

import { SiteHeader } from "@/components/site-header";
import { listCurrentUserEvents } from "@/lib/supabase/queries/events";

const Page = () => {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: listCurrentUserEvents,
  });

  // Reminders: tasks with a start (reminder)
  const reminders = rows
    .filter((r) => r.category === "task" && !!r.start)
    .sort(
      (a, b) =>
        new Date(a.start ?? "").getTime() - new Date(b.start ?? "").getTime()
    );

  return (
    <>
      <SiteHeader title="Reminders" />
      <div className="flex flex-1 flex-col gap-4 p-2">
        <section className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-medium">Upcoming Reminders</div>
          </div>
          {isLoading ? (
            <div className="text-muted-foreground p-6 text-sm">Loading…</div>
          ) : reminders.length === 0 ? (
            <div className="text-muted-foreground p-6 text-sm">
              No reminders yet.
            </div>
          ) : (
            <ul className="divide-y">
              {reminders.map((r) => (
                <li key={r.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="leading-6 font-medium">
                        {r.title ?? "(no title)"}
                      </div>
                      {r.description && (
                        <div className="text-muted-foreground mt-0.5 text-sm">
                          {r.description}
                        </div>
                      )}
                      <div className="text-muted-foreground mt-1 text-xs">
                        Reminder:{" "}
                        {r.start ? new Date(r.start).toLocaleString() : "—"}
                        {r.end && (
                          <>
                            <span className="px-1">·</span>
                            Due: {new Date(r.end).toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
};

export default Page;
