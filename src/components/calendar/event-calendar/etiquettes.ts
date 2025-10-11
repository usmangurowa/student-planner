"use client";

import type { EventColor } from "./types";

export interface Etiquette {
  id: string;
  name: string;
  color: EventColor;
  isActive: boolean;
}

export const etiquettes: Etiquette[] = [
  { id: "classes", name: "Classes", color: "blue", isActive: true },
  { id: "assignments", name: "Assignments", color: "orange", isActive: true },
  { id: "exams", name: "Exams", color: "violet", isActive: true },
  { id: "study", name: "Study Sessions", color: "emerald", isActive: true },
  { id: "holidays", name: "Holidays", color: "rose", isActive: true },
];
