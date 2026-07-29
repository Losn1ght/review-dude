"use client";

import { useEffect } from "react";

export interface KeyboardShortcutHandlers {
  onFlip?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onFavorite?: () => void;
  onShuffle?: () => void;
  onRestart?: () => void;
}

function isTextInputFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  const tag = active.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    active.getAttribute("contenteditable") === "true"
  );
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (isTextInputFocused()) return;

      switch (event.key) {
        case " ":
        case "Spacebar":
          event.preventDefault();
          handlers.onFlip?.();
          break;
        case "ArrowRight":
          handlers.onNext?.();
          break;
        case "ArrowLeft":
          handlers.onPrev?.();
          break;
        case "f":
        case "F":
          handlers.onFavorite?.();
          break;
        case "s":
        case "S":
          handlers.onShuffle?.();
          break;
        case "r":
        case "R":
          handlers.onRestart?.();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers, enabled]);
}
