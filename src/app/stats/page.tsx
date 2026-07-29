"use client";

import { useSyncExternalStore } from "react";
import { StatsCards } from "@/components/stats/StatsCards";
import { StreakChart } from "@/components/stats/StreakChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultStats, getEmptyCardStates, storage } from "@/lib/storage";
import {
  getAverageExamScore,
  getFavoriteCount,
  getLast7DaysActivity,
  getTodayCardsStudied,
} from "@/lib/stats";
import { getAllDeckMetas, getDeckById } from "@/lib/deckRegistry";
import { customDecks, emptyCustomDecks } from "@/lib/customDecks";
import { Progress } from "@/components/ui/progress";

function formatHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  if (hours < 1) return `${Math.round(totalSeconds / 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export default function StatsPage() {
  const stats = useSyncExternalStore(
    storage.subscribeStats.bind(storage),
    storage.getStats.bind(storage),
    getDefaultStats
  );
  const cardStates = useSyncExternalStore(
    storage.subscribeCardStates.bind(storage),
    storage.getCardStates.bind(storage),
    getEmptyCardStates
  );

  const customRecords = useSyncExternalStore(
    customDecks.subscribe,
    customDecks.getAll,
    () => emptyCustomDecks
  );
  const deckMetas = getAllDeckMetas(customRecords);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">Your Progress</h1>

      <StatsCards
        totalCardsStudied={stats.totalCardsStudied}
        todayCardsStudied={getTodayCardsStudied(stats)}
        currentStreak={stats.currentStreak}
        longestStreak={stats.longestStreak}
        averageExamScore={getAverageExamScore(stats)}
        studyHours={formatHours(stats.totalStudyTimeSeconds)}
        favoriteCount={getFavoriteCount(cardStates)}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakChart data={getLast7DaysActivity(stats)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deck Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deckMetas.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No decks yet — create one from the home page.
              </p>
            )}
            {deckMetas.map((meta) => {
              const deck = getDeckById(meta.id);
              const seen = deck ? deck.cards.filter((c) => cardStates[c.id]).length : 0;
              const percent = deck && deck.cards.length > 0 ? Math.round((seen / deck.cards.length) * 100) : 0;
              return (
                <div key={meta.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{meta.title}</span>
                    <span className="text-muted-foreground">{percent}%</span>
                  </div>
                  <Progress value={percent} aria-label={`${meta.title} completion`} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {stats.examResults.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Exam Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...stats.examResults]
              .slice(-5)
              .reverse()
              .map((result, i) => {
                const deck = getDeckById(result.deckId);
                return (
                  <div
                    key={`${result.completedAt}-${i}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>{deck?.title ?? result.deckId}</span>
                    <span className="font-medium">
                      {result.score}/{result.total} ({result.percentage}%)
                    </span>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
