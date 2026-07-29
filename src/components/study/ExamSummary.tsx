import Link from "next/link";
import { RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExamResult } from "@/lib/types";

interface ExamSummaryProps {
  result: ExamResult;
  onRestart: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function ExamSummary({ result, onRestart }: ExamSummaryProps) {
  const incorrect = result.total - result.score;

  return (
    <Card className="mx-auto max-w-lg text-center">
      <CardHeader>
        <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="size-7 text-primary" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl">Exam Complete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-4xl font-bold">{result.percentage}%</p>
          <p className="text-sm text-muted-foreground">
            {result.score} of {result.total} correct
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {result.score}
            </p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-lg font-semibold text-rose-600 dark:text-rose-400">{incorrect}</p>
            <p className="text-xs text-muted-foreground">Incorrect</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-lg font-semibold">{formatDuration(result.timeSpentSeconds)}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={onRestart}>
            <RotateCcw className="size-4" />
            Retake Exam
          </Button>
          <Button className="flex-1" nativeButton={false} render={<Link href="/" />}>
            Back to Decks
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
