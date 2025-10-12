"use client";

import { type Icon, IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { type Route } from "next";

export function NavMain({
  items,
  minimal = false,
}: {
  items: {
    title: string;
    url: Route;
    icon?: Icon;
  }[];
  minimal?: boolean;
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {
          // <SidebarMenu>
          //   <SidebarMenuItem className="flex items-center gap-2">
          //     <SidebarMenuButton
          //       tooltip="Quick Create"
          //       className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          //     >
          //       <IconCirclePlusFilled />
          //       <span>Quick Create Event</span>
          //     </SidebarMenuButton>
          //   </SidebarMenuItem>
          // </SidebarMenu>
        }
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                asChild
                isActive={
                  pathname === item.url || pathname.startsWith(`${item.url}/`)
                }
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
