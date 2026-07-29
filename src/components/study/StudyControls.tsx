"use client";

import { ChevronLeft, ChevronRight, Heart, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeSelector } from "@/components/study/ModeSelector";
import { JumpToCard } from "@/components/study/JumpToCard";
import { cn } from "@/lib/utils";
import type { StudyMode } from "@/lib/types";

interface StudyControlsProps {
  mode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onRestart: () => void;
  onJump: (index: number) => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  total: number;
}

export function StudyControls({
  mode,
  onModeChange,
  onPrev,
  onNext,
  onShuffle,
  onRestart,
  onJump,
  onToggleFavorite,
  isFavorite,
  canGoPrev,
  canGoNext,
  total,
}: StudyControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <ModeSelector mode={mode} onChange={onModeChange} />
        <JumpToCard total={total} onJump={onJump} />
        <Button variant="outline" size="sm" onClick={onShuffle} aria-label="Shuffle deck">
          <Shuffle className="size-4" />
          Shuffle
        </Button>
        <Button variant="outline" size="sm" onClick={onRestart} aria-label="Restart session">
          <RotateCcw className="size-4" />
          Restart
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
        >
          <Heart className={cn("size-4", isFavorite && "fill-rose-500 text-rose-500")} />
          Favorite
        </Button>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Previous card"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button size="icon" onClick={onNext} disabled={!canGoNext} aria-label="Next card">
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
