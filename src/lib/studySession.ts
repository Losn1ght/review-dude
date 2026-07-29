import { shuffleArray } from "@/lib/shuffle";
import type { Flashcard, StudyMode, UserCardState } from "@/lib/types";

export function buildSessionQueue(
  cards: Flashcard[],
  mode: StudyMode,
  cardStates: Record<number, UserCardState>
): Flashcard[] {
  switch (mode) {
    case "shuffle":
      return shuffleArray(cards);
    case "favorites":
      return cards.filter((card) => cardStates[card.id]?.favorite);
    case "incorrect":
      return cards.filter((card) => {
        const state = cardStates[card.id];
        if (!state) return false;
        return (
          state.timesIncorrect > state.timesCorrect ||
          state.lastDifficultyRating === "Hard"
        );
      });
    case "exam":
      return shuffleArray(cards);
    case "normal":
    default:
      return cards;
  }
}

export function isModeEmpty(queue: Flashcard[]): boolean {
  return queue.length === 0;
}
