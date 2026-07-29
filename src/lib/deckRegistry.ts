import { customDecks, normalizeTitle, toDeck } from "@/lib/customDecks";
import type { CustomDeckRecord, Deck, DeckMeta } from "@/lib/types";

export function customRecordToMeta(record: CustomDeckRecord): DeckMeta {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    cardCount: record.cards.length,
    category: record.category,
    color: record.color,
    icon: record.icon,
    updatedAt: record.updatedAt,
    isCustom: true,
  };
}

export function getAllDeckMetas(customRecords: CustomDeckRecord[] = customDecks.getAll()): DeckMeta[] {
  return customRecords.map(customRecordToMeta);
}

export function getDeckById(deckId: string): Deck | undefined {
  const custom = customDecks.getById(deckId);
  return custom ? toDeck(custom) : undefined;
}

export function isDuplicateDeckTitle(
  title: string,
  excludeId: string | undefined,
  customRecords: CustomDeckRecord[] = customDecks.getAll()
): boolean {
  const normalized = normalizeTitle(title);
  if (!normalized) return false;
  return customRecords.some(
    (deck) => deck.id !== excludeId && normalizeTitle(deck.title) === normalized
  );
}
