"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImportUploadStep } from "@/components/import/ImportUploadStep";
import { ImportCardEditor } from "@/components/import/ImportCardEditor";
import { ImportSaveDialog } from "@/components/import/ImportSaveDialog";
import { extractTextFromPdf } from "@/lib/pdfImport/extractText";
import { parseFlashcardsFromText, type DraftFlashcard } from "@/lib/pdfImport/parseFlashcards";
import { useCustomDecks } from "@/hooks/useCustomDecks";
import type { DeckFormValues } from "@/lib/types";

function guessTitleFromFileName(fileName: string): string {
  const withoutExt = fileName.replace(/\.pdf$/i, "");
  const spaced = withoutExt.replace(/[-_]+/g, " ").trim();
  if (!spaced) return "Imported Deck";
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

function blankCard(id: number): DraftFlashcard {
  return {
    id,
    term: "",
    choices: ["", "", "", ""],
    correctAnswer: "",
    definition: "",
    category: "General",
    difficulty: "Medium",
    answerResolved: true,
  };
}

export default function ImportPage() {
  const router = useRouter();
  const { createDeckWithCards } = useCustomDecks();

  const [step, setStep] = useState<"upload" | "review">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [cards, setCards] = useState<DraftFlashcard[]>([]);
  const [deckMeta, setDeckMeta] = useState<DeckFormValues>({ title: "", description: "", category: "" });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const nextTempId = useRef(1);

  async function handleFileSelected(file: File) {
    setIsProcessing(true);
    setUploadError(undefined);
    try {
      const text = await extractTextFromPdf(file);
      const result = parseFlashcardsFromText(text);
      if (result.cards.length === 0) {
        setUploadError(result.warnings[0] ?? "No flashcards could be detected in this PDF.");
        setIsProcessing(false);
        return;
      }
      nextTempId.current = result.cards.length + 1;
      setCards(result.cards);
      setWarnings(result.warnings);
      setDeckMeta({
        title: guessTitleFromFileName(file.name),
        description: `Imported from ${file.name}`,
        category: result.suggestedCategories[0] ?? "",
      });
      setStep("review");
    } catch (err) {
      console.error("PDF import failed:", err);
      // TEMPORARY: showing raw error on-screen to debug mobile-only failures. Revert once diagnosed.
      setUploadError(
        `We couldn't read that PDF. Debug info: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function updateCard(index: number, patch: Partial<DraftFlashcard>) {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function updateChoice(index: number, choiceIndex: number, value: string) {
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;
        const oldChoice = c.choices[choiceIndex];
        const nextChoices = c.choices.map((ch, j) => (j === choiceIndex ? value : ch));
        const correctAnswer = c.correctAnswer === oldChoice ? value : c.correctAnswer;
        return { ...c, choices: nextChoices, correctAnswer };
      })
    );
  }

  function moveCard(index: number, direction: -1 | 1) {
    setCards((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeCard(index: number) {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }

  function addCard() {
    const id = nextTempId.current++;
    setCards((prev) => [...prev, blankCard(id)]);
  }

  function handleConfirmSave() {
    const finalCards = cards.map((card) => ({
      id: card.id,
      term: card.term,
      choices: card.choices,
      correctAnswer: card.correctAnswer,
      definition: card.definition,
      memoryTip: card.memoryTip,
      category: card.category,
      difficulty: card.difficulty,
    }));
    const result = createDeckWithCards(deckMeta, finalCards);
    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    toast.success(`Saved "${deckMeta.title}" with ${finalCards.length} cards`);
    if (result.deckId) {
      router.push(`/study/${result.deckId}`);
    } else {
      router.push("/");
    }
  }

  if (step === "upload") {
    return (
      <ImportUploadStep
        onFileSelected={handleFileSelected}
        isProcessing={isProcessing}
        error={uploadError}
      />
    );
  }

  const unresolvedCount = cards.filter((c) => !c.answerResolved).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft className="size-4" />
          Cancel
        </Button>
        <Button onClick={() => setSaveDialogOpen(true)}>Save Deck</Button>
      </div>

      <h1 className="text-2xl font-semibold">Review &amp; Confirm</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        We found {cards.length} flashcard{cards.length === 1 ? "" : "s"}. Edit anything below before
        saving — questions, choices, answers, explanations, or the deck details.
      </p>

      {warnings.length > 0 && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Please double-check {warnings.length} item(s):</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {warnings.slice(0, 6).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
              {warnings.length > 6 && <li>…and {warnings.length - 6} more</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Deck name</label>
          <Input
            value={deckMeta.title}
            onChange={(e) => setDeckMeta((v) => ({ ...v, title: e.target.value }))}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <Input
              value={deckMeta.description ?? ""}
              onChange={(e) => setDeckMeta((v) => ({ ...v, description: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <Input
              value={deckMeta.category ?? ""}
              onChange={(e) => setDeckMeta((v) => ({ ...v, category: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {cards.map((card, i) => (
          <ImportCardEditor
            key={card.id}
            card={card}
            index={i}
            total={cards.length}
            onChange={(patch) => updateCard(i, patch)}
            onChoiceChange={(choiceIndex, value) => updateChoice(i, choiceIndex, value)}
            onMoveUp={() => moveCard(i, -1)}
            onMoveDown={() => moveCard(i, 1)}
            onRemove={() => removeCard(i)}
          />
        ))}
      </div>

      <Button type="button" variant="outline" className="mt-4 w-full" onClick={addCard}>
        <Plus className="size-4" />
        Add Card
      </Button>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => setSaveDialogOpen(true)}>Save Deck</Button>
      </div>

      {saveError && <p className="mt-2 text-right text-sm text-destructive">{saveError}</p>}

      <ImportSaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        deckTitle={deckMeta.title || "Untitled Deck"}
        cardCount={cards.length}
        unresolvedCount={unresolvedCount}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}
