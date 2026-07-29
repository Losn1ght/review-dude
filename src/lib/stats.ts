import { storage } from "@/lib/storage";
import type { DailyActivity, ExamResult, StudyStats, UserCardState } from "@/lib/types";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a + "T00:00:00");
  const dateB = new Date(b + "T00:00:00");
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

export function recalculateStreak(dailyActivity: DailyActivity[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (dailyActivity.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  const sorted = [...dailyActivity].sort((a, b) => a.date.localeCompare(b.date));
  let longestStreak = 1;
  let runningStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i - 1].date, sorted[i].date);
    if (gap === 1) {
      runningStreak += 1;
    } else if (gap > 1) {
      runningStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const today = todayISO();
  const lastDate = sorted[sorted.length - 1].date;
  const gapFromToday = daysBetween(lastDate, today);
  const currentStreak = gapFromToday <= 1 ? runningStreak : 0;

  return { currentStreak, longestStreak };
}

export function recordCardStudied(count = 1): StudyStats {
  const stats = storage.getStats();
  const today = todayISO();
  const existingDay = stats.dailyActivity.find((d) => d.date === today);
  const dailyActivity = existingDay
    ? stats.dailyActivity.map((d) =>
        d.date === today ? { ...d, cardsStudied: d.cardsStudied + count } : d
      )
    : [...stats.dailyActivity, { date: today, cardsStudied: count }];

  const { currentStreak, longestStreak } = recalculateStreak(dailyActivity);

  const updated: StudyStats = {
    ...stats,
    totalCardsStudied: stats.totalCardsStudied + count,
    dailyActivity,
    currentStreak,
    longestStreak: Math.max(longestStreak, stats.longestStreak),
  };
  storage.setStats(updated);
  return updated;
}

export function recordStudyTime(seconds: number): StudyStats {
  const stats = storage.getStats();
  const updated: StudyStats = {
    ...stats,
    totalStudyTimeSeconds: stats.totalStudyTimeSeconds + seconds,
  };
  storage.setStats(updated);
  return updated;
}

export function recordExamResult(result: ExamResult): StudyStats {
  const stats = storage.getStats();
  const updated: StudyStats = {
    ...stats,
    examResults: [...stats.examResults, result],
  };
  storage.setStats(updated);
  return updated;
}

export function getTodayCardsStudied(stats: StudyStats): number {
  const today = todayISO();
  return stats.dailyActivity.find((d) => d.date === today)?.cardsStudied ?? 0;
}

export function getFavoriteCount(cardStates: Record<number, UserCardState>): number {
  return Object.values(cardStates).filter((s) => s.favorite).length;
}

export function getAverageExamScore(stats: StudyStats): number {
  if (stats.examResults.length === 0) return 0;
  const total = stats.examResults.reduce((sum, r) => sum + r.percentage, 0);
  return Math.round(total / stats.examResults.length);
}

export function getLast7DaysActivity(stats: StudyStats): DailyActivity[] {
  const days: DailyActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const existing = stats.dailyActivity.find((a) => a.date === dateStr);
    days.push({ date: dateStr, cardsStudied: existing?.cardsStudied ?? 0 });
  }
  return days;
}
