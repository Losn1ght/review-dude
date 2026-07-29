# Review Dude

A personal flashcard study app built with Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, and Framer Motion. No backend — decks are created by you (manually or by importing a PDF), and all deck data and progress live in `localStorage`.

## Features

- Build your own deck library: create decks manually, duplicate an existing deck, or **import flashcards straight from a PDF** (`/import`) with a Review & Confirm screen before saving.
- Full deck CRUD: create, rename/edit (name, description, category, color, icon), duplicate, and permanently delete, with a confirmation dialog before deleting.
- 3D flip flashcards (Framer Motion `rotateY` + `preserve-3d` + `backfaceVisibility`) showing a multiple-choice question on the front and the answer, explanation, and memory tip on the back. Choosing an answer is required before the card flips, and shows a correct/incorrect toast immediately.
- 5 study modes: Normal, Shuffle, Favorites, Incorrect Review, and Exam (scored, with a results summary).
- Difficulty rating (Easy/Medium/Hard) persisted per card and used to build the Incorrect Review queue.
- Per-deck progress tracking, a stats dashboard (streaks, study time, average exam score, weekly activity chart), and favorites.
- Dark mode with `localStorage` persistence and `prefers-color-scheme` fallback on first visit.
- Keyboard shortcuts: `Space` flip, `←/→` prev/next, `F` favorite, `S` shuffle, `R` restart (disabled while typing in a text field).
- Touch gestures on mobile: swipe left/right for next/prev, tap to flip, double-tap to favorite.
- Fully responsive (375px / 768px / 1440px) and accessible (semantic buttons, `aria-label`/`aria-pressed`, focus rings).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The deck library starts empty — use **Add Deck** or **Import PDF** on the home page to create your first deck.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint

## Data Model

See `src/lib/types.ts`. The core types:

```ts
interface Flashcard {
  id: number;
  term: string;
  choices: string[];
  correctAnswer: string;
  definition: string;
  memoryTip?: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface Deck {
  id: string;
  title: string;
  description?: string;
  cards: Flashcard[];
}

interface UserCardState {
  cardId: number;
  favorite: boolean;
  lastDifficultyRating?: "Easy" | "Medium" | "Hard";
  timesIncorrect: number;
  timesCorrect: number;
  lastReviewed?: string;
}

type StudyMode = "normal" | "shuffle" | "favorites" | "incorrect" | "exam";
```

All decks are user-created and stored via `src/lib/customDecks.ts`, which persists `CustomDeckRecord`s (title, description, category, color, icon, cards, timestamps) to `localStorage` with an in-memory cache and a subscribe/notify pair for `useSyncExternalStore`. `src/lib/deckRegistry.ts` is a thin lookup layer over that store used by the pages. Each new/imported/duplicated card gets a globally unique `id` from a monotonic counter, so per-card user state (`UserCardState`) never collides across decks.

## Architecture Notes

- **Storage** (`src/lib/storage.ts`, `src/lib/customDecks.ts`): small SSR-safe `localStorage` wrappers. Each caches parsed values in memory and exposes a subscribe/notify pair so React reads them via `useSyncExternalStore` without ever touching `localStorage` during server rendering.
- **Study session** (`src/hooks/useStudySession.ts`): owns the per-mode card queue, current index, flip/reveal state, exam scoring, and elapsed time. Mode-specific queue construction lives in `src/lib/studySession.ts`.
- **PDF import** (`src/lib/pdfImport/`): `extractText.ts` pulls raw text out of a PDF client-side via `pdfjs-dist`; `parseFlashcards.ts` is a heuristic text parser tuned for numbered questions with lettered choices, an `Answer:` line, and a `Rationale:`/`Explanation:` line — not an LLM call (there's no backend to host one). The `/import` page always shows a Review & Confirm step so anything the parser gets wrong is easy to fix before saving.
- **Theme** (`src/hooks/useTheme.ts`): reads/writes the `dark` class on `<html>`, backed by `useSyncExternalStore` for both the stored preference and the `prefers-color-scheme` media query, plus a tiny inline script in `layout.tsx` that applies the theme before first paint to avoid a flash of the wrong theme.
- **UI primitives**: `Button`, `Card`, `Badge`, `Progress`, `Dialog`, `Input`, `Switch`, `Select`, `Separator`, `DropdownMenu` come from shadcn/ui (`src/components/ui`), themed via CSS variables in `globals.css` (`:root` / `.dark`). The flip card itself is custom (shadcn has no primitive for a 3D flip), but its front/back faces reuse the same card surface styling.

## Data Persistence & Multi-User Note

Everything lives in `localStorage` in the browser — there's no account system, database, or API. That means:

- Deploying to Vercel works with zero configuration (no env vars, no backend).
- Each person who opens the site has their own independent deck library and progress, stored only in their own browser. Nothing is shared between different people or different browsers/devices for the same person.
- Clearing browser data, switching browsers, or a mobile browser's own storage-eviction policy can wipe it — there's no backup.

If you want decks shared between people, synced across devices, or durably backed up, swap `storage.ts`/`customDecks.ts` for a real backend (Supabase/Firebase) behind the same function signatures — that's exactly what this layer was designed to make painless.

## Future Extensibility

- Swap `localStorage` for a real backend (Supabase/Firebase) behind the same storage interfaces to add accounts and cross-device sync.
- Add SM-2 spaced repetition scheduling on top of the existing `UserCardState` (it already tracks correct/incorrect counts and last review date).
- Additional import formats (DOCX, TXT, CSV, OCR for images) by adding new modules alongside `src/lib/pdfImport/` that produce the same parsed-card shape.
- CSV/JSON export of decks.
- PWA support (offline caching, installable manifest).

## Deploying

This is a standard Next.js app with no environment variables or backend services required — it deploys to [Vercel](https://vercel.com/new) with zero configuration.
