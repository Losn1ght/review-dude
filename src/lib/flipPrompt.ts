const NAMESPACE = "review-dude";
const SEEN_KEY = `${NAMESPACE}:seen-flip-prompt`;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function hasSeenFlipPrompt(): boolean {
  if (!isBrowser()) return true;
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markFlipPromptSeen(): void {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode, quota) — fail silently
  }
}
