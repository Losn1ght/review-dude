import type { CustomDeckRecord, Deck, DeckFormValues, Flashcard } from "@/lib/types";

const NAMESPACE = "review-dude";
const CUSTOM_DECKS_KEY = `${NAMESPACE}:custom-decks`;
const NEXT_CARD_ID_KEY = `${NAMESPACE}:next-custom-card-id`;
const CUSTOM_CARD_ID_BASE = 100000;

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

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: CustomDeckRecord[] | null = null;

function notify(): void {
  listeners.forEach((listener) => listener());
}

function load(): CustomDeckRecord[] {
  if (cache === null) {
    cache = readJSON<CustomDeckRecord[]>(CUSTOM_DECKS_KEY, []);
  }
  return cache;
}

function persist(next: CustomDeckRecord[]): void {
  cache = next;
  writeJSON(CUSTOM_DECKS_KEY, next);
  notify();
}

function nextCardId(count: number): number {
  const current = readJSON<number>(NEXT_CARD_ID_KEY, CUSTOM_CARD_ID_BASE);
  const start = current;
  writeJSON(NEXT_CARD_ID_KEY, current + count);
  return start;
}

function generateDeckId(): string {
  if (isBrowser() && "randomUUID" in window.crypto) {
    return `custom-${window.crypto.randomUUID()}`;
  }
  return `custom-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export const emptyCustomDecks: CustomDeckRecord[] = [];

export const customDecks = {
  getAll(): CustomDeckRecord[] {
    return load();
  },
  getById(id: string): CustomDeckRecord | undefined {
    return load().find((deck) => deck.id === id);
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  create(values: DeckFormValues): CustomDeckRecord {
    const now = new Date().toISOString();
    const record: CustomDeckRecord = {
      id: generateDeckId(),
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      category: values.category?.trim() || undefined,
      color: values.color,
      icon: values.icon,
      cards: [],
      createdAt: now,
      updatedAt: now,
    };
    persist([...load(), record]);
    return record;
  },
  createWithCards(values: DeckFormValues, cards: Flashcard[]): CustomDeckRecord {
    const now = new Date().toISOString();
    const startId = nextCardId(cards.length);
    const remapped: Flashcard[] = cards.map((card, i) => ({
      ...card,
      id: startId + i,
    }));
    const record: CustomDeckRecord = {
      id: generateDeckId(),
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      category: values.category?.trim() || undefined,
      color: values.color,
      icon: values.icon,
      cards: remapped,
      createdAt: now,
      updatedAt: now,
    };
    persist([...load(), record]);
    return record;
  },
  update(id: string, values: DeckFormValues): CustomDeckRecord | undefined {
    const all = load();
    const index = all.findIndex((deck) => deck.id === id);
    if (index === -1) return undefined;
    const updated: CustomDeckRecord = {
      ...all[index],
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      category: values.category?.trim() || undefined,
      color: values.color,
      icon: values.icon,
      updatedAt: new Date().toISOString(),
    };
    const next = [...all];
    next[index] = updated;
    persist(next);
    return updated;
  },
  remove(id: string): void {
    persist(load().filter((deck) => deck.id !== id));
  },
  duplicate(source: Deck, overrideTitle?: string): CustomDeckRecord {
    const now = new Date().toISOString();
    const startId = nextCardId(source.cards.length);
    const cards: Flashcard[] = source.cards.map((card, i) => ({
      ...card,
      id: startId + i,
    }));
    const record: CustomDeckRecord = {
      id: generateDeckId(),
      title: overrideTitle?.trim() || `${source.title} (Copy)`,
      description: source.description,
      cards,
      createdAt: now,
      updatedAt: now,
    };
    persist([...load(), record]);
    return record;
  },
};

export function toDeck(record: CustomDeckRecord): Deck {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    cards: record.cards,
  };
}
