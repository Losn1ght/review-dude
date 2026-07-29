"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { getEmptyCardStates, storage } from "@/lib/storage";
import { buildSessionQueue } from "@/lib/studySession";
import { shuffleArray } from "@/lib/shuffle";
import { recordCardStudied, recordExamResult, recordStudyTime } from "@/lib/stats";
import type { Deck, DifficultyRating, ExamResult, Flashcard, StudyMode } from "@/lib/types";

export interface ExamAnswer {
  cardId: number;
  selectedChoice: string;
  correct: boolean;
}

function subscribeCardStates(callback: () => void) {
  return storage.subscribeCardStates(callback);
}

function buildInitialQueue(deck: Deck | undefined): Flashcard[] {
  if (!deck) return [];
  return buildSessionQueue(deck.cards, "normal", {});
}

export function useStudySession(deck: Deck | undefined) {
  const cardStates = useSyncExternalStore(
    subscribeCardStates,
    storage.getCardStates.bind(storage),
    getEmptyCardStates
  );

  const [mode, setModeState] = useState<StudyMode>("normal");
  const [queue, setQueue] = useState<Flashcard[]>(() => buildInitialQueue(deck));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [examAnswers, setExamAnswers] = useState<ExamAnswer[]>([]);
  const [examComplete, setExamComplete] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const studiedCardIds = useRef<Set<number>>(new Set());
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }
  }, []);

  const resetSessionState = useCallback((newQueue: Flashcard[]) => {
    setQueue(newQueue);
    setCurrentIndex(0);
    setFlipped(false);
    setAnswers({});
    setExamAnswers([]);
    setExamComplete(false);
    setExamResult(null);
    sessionStartRef.current = Date.now();
    setElapsedSeconds(0);
  }, []);

  const rebuildQueue = useCallback(
    (nextMode: StudyMode) => {
      if (!deck) {
        resetSessionState([]);
        return;
      }
      resetSessionState(buildSessionQueue(deck.cards, nextMode, storage.getCardStates()));
    },
    [deck, resetSessionState]
  );

  const deckId = deck?.id;
  const prevDeckIdRef = useRef(deckId);
  if (prevDeckIdRef.current !== deckId) {
    prevDeckIdRef.current = deckId;
    setModeState("normal");
    setQueue(buildInitialQueue(deck));
    setCurrentIndex(0);
    setFlipped(false);
    setAnswers({});
    setExamAnswers([]);
    setExamComplete(false);
    setExamResult(null);
  }

  const setMode = useCallback(
    (nextMode: StudyMode) => {
      setModeState(nextMode);
      rebuildQueue(nextMode);
    },
    [rebuildQueue]
  );

  const restart = useCallback(() => {
    rebuildQueue(mode);
  }, [mode, rebuildQueue]);

  const shuffleQueue = useCallback(() => {
    setQueue((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setFlipped(false);
  }, []);

  const currentCard = queue[currentIndex];
  const selectedChoice = currentCard ? answers[currentCard.id] ?? null : null;

  useEffect(() => {
    if (currentCard && !studiedCardIds.current.has(currentCard.id)) {
      studiedCardIds.current.add(currentCard.id);
      recordCardStudied(1);
    }
  }, [currentCard]);

  useEffect(() => {
    return () => {
      const start = sessionStartRef.current ?? Date.now();
      const elapsed = Math.round((Date.now() - start) / 1000);
      if (elapsed > 0) recordStudyTime(elapsed);
    };
  }, [deckId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const start = sessionStartRef.current ?? Date.now();
      setElapsedSeconds(Math.round((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const flip = useCallback(() => {
    if (!selectedChoice) return;
    setFlipped((prev) => !prev);
  }, [selectedChoice]);

  const selectChoice = useCallback(
    (choice: string): boolean => {
      if (flipped || selectedChoice || !currentCard) return false;
      setAnswers((prev) => ({ ...prev, [currentCard.id]: choice }));
      const correct = choice === currentCard.correctAnswer;
      if (mode === "exam") {
        setExamAnswers((prev) => [
          ...prev.filter((a) => a.cardId !== currentCard.id),
          { cardId: currentCard.id, selectedChoice: choice, correct },
        ]);
      }
      return correct;
    },
    [mode, flipped, selectedChoice, currentCard]
  );

  const goNext = useCallback(() => {
    if (!queue.length) return;
    if (mode === "exam" && currentIndex === queue.length - 1) {
      setExamAnswers((answers) => {
        const correctCount = answers.filter((a) => a.correct).length;
        const total = queue.length;
        const result: ExamResult = {
          deckId: deckId ?? "",
          score: correctCount,
          total,
          percentage: total > 0 ? Math.round((correctCount / total) * 100) : 0,
          timeSpentSeconds: elapsedSeconds,
          completedAt: new Date().toISOString(),
        };
        setExamResult(result);
        setExamComplete(true);
        recordExamResult(result);
        return answers;
      });
      return;
    }
    setCurrentIndex((prev) => Math.min(prev + 1, queue.length - 1));
    setFlipped(false);
  }, [queue.length, mode, currentIndex, deckId, elapsedSeconds]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    setFlipped(false);
  }, []);

  const jumpTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= queue.length) return;
      setCurrentIndex(index);
      setFlipped(false);
    },
    [queue.length]
  );

  const toggleFavorite = useCallback(() => {
    if (!currentCard) return;
    const existing = storage.getCardState(currentCard.id);
    storage.updateCardState(currentCard.id, { favorite: !(existing?.favorite ?? false) });
  }, [currentCard]);

  const rateCard = useCallback(
    (rating: DifficultyRating) => {
      if (!currentCard) return;
      const existing = storage.getCardState(currentCard.id);
      const correct = rating !== "Hard";
      storage.updateCardState(currentCard.id, {
        lastDifficultyRating: rating,
        lastReviewed: new Date().toISOString(),
        timesCorrect: (existing?.timesCorrect ?? 0) + (correct ? 1 : 0),
        timesIncorrect: (existing?.timesIncorrect ?? 0) + (correct ? 0 : 1),
      });
    },
    [currentCard]
  );

  const isFavorite = useCallback(
    (cardId: number) => Boolean(cardStates[cardId]?.favorite),
    [cardStates]
  );

  const progressPercent = useMemo(() => {
    if (queue.length === 0) return 0;
    return Math.round(((currentIndex + 1) / queue.length) * 100);
  }, [currentIndex, queue.length]);

  const score = useMemo(() => {
    let correct = 0;
    let attempted = 0;
    for (const card of queue) {
      const answer = answers[card.id];
      if (answer !== undefined) {
        attempted += 1;
        if (answer === card.correctAnswer) correct += 1;
      }
    }
    return { correct, attempted };
  }, [queue, answers]);

  return {
    mode,
    setMode,
    queue,
    currentIndex,
    currentCard,
    flipped,
    flip,
    selectedChoice,
    selectChoice,
    examAnswers,
    examComplete,
    examResult,
    goNext,
    goPrev,
    jumpTo,
    restart,
    shuffleQueue,
    toggleFavorite,
    isFavorite,
    rateCard,
    cardStates,
    progressPercent,
    elapsedSeconds,
    score,
    isHydrated: true,
    remaining: Math.max(queue.length - currentIndex - 1, 0),
  };
}
