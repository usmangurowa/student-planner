"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import BigCalendar from "@/components/calendar";
import { AIFab } from "@/components/ai-elements/ai-fab";

const Page = () => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <>
          <SiteHeader />
          <div className="flex flex-1 flex-col gap-4 p-2 pt-0">
            <BigCalendar />
          </div>
          <AIFab />
        </>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Page;
