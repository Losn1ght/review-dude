import type { DeckProgress, StudyStats, UserCardState } from "@/lib/types";

const NAMESPACE = "review-dude";

const KEYS = {
  cardStates: `${NAMESPACE}:card-states`,
  progress: `${NAMESPACE}:progress`,
  stats: `${NAMESPACE}:stats`,
  theme: `${NAMESPACE}:theme`,
} as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private mode, quota) — fail silently
  }
}

const defaultStats: StudyStats = {
  totalCardsStudied: 0,
  totalStudyTimeSeconds: 0,
  examResults: [],
  dailyActivity: [],
  currentStreak: 0,
  longestStreak: 0,
};

type Listener = () => void;
const cardStateListeners = new Set<Listener>();
let cardStatesCache: Record<number, UserCardState> | null = null;

function notifyCardStateListeners(): void {
  cardStateListeners.forEach((listener) => listener());
}

const statsListeners = new Set<Listener>();
let statsCache: StudyStats | null = null;

function notifyStatsListeners(): void {
  statsListeners.forEach((listener) => listener());
}

export const storage = {
  getCardStates(): Record<number, UserCardState> {
    if (cardStatesCache === null) {
      cardStatesCache = readJSON(KEYS.cardStates, {} as Record<number, UserCardState>);
    }
    return cardStatesCache;
  },
  setCardStates(states: Record<number, UserCardState>): void {
    cardStatesCache = states;
    writeJSON(KEYS.cardStates, states);
    notifyCardStateListeners();
  },
  getCardState(cardId: number): UserCardState | undefined {
    return this.getCardStates()[cardId];
  },
  updateCardState(cardId: number, patch: Partial<UserCardState>): UserCardState {
    const states = { ...this.getCardStates() };
    const existing: UserCardState =
      states[cardId] ??
      ({
        cardId,
        favorite: false,
        timesIncorrect: 0,
        timesCorrect: 0,
      } as UserCardState);
    const next: UserCardState = { ...existing, ...patch, cardId };
    states[cardId] = next;
    this.setCardStates(states);
    return next;
  },
  subscribeCardStates(listener: Listener): () => void {
    cardStateListeners.add(listener);
    return () => cardStateListeners.delete(listener);
  },

  getAllProgress(): Record<string, DeckProgress> {
    return readJSON(KEYS.progress, {} as Record<string, DeckProgress>);
  },
  getDeckProgress(deckId: string): DeckProgress | undefined {
    return this.getAllProgress()[deckId];
  },
  setDeckProgress(progress: DeckProgress): void {
    const all = this.getAllProgress();
    all[progress.deckId] = progress;
    writeJSON(KEYS.progress, all);
  },

  getStats(): StudyStats {
    if (statsCache === null) {
      statsCache = readJSON(KEYS.stats, defaultStats);
    }
    return statsCache;
  },
  setStats(stats: StudyStats): void {
    statsCache = stats;
    writeJSON(KEYS.stats, stats);
    notifyStatsListeners();
  },
  subscribeStats(listener: Listener): () => void {
    statsListeners.add(listener);
    return () => statsListeners.delete(listener);
  },

  getTheme(): "light" | "dark" | undefined {
    return readJSON<"light" | "dark" | undefined>(KEYS.theme, undefined);
  },
  setTheme(theme: "light" | "dark"): void {
    writeJSON(KEYS.theme, theme);
  },
};

const emptyCardStates: Record<number, UserCardState> = {};

export function getEmptyCardStates(): Record<number, UserCardState> {
  return emptyCardStates;
}

export function getDefaultStats(): StudyStats {
  return defaultStats;
}

export { KEYS as STORAGE_KEYS };
