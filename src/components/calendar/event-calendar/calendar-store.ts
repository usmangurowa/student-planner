"use client";

import { create } from "zustand";
import { etiquettes } from "./etiquettes";

type CalendarStore = {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  visibleColors: string[];
  toggleColorVisibility: (color: string) => void;
  isColorVisible: (color: string | undefined) => boolean;
};

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentDate: new Date(),
  setCurrentDate: (date: Date) => set({ currentDate: date }),
  visibleColors: etiquettes.filter((e) => e.isActive).map((e) => e.color),
  toggleColorVisibility: (color: string) =>
    set((state) => ({
      visibleColors: state.visibleColors.includes(color)
        ? state.visibleColors.filter((c) => c !== color)
        : [...state.visibleColors, color],
    })),
  isColorVisible: (color?: string) => {
    if (!color) return true;
    return get().visibleColors.includes(color);
  },
}));
