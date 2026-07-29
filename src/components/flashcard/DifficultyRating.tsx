"use client";

import { cn } from "@/lib/utils";
import type { DifficultyRating as DifficultyRatingType } from "@/lib/types";

interface DifficultyRatingProps {
  value?: DifficultyRatingType;
  onRate: (rating: DifficultyRatingType) => void;
}

const OPTIONS: { rating: DifficultyRatingType; label: string; classes: string }[] = [
  { rating: "Easy", label: "Easy", classes: "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400" },
  { rating: "Medium", label: "Medium", classes: "border-amber-500/40 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400" },
  { rating: "Hard", label: "Hard", classes: "border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400" },
];

export function DifficultyRating({ value, onRate }: DifficultyRatingProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Rate this card's difficulty">
      {OPTIONS.map((option) => (
        <button
          key={option.rating}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRate(option.rating);
          }}
          aria-pressed={value === option.rating}
          className={cn(
            "cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            option.classes,
            value === option.rating && "bg-current/10 ring-1 ring-current"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
