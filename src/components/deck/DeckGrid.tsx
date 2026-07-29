"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { DeckCard } from "@/components/deck/DeckCard";
import { DeckFormDialog } from "@/components/deck/DeckFormDialog";
import { DeleteDeckDialog } from "@/components/deck/DeleteDeckDialog";
import { getDeckById } from "@/lib/deckRegistry";
import { getEmptyCardStates, storage } from "@/lib/storage";
import { useCustomDecks } from "@/hooks/useCustomDecks";
import type { DeckFormValues, DeckMeta } from "@/lib/types";

interface DeckGridProps {
  decks: DeckMeta[];
  hasAnyDecks?: boolean;
}

export function DeckGrid({ decks, hasAnyDecks = decks.length > 0 }: DeckGridProps) {
  const cardStates = useSyncExternalStore(
    storage.subscribeCardStates.bind(storage),
    storage.getCardStates.bind(storage),
    getEmptyCardStates
  );
  const { updateDeck, removeDeck, duplicateDeck } = useCustomDecks();

  const [editingDeck, setEditingDeck] = useState<DeckMeta | null>(null);
  const [editFormKey, setEditFormKey] = useState(0);
  const [deletingDeck, setDeletingDeck] = useState<DeckMeta | null>(null);

  const progressByDeck = useMemo(() => {
    const next: Record<string, number> = {};
    for (const meta of decks) {
      const deck = getDeckById(meta.id);
      const cards = deck?.cards ?? [];
      if (cards.length === 0) {
        next[meta.id] = 0;
        continue;
      }
      const seen = cards.filter((card) => cardStates[card.id]).length;
      next[meta.id] = Math.round((seen / cards.length) * 100);
    }
    return next;
  }, [decks, cardStates]);

  function handleDuplicate(deck: DeckMeta) {
    const result = duplicateDeck(deck.id);
    if (result.ok) {
      toast.success(`Duplicated "${deck.title}"`);
    } else {
      toast.error(result.error ?? "Failed to duplicate deck.");
    }
  }

  function handleDelete(deck: DeckMeta) {
    removeDeck(deck);
    toast.success(`Deleted "${deck.title}"`);
  }

  function handleEditSubmit(values: DeckFormValues) {
    if (!editingDeck) return { ok: false, error: "No deck selected." };
    const result = updateDeck(editingDeck.id, values);
    if (result.ok) {
      toast.success("Deck updated");
    }
    return result;
  }

  if (decks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        {hasAnyDecks
          ? "No decks match your search."
          : "You don't have any decks yet — create one or import a PDF to get started."}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            progressPercent={progressByDeck[deck.id] ?? 0}
            hasProgress={(progressByDeck[deck.id] ?? 0) > 0}
            onEdit={() => {
              setEditFormKey((k) => k + 1);
              setEditingDeck(deck);
            }}
            onDuplicate={() => handleDuplicate(deck)}
            onDelete={() => setDeletingDeck(deck)}
          />
        ))}
      </div>

      <DeckFormDialog
        open={editingDeck !== null}
        onOpenChange={(open) => !open && setEditingDeck(null)}
        mode="edit"
        formKey={editFormKey}
        initialValues={
          editingDeck
            ? {
                title: editingDeck.title,
                description: editingDeck.description ?? "",
                category: editingDeck.category ?? "",
                color: editingDeck.color,
                icon: editingDeck.icon,
              }
            : undefined
        }
        onSubmit={handleEditSubmit}
      />

      <DeleteDeckDialog
        open={deletingDeck !== null}
        onOpenChange={(open) => !open && setDeletingDeck(null)}
        deckTitle={deletingDeck?.title ?? ""}
        cardCount={deletingDeck?.cardCount ?? 0}
        onConfirm={() => deletingDeck && handleDelete(deletingDeck)}
      />
    </>
  );
}
