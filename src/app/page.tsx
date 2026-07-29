"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { DeckGrid } from "@/components/deck/DeckGrid";
import { SearchBar } from "@/components/search/SearchBar";
import { DeckFormDialog } from "@/components/deck/DeckFormDialog";
import { Button } from "@/components/ui/button";
import { useCustomDecks } from "@/hooks/useCustomDecks";
import { getAllDeckMetas } from "@/lib/deckRegistry";
import type { DeckFormValues } from "@/lib/types";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const { records, createDeck } = useCustomDecks();

  const deckMetas = useMemo(() => getAllDeckMetas(records), [records]);

  const filteredDecks = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return deckMetas;
    return deckMetas.filter(
      (deck) =>
        deck.title.toLowerCase().includes(trimmed) ||
        deck.description?.toLowerCase().includes(trimmed) ||
        deck.category?.toLowerCase().includes(trimmed)
    );
  }, [deckMetas, query]);

  function handleCreate(values: DeckFormValues) {
    const result = createDeck(values);
    if (result.ok) {
      toast.success(`Created "${values.title}"`);
    }
    return result;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">My Decks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a deck, import one from a PDF, or search your library.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" nativeButton={false} render={<Link href="/import" />}>
              <FileUp className="size-4" />
              Import PDF
            </Button>
            <Button
              onClick={() => {
                setCreateFormKey((k) => k + 1);
                setCreateOpen(true);
              }}
            >
              <Plus className="size-4" />
              Add Deck
            </Button>
          </div>
        </div>
        <SearchBar value={query} onChange={setQuery} placeholder="Search decks or topics…" />
      </div>
      <DeckGrid decks={filteredDecks} hasAnyDecks={deckMetas.length > 0} />

      <DeckFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        formKey={createFormKey}
        onSubmit={handleCreate}
      />
    </div>
  );
}
