"use client";

import {
  Icon,
  IconBell,
  IconCalendar,
  IconChecklist,
  IconInnerShadowTop,
} from "@tabler/icons-react";
import type { Route } from "next";
import * as React from "react";

import { ChatPanel } from "@/components/ai-elements/chat-panel";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data: {
  navMain: {
    title: string;
    url: Route;
    icon: Icon;
  }[];
  navSecondary: {
    title: string;
    url: Route;
    icon: Icon;
  }[];
} = {
  navMain: [
    { title: "Calendar", url: "/calendar", icon: IconCalendar },
    { title: "Tasks", url: "/tasks", icon: IconChecklist },
    { title: "Reminders", url: "/reminders", icon: IconBell },
    // { title: "Notifications", url: "/notifications", icon: IconBell },
  ],
  navSecondary: [],
};

export const AppSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Stuplan</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col">
        <NavMain items={data.navMain} />
        {/* AI chat panel inside sidebar content, collapses with sidebar */}
        <div className="h-[89%] rounded-md border p-2">
          <ChatPanel />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};
