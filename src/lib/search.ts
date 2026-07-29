import type { Flashcard } from "@/lib/types";

export function searchCards(cards: Flashcard[], query: string): Flashcard[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return cards;
  return cards.filter(
    (card) =>
      card.term.toLowerCase().includes(trimmed) ||
      card.category.toLowerCase().includes(trimmed) ||
      card.definition.toLowerCase().includes(trimmed)
  );
}
