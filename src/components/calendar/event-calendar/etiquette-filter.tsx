"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCalendarStore } from "./calendar-store";
import { etiquettes } from "./etiquettes";

export function EtiquetteFilter() {
  const visibleColors = useCalendarStore((s) => s.visibleColors);
  const toggleColor = useCalendarStore((s) => s.toggleColorVisibility);
  const colorClass: Record<string, string> = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1.5 max-sm:h-8 max-sm:px-2.5!">
          Filters <ChevronDownIcon className="-me-1 opacity-60" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel>Show categories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {etiquettes.map((e) => {
          const checked = visibleColors.includes(e.color);
          return (
            <DropdownMenuCheckboxItem
              key={e.id}
              checked={checked}
              onCheckedChange={() => toggleColor(e.color)}
            >
              <span
                className={`inline-block size-2 rounded-full ${colorClass[e.color]} mr-2`}
              />
              {e.name}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
