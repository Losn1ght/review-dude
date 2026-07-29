import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  current: number;
  total: number;
  percent: number;
  score: { correct: number; attempted: number };
}

export function ProgressBar({ current, total, percent, score }: ProgressBarProps) {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Card {Math.min(current + 1, total)} / {total}
        </span>
        <span>
          Score: {score.correct}/{score.attempted}
        </span>
      </div>
      <Progress value={percent} aria-label="Study progress" />
    </div>
  );
}
