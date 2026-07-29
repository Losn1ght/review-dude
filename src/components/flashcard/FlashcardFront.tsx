"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/lib/types";

interface FlashcardFrontProps {
  card: Flashcard;
  selectedChoice: string | null;
  onSelectChoice: (choice: string) => void;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function FlashcardFront({ card, selectedChoice, onSelectChoice }: FlashcardFrontProps) {
  return (
    <div className="flex h-full w-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary">{card.category}</Badge>
        <Badge variant="outline">{card.difficulty}</Badge>
      </div>
      <p className="text-lg font-medium leading-snug sm:text-xl">{card.term}</p>
      <div className="mt-auto grid gap-2">
        {card.choices.map((choice, i) => {
          const isSelected = selectedChoice === choice;
          const isCorrectChoice = choice === card.correctAnswer;
          const isLocked = Boolean(selectedChoice);
          const showCorrect = isLocked && isCorrectChoice;
          const showIncorrect = isLocked && isSelected && !isCorrectChoice;

          return (
            <button
              key={choice}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectChoice(choice);
              }}
              disabled={isLocked}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
                !isLocked && isSelected && "border-primary bg-primary/10",
                showCorrect &&
                  "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300",
                showIncorrect &&
                  "border-rose-500 bg-rose-500/15 text-rose-800 dark:border-rose-400 dark:bg-rose-500/20 dark:text-rose-300"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold",
                  showCorrect && "border-emerald-500 dark:border-emerald-400",
                  showIncorrect && "border-rose-500 dark:border-rose-400"
                )}
              >
                {LETTERS[i] ?? i + 1}
              </span>
              <span>{choice}</span>
            </button>
          );
        })}
      </div>
      {!selectedChoice && (
        <p className="text-center text-xs text-muted-foreground">
          Select an answer to reveal the explanation
        </p>
      )}
    </div>
  );
}
