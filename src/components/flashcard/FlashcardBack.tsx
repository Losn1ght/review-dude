"use client";

import { CheckCircle2, Heart, Lightbulb, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DifficultyRating } from "@/components/flashcard/DifficultyRating";
import { cn } from "@/lib/utils";
import type { DifficultyRating as DifficultyRatingType, Flashcard } from "@/lib/types";

interface FlashcardBackProps {
  card: Flashcard;
  isExam: boolean;
  selectedChoice: string | null;
  isFavorite: boolean;
  lastRating?: DifficultyRatingType;
  onToggleFavorite: () => void;
  onRate: (rating: DifficultyRatingType) => void;
}

export function FlashcardBack({
  card,
  isExam,
  selectedChoice,
  isFavorite,
  lastRating,
  onToggleFavorite,
  onRate,
}: FlashcardBackProps) {
  const isCorrect = selectedChoice === card.correctAnswer;

  return (
    <div className="flex h-full w-full flex-col gap-3 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-2">
        <Badge
          variant={isCorrect ? "default" : "destructive"}
          className={cn(isCorrect ? "bg-emerald-600 text-white" : undefined)}
        >
          {isCorrect ? (
            <>
              <CheckCircle2 className="size-3.5" /> Correct
            </>
          ) : (
            <>
              <XCircle className="size-3.5" /> Incorrect
            </>
          )}
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Heart className={cn("size-4", isFavorite && "fill-rose-500 text-rose-500")} />
        </Button>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Correct answer
        </p>
        <p className="text-base font-semibold sm:text-lg">{card.correctAnswer}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Explanation
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">{card.definition}</p>
      </div>

      {card.memoryTip && (
        <div className="flex gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <Lightbulb className="size-4 shrink-0" aria-hidden="true" />
          <p>{card.memoryTip}</p>
        </div>
      )}

      {!isExam && (
        <div className="mt-auto pt-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            How well did you know this?
          </p>
          <DifficultyRating value={lastRating} onRate={onRate} />
        </div>
      )}
    </div>
  );
}
