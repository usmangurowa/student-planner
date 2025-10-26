"use client";
import { useQuery } from "@tanstack/react-query";

import { SiteHeader } from "@/components/site-header";
import { listCurrentUserEvents } from "@/lib/supabase/queries/events";

const Page = () => {
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: listCurrentUserEvents,
  });

  const tasks = rows.filter((r) => r.category === "task");

  return (
    <>
      <SiteHeader title="Tasks" />
      <div className="flex flex-1 flex-col gap-4 p-2">
        <section className="bg-card text-card-foreground rounded-lg border shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-sm font-medium">Your Tasks</div>
            <div className="flex items-center gap-2">
              {/* future: filters/search */}
            </div>
          </div>
          {isLoading ? (
            <div className="text-muted-foreground p-6 text-sm">Loading…</div>
          ) : tasks.length === 0 ? (
            <div className="text-muted-foreground p-6 text-sm">
              No tasks yet.
            </div>
          ) : (
            <ul className="divide-y">
              {tasks.map((t) => (
                <li key={t.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="leading-6 font-medium">
                        {t.title ?? "(no title)"}
                      </div>
                      {t.description && (
                        <div className="text-muted-foreground mt-0.5 text-sm">
                          {t.description}
                        </div>
                      )}
                      <div className="text-muted-foreground mt-1 text-xs">
                        Due: {t.end ? new Date(t.end).toLocaleString() : "—"}
                        {t.start && (
                          <>
                            <span className="px-1">·</span>
                            Reminder: {new Date(t.start).toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>
                    {/* future: quick actions */}
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
