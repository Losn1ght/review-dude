import type { Flashcard } from "@/lib/types";

export interface DraftFlashcard extends Flashcard {
  answerResolved: boolean;
}

export interface ParseResult {
  cards: DraftFlashcard[];
  warnings: string[];
  suggestedCategories: string[];
}

const SECTION_HEADER_RE = /^([IVXLCDM]+)\.\s+(.+?)\s*(?:\(items?\s+[\d\-–—,\s]+\))?\s*$/i;
const QUESTION_START_RE = /^(\d{1,3})[.)]\s+(.*)$/;
const CHOICE_RE = /^([A-F])[.)]\s+(.*)$/;
const ANSWER_RE = /^answer\s*[:\-]\s*([A-F])\b\.?\s*(.*)$/i;
const RATIONALE_RE = /^(rationale|explanation|memory\s*tip)\s*[:\-]\s*(.*)$/i;

interface PendingQuestion {
  number: string;
  category: string;
  termLines: string[];
  choices: { letter: string; text: string }[];
  answerLetter: string | null;
  rationaleLines: string[];
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function isRomanNumeral(token: string): boolean {
  return /^[IVXLCDM]+$/i.test(token);
}

function finalizeQuestion(
  pending: PendingQuestion,
  cards: DraftFlashcard[],
  warnings: string[],
  nextId: () => number
): void {
  const term = normalizeWhitespace(pending.termLines.join(" "));
  if (!term) return;

  const choices = pending.choices.map((c) => normalizeWhitespace(c.text)).filter(Boolean);
  if (choices.length < 2) {
    warnings.push(`Question ${pending.number}: fewer than 2 choices were detected — please review.`);
  }

  let correctAnswer = "";
  let answerResolved = false;
  if (pending.answerLetter) {
    const match = pending.choices.find(
      (c) => c.letter.toUpperCase() === pending.answerLetter?.toUpperCase()
    );
    if (match) {
      correctAnswer = normalizeWhitespace(match.text);
      answerResolved = true;
    }
  }
  if (!answerResolved) {
    warnings.push(`Question ${pending.number}: couldn't confidently match the answer — please select it.`);
    correctAnswer = choices[0] ?? "";
  }

  const definition = normalizeWhitespace(pending.rationaleLines.join(" "));
  if (!definition) {
    warnings.push(`Question ${pending.number}: no rationale/explanation found — consider adding one.`);
  }

  cards.push({
    id: nextId(),
    term,
    choices: choices.length > 0 ? choices : [""],
    correctAnswer,
    definition,
    category: pending.category,
    difficulty: "Medium",
    answerResolved,
  });
}

export function parseFlashcardsFromText(rawText: string): ParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const cards: DraftFlashcard[] = [];
  const warnings: string[] = [];
  const categories = new Set<string>();
  let idCounter = 1;
  const nextId = () => idCounter++;

  let currentCategory = "General";
  let pending: PendingQuestion | null = null;
  let mode: "term" | "choices" | "answer" | "rationale" = "term";

  function flushPending() {
    if (pending) {
      finalizeQuestion(pending, cards, warnings, nextId);
      pending = null;
    }
  }

  for (const line of lines) {
    const sectionMatch = SECTION_HEADER_RE.exec(line);
    if (mode !== "choices" && sectionMatch && isRomanNumeral(sectionMatch[1])) {
      flushPending();
      currentCategory = normalizeWhitespace(sectionMatch[2]);
      categories.add(currentCategory);
      mode = "term";
      continue;
    }

    const questionMatch = QUESTION_START_RE.exec(line);
    if (questionMatch) {
      flushPending();
      pending = {
        number: questionMatch[1],
        category: currentCategory,
        termLines: [questionMatch[2]],
        choices: [],
        answerLetter: null,
        rationaleLines: [],
      };
      mode = "term";
      continue;
    }

    if (!pending) continue;

    const choiceMatch = CHOICE_RE.exec(line);
    if (choiceMatch) {
      pending.choices.push({ letter: choiceMatch[1], text: choiceMatch[2] });
      mode = "choices";
      continue;
    }

    const answerMatch = ANSWER_RE.exec(line);
    if (answerMatch) {
      pending.answerLetter = answerMatch[1];
      mode = "answer";
      continue;
    }

    const rationaleMatch = RATIONALE_RE.exec(line);
    if (rationaleMatch) {
      pending.rationaleLines.push(rationaleMatch[2]);
      mode = "rationale";
      continue;
    }

    if (mode === "term") {
      pending.termLines.push(line);
    } else if (mode === "rationale") {
      pending.rationaleLines.push(line);
    }
    // lines encountered mid-choices/answer that don't match any pattern are ignored
    // (typically stray whitespace artifacts from PDF text extraction)
  }
  flushPending();

  if (cards.length === 0) {
    warnings.unshift(
      "No flashcards could be detected. This works best with numbered questions (\"1.\"), lettered choices (\"A.\"–\"D.\"), an \"Answer:\" line, and a \"Rationale:\" or \"Explanation:\" line."
    );
  }

  return { cards, warnings, suggestedCategories: Array.from(categories) };
}
