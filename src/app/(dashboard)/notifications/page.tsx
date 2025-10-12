"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";

const Page = () => {
  return (
    <>
      <SiteHeader title="Notifications" />
      <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
        <div className="rounded-md border">
          <div className="border-b px-4 py-3 text-sm font-medium">
            Notifications
          </div>
          <div className="text-muted-foreground p-4 text-sm">
            No notifications yet.
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
