"use client";

import { AlertCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DraftFlashcard } from "@/lib/pdfImport/parseFlashcards";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface ImportCardEditorProps {
  card: DraftFlashcard;
  index: number;
  total: number;
  onChange: (patch: Partial<DraftFlashcard>) => void;
  onChoiceChange: (choiceIndex: number, value: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function ImportCardEditor({
  card,
  index,
  total,
  onChange,
  onChoiceChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ImportCardEditorProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Card {index + 1}</span>
          {!card.answerResolved && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="size-3" />
              Check answer
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Move card up"
            disabled={index === 0}
            onClick={onMoveUp}
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Move card down"
            disabled={index === total - 1}
            onClick={onMoveDown}
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove card"
            onClick={onRemove}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Question</label>
          <textarea
            value={card.term}
            onChange={(e) => onChange({ term: e.target.value })}
            rows={2}
            className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {card.choices.map((choice, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Mark choice ${LETTERS[i]} as correct`}
                onClick={() => onChange({ correctAnswer: choice })}
                className={cn(
                  "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  card.correctAnswer === choice
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {LETTERS[i] ?? i + 1}
              </button>
              <Input
                value={choice}
                onChange={(e) => onChoiceChange(i, e.target.value)}
                placeholder={`Choice ${LETTERS[i] ?? i + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Explanation / Rationale
          </label>
          <textarea
            value={card.definition}
            onChange={(e) => onChange({ definition: e.target.value })}
            rows={2}
            className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            value={card.category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="Category"
          />
          <Input
            value={card.memoryTip ?? ""}
            onChange={(e) => onChange({ memoryTip: e.target.value })}
            placeholder="Memory tip (optional)"
          />
        </div>
      </div>
    </div>
  );
}
