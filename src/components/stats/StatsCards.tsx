import { Card, CardContent } from "@/components/ui/card";
import { BookOpenCheck, Clock, Flame, Heart, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface StatsCardsProps {
  totalCardsStudied: number;
  todayCardsStudied: number;
  currentStreak: number;
  longestStreak: number;
  averageExamScore: number;
  studyHours: string;
  favoriteCount: number;
}

export function StatsCards({
  totalCardsStudied,
  todayCardsStudied,
  currentStreak,
  longestStreak,
  averageExamScore,
  studyHours,
  favoriteCount,
}: StatsCardsProps) {
  const items: StatItem[] = [
    { label: "Cards Studied", value: totalCardsStudied.toString(), icon: BookOpenCheck },
    { label: "Studied Today", value: todayCardsStudied.toString(), icon: Target },
    { label: "Current Streak", value: `${currentStreak} day${currentStreak === 1 ? "" : "s"}`, icon: Flame },
    { label: "Longest Streak", value: `${longestStreak} day${longestStreak === 1 ? "" : "s"}`, icon: Trophy },
    { label: "Avg. Exam Score", value: `${averageExamScore}%`, icon: Target },
    { label: "Study Time", value: studyHours, icon: Clock },
    { label: "Favorites", value: favoriteCount.toString(), icon: Heart },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col gap-1.5">
            <item.icon className="size-4 text-primary" aria-hidden="true" />
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
