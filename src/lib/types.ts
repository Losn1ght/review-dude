export type DifficultyRating = "Easy" | "Medium" | "Hard";

export interface Flashcard {
  id: number;
  term: string;
  choices: string[];
  correctAnswer: string;
  definition: string;
  memoryTip?: string;
  category: string;
  difficulty: DifficultyRating;
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  cards: Flashcard[];
}

export const DECK_ICON_KEYS = [
  "book-open",
  "brain",
  "heart-pulse",
  "stethoscope",
  "pill",
  "microscope",
  "bone",
  "activity",
  "users",
  "flask-conical",
  "graduation-cap",
  "star",
] as const;

export type DeckIconKey = (typeof DECK_ICON_KEYS)[number];

export const DECK_COLOR_KEYS = [
  "rose",
  "orange",
  "amber",
  "emerald",
  "teal",
  "sky",
  "indigo",
  "violet",
  "pink",
  "slate",
] as const;

export type DeckColorKey = (typeof DECK_COLOR_KEYS)[number];

export interface DeckMeta {
  id: string;
  title: string;
  description?: string;
  cardCount: number;
  category?: string;
  color?: DeckColorKey;
  icon?: DeckIconKey;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface CustomDeckRecord {
  id: string;
  title: string;
  description?: string;
  category?: string;
  color?: DeckColorKey;
  icon?: DeckIconKey;
  cards: Flashcard[];
  createdAt: string;
  updatedAt: string;
}

export interface DeckFormValues {
  title: string;
  description?: string;
  category?: string;
  color?: DeckColorKey;
  icon?: DeckIconKey;
}

export interface UserCardState {
  cardId: number;
  favorite: boolean;
  lastDifficultyRating?: DifficultyRating;
  timesIncorrect: number;
  timesCorrect: number;
  lastReviewed?: string;
}

export type StudyMode = "normal" | "shuffle" | "favorites" | "incorrect" | "exam";

export interface DeckProgress {
  deckId: string;
  cardsSeen: number[];
  lastMode: StudyMode;
  lastIndex: number;
  updatedAt: string;
}

export interface ExamResult {
  deckId: string;
  score: number;
  total: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
}

export interface DailyActivity {
  date: string;
  cardsStudied: number;
}

export interface StudyStats {
  totalCardsStudied: number;
  totalStudyTimeSeconds: number;
  examResults: ExamResult[];
  dailyActivity: DailyActivity[];
  currentStreak: number;
  longestStreak: number;
}
