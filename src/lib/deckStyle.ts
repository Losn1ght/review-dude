import {
  Activity,
  Bone,
  BookOpen,
  Brain,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Microscope,
  Pill,
  Star,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { DeckColorKey, DeckIconKey } from "@/lib/types";

export const DECK_ICONS: Record<DeckIconKey, LucideIcon> = {
  "book-open": BookOpen,
  brain: Brain,
  "heart-pulse": HeartPulse,
  stethoscope: Stethoscope,
  pill: Pill,
  microscope: Microscope,
  bone: Bone,
  activity: Activity,
  users: Users,
  "flask-conical": FlaskConical,
  "graduation-cap": GraduationCap,
  star: Star,
};

export const DECK_ICON_LABELS: Record<DeckIconKey, string> = {
  "book-open": "Book",
  brain: "Brain",
  "heart-pulse": "Heart",
  stethoscope: "Stethoscope",
  pill: "Pill",
  microscope: "Microscope",
  bone: "Bone",
  activity: "Activity",
  users: "Users",
  "flask-conical": "Flask",
  "graduation-cap": "Graduation Cap",
  star: "Star",
};

export const DECK_COLOR_CLASSES: Record<DeckColorKey, { bg: string; text: string; ring: string }> = {
  rose: { bg: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/30" },
  orange: { bg: "bg-orange-500", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/30" },
  amber: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/30" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/30" },
  teal: { bg: "bg-teal-500", text: "text-teal-600 dark:text-teal-400", ring: "ring-teal-500/30" },
  sky: { bg: "bg-sky-500", text: "text-sky-600 dark:text-sky-400", ring: "ring-sky-500/30" },
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400", ring: "ring-indigo-500/30" },
  violet: { bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/30" },
  pink: { bg: "bg-pink-500", text: "text-pink-600 dark:text-pink-400", ring: "ring-pink-500/30" },
  slate: { bg: "bg-slate-500", text: "text-slate-600 dark:text-slate-400", ring: "ring-slate-500/30" },
};

const DEFAULT_ICON: DeckIconKey = "book-open";
const DEFAULT_COLOR: DeckColorKey = "slate";

export function getDeckIcon(icon: DeckIconKey | undefined): LucideIcon {
  return DECK_ICONS[icon ?? DEFAULT_ICON];
}

export function getDeckColorClasses(color: DeckColorKey | undefined) {
  return DECK_COLOR_CLASSES[color ?? DEFAULT_COLOR];
}

export function formatUpdatedAt(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
