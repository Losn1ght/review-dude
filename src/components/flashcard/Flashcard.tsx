"use client";

import { memo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FlashcardFront } from "@/components/flashcard/FlashcardFront";
import { FlashcardBack } from "@/components/flashcard/FlashcardBack";
import { FlipPromptOverlay } from "@/components/flashcard/FlipPromptOverlay";
import { useSwipe } from "@/hooks/useSwipe";
import { hasSeenFlipPrompt, markFlipPromptSeen } from "@/lib/flipPrompt";
import type { DifficultyRating, Flashcard as FlashcardType } from "@/lib/types";

const FLIP_PROMPT_MESSAGE = "Flip me to see the explanation";

interface FlashcardProps {
  card: FlashcardType;
  flipped: boolean;
  isExam: boolean;
  selectedChoice: string | null;
  isFavorite: boolean;
  lastRating?: DifficultyRating;
  onFlip: () => void;
  onSelectChoice: (choice: string) => void;
  onToggleFavorite: () => void;
  onRate: (rating: DifficultyRating) => void;
  onSwipeNext?: () => void;
  onSwipePrev?: () => void;
}

function vibrate() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(15);
  }
}

function FlashcardComponent({
  card,
  flipped,
  isExam,
  selectedChoice,
  isFavorite,
  lastRating,
  onFlip,
  onSelectChoice,
  onToggleFavorite,
  onRate,
  onSwipeNext,
  onSwipePrev,
}: FlashcardProps) {
  const swipe = useSwipe({
    onSwipeLeft: onSwipeNext,
    onSwipeRight: onSwipePrev,
    onTap: () => {
      vibrate();
      onFlip();
    },
    onDoubleTap: () => {
      vibrate();
      onToggleFavorite();
    },
  });

  const [showFlipPrompt, setShowFlipPrompt] = useState(false);
  const flipPromptShownForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedChoice || flipped) {
      setShowFlipPrompt(false);
      return;
    }
    const key = `${card.id}-${selectedChoice}`;
    if (flipPromptShownForRef.current === key) return;
    flipPromptShownForRef.current = key;
    if (!hasSeenFlipPrompt()) {
      setShowFlipPrompt(true);
      markFlipPromptSeen();
    }
  }, [card.id, selectedChoice, flipped]);

  return (
    <div
      className="mx-auto w-full max-w-xl"
      style={{ perspective: "1600px" }}
      onTouchStart={swipe.onTouchStart}
      onTouchEnd={swipe.onTouchEnd}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={
          flipped
            ? `Card back, showing answer for ${card.term}. Press to flip back to question.`
            : `Card front, showing question: ${card.term}. Press to flip and reveal answer.`
        }
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter") onFlip();
        }}
        className="relative h-[420px] w-full cursor-pointer select-none outline-none sm:h-[440px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <FlashcardFront
              card={card}
              selectedChoice={selectedChoice}
              onSelectChoice={onSelectChoice}
            />
            {showFlipPrompt && (
              <FlipPromptOverlay
                overlayKey={`${card.id}-${selectedChoice}`}
                message={FLIP_PROMPT_MESSAGE}
              />
            )}
          </div>
          <div
            className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <FlashcardBack
              card={card}
              isExam={isExam}
              selectedChoice={selectedChoice}
              isFavorite={isFavorite}
              lastRating={lastRating}
              onToggleFavorite={onToggleFavorite}
              onRate={onRate}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export const Flashcard = memo(FlashcardComponent);
