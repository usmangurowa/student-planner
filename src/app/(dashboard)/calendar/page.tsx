"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import BigCalendar from "@/components/calendar";
import AIFab from "@/components/ai-elements/ai-fab";

const Page = () => {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
        <BigCalendar />
      </div>
      <AIFab />
    </>
  );
};

export default Page;
