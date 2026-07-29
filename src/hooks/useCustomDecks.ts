"use client";

import { useCallback, useSyncExternalStore } from "react";
import { customDecks, emptyCustomDecks } from "@/lib/customDecks";
import { getDeckById, isDuplicateDeckTitle } from "@/lib/deckRegistry";
import type { CustomDeckRecord, Deck, DeckFormValues, DeckMeta, Flashcard } from "@/lib/types";

export interface DeckActionResult {
  ok: boolean;
  error?: string;
  deckId?: string;
}

function subscribe(listener: () => void) {
  return customDecks.subscribe(listener);
}

function getServerSnapshot(): CustomDeckRecord[] {
  return emptyCustomDecks;
}

function validate(values: DeckFormValues, excludeId: string | undefined, records: CustomDeckRecord[]): string | undefined {
  if (!values.title.trim()) return "Deck name is required.";
  if (isDuplicateDeckTitle(values.title, excludeId, records)) {
    return "A deck with this name already exists.";
  }
  return undefined;
}

export function useCustomDecks() {
  const records = useSyncExternalStore(subscribe, customDecks.getAll, getServerSnapshot);

  const createDeck = useCallback(
    (values: DeckFormValues): DeckActionResult => {
      const error = validate(values, undefined, records);
      if (error) return { ok: false, error };
      customDecks.create(values);
      return { ok: true };
    },
    [records]
  );

  const createDeckWithCards = useCallback(
    (values: DeckFormValues, cards: Flashcard[]): DeckActionResult => {
      const error = validate(values, undefined, records);
      if (error) return { ok: false, error };
      if (cards.length === 0) return { ok: false, error: "Add at least one flashcard." };
      const record = customDecks.createWithCards(values, cards);
      return { ok: true, deckId: record.id };
    },
    [records]
  );

  const updateDeck = useCallback(
    (id: string, values: DeckFormValues): DeckActionResult => {
      const error = validate(values, id, records);
      if (error) return { ok: false, error };
      const updated = customDecks.update(id, values);
      if (!updated) return { ok: false, error: "Deck not found." };
      return { ok: true };
    },
    [records]
  );

  const removeDeck = useCallback((deck: DeckMeta): DeckActionResult => {
    customDecks.remove(deck.id);
    return { ok: true };
  }, []);

  const duplicateDeck = useCallback((sourceDeckId: string): DeckActionResult => {
    const source: Deck | undefined = getDeckById(sourceDeckId);
    if (!source) return { ok: false, error: "Deck not found." };
    let title = `${source.title} (Copy)`;
    let suffix = 2;
    while (isDuplicateDeckTitle(title, undefined, customDecks.getAll())) {
      title = `${source.title} (Copy ${suffix})`;
      suffix += 1;
    }
    customDecks.duplicate(source, title);
    return { ok: true };
  }, []);

  return {
    records,
    createDeck,
    createDeckWithCards,
    updateDeck,
    removeDeck,
    duplicateDeck,
  };
}
