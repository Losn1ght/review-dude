"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/flashcard/Flashcard";
import { StudyControls } from "@/components/study/StudyControls";
import { ProgressBar } from "@/components/study/ProgressBar";
import { ExamSummary } from "@/components/study/ExamSummary";
import { useStudySession } from "@/hooks/useStudySession";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useIsClient } from "@/hooks/useIsClient";
import { customDecks, emptyCustomDecks, toDeck } from "@/lib/customDecks";
import Link from "next/link";

export default function StudyPage() {
  const params = useParams<{ deckId: string }>();
  const router = useRouter();
  const isClient = useIsClient();
  const customRecords = useSyncExternalStore(
    customDecks.subscribe,
    customDecks.getAll,
    () => emptyCustomDecks
  );

  const deck = useMemo(() => {
    const record = customRecords.find((r) => r.id === params.deckId);
    return record ? toDeck(record) : undefined;
  }, [params.deckId, customRecords]);

  const session = useStudySession(deck);

  const handleSelectChoice = useCallback(
    (choice: string) => {
      const card = session.currentCard;
      const correct = session.selectChoice(choice);
      if (!card) return;
      if (correct) {
        toast.success("Correct!");
      } else {
        toast.error(`Incorrect — the answer was "${card.correctAnswer}"`);
      }
    },
    [session]
  );

  useKeyboardShortcuts(
    {
      onFlip: session.flip,
      onNext: session.goNext,
      onPrev: session.goPrev,
      onFavorite: session.toggleFavorite,
      onShuffle: session.shuffleQueue,
      onRestart: session.restart,
    },
    session.isHydrated && !session.examComplete
  );

  if (!deck) {
    if (!isClient) {
      return (
        <div className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-muted-foreground">
          Loading study session…
        </div>
      );
    }
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
        <Search className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-xl font-semibold">Deck not found</h1>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t find a deck with that id.
        </p>
        <Button onClick={() => router.push("/")}>Back to Decks</Button>
      </div>
    );
  }

  if (session.examComplete && session.examResult) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ExamSummary result={session.examResult} onRestart={session.restart} />
      </div>
    );
  }

  if (session.queue.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">No cards in this mode yet</h1>
        <p className="text-sm text-muted-foreground">
          {session.mode === "favorites"
            ? "You haven't favorited any cards in this deck yet."
            : "You don't have any cards flagged for incorrect review yet."}
        </p>
        <StudyControls
          mode={session.mode}
          onModeChange={session.setMode}
          onPrev={session.goPrev}
          onNext={session.goNext}
          onShuffle={session.shuffleQueue}
          onRestart={session.restart}
          onJump={session.jumpTo}
          onToggleFavorite={session.toggleFavorite}
          isFavorite={false}
          canGoPrev={false}
          canGoNext={false}
          total={0}
        />
      </div>
    );
  }

  const { currentCard } = session;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft className="size-4" />
          Decks
        </Button>
        <h1 className="text-sm font-semibold text-muted-foreground sm:text-base">{deck.title}</h1>
        <div className="w-[76px]" />
      </div>

      <div className="mx-auto mb-5 max-w-xl">
        <ProgressBar
          current={session.currentIndex}
          total={session.queue.length}
          percent={session.progressPercent}
          score={session.score}
        />
      </div>

      {currentCard && (
        <Flashcard
          card={currentCard}
          flipped={session.flipped}
          isExam={session.mode === "exam"}
          selectedChoice={session.selectedChoice}
          isFavorite={session.isFavorite(currentCard.id)}
          lastRating={session.cardStates[currentCard.id]?.lastDifficultyRating}
          onFlip={session.flip}
          onSelectChoice={handleSelectChoice}
          onToggleFavorite={session.toggleFavorite}
          onRate={session.rateCard}
          onSwipeNext={session.goNext}
          onSwipePrev={session.goPrev}
        />
      )}

      <div className="mt-6">
        <StudyControls
          mode={session.mode}
          onModeChange={session.setMode}
          onPrev={session.goPrev}
          onNext={session.goNext}
          onShuffle={session.shuffleQueue}
          onRestart={session.restart}
          onJump={session.jumpTo}
          onToggleFavorite={session.toggleFavorite}
          isFavorite={currentCard ? session.isFavorite(currentCard.id) : false}
          canGoPrev={session.currentIndex > 0 && session.mode !== "exam"}
          canGoNext={
            session.mode === "exam"
              ? session.flipped
              : session.currentIndex < session.queue.length - 1
          }
          total={session.queue.length}
        />
      </div>
    </div>
  );
}
