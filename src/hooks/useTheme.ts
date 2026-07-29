"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { storage } from "@/lib/storage";
import { useIsClient } from "@/hooks/useIsClient";

export type Theme = "light" | "dark";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredThemeSnapshot(): Theme | "system" {
  return storage.getTheme() ?? "system";
}

function getServerThemeSnapshot(): Theme | "system" {
  return "system";
}

function subscribeSystemPreference(callback: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSystemPrefersDarkSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSystemPrefersDarkSnapshot(): boolean {
  return false;
}

export function useTheme(): { theme: Theme; toggleTheme: () => void; isReady: boolean } {
  const storedTheme = useSyncExternalStore(subscribeStorage, getStoredThemeSnapshot, getServerThemeSnapshot);
  const systemPrefersDark = useSyncExternalStore(
    subscribeSystemPreference,
    getSystemPrefersDarkSnapshot,
    getServerSystemPrefersDarkSnapshot
  );
  const isReady = useIsClient();

  const theme: Theme = storedTheme === "system" ? (systemPrefersDark ? "dark" : "light") : storedTheme;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    storage.setTheme(next);
    window.dispatchEvent(new StorageEvent("storage", { key: "review-dude:theme" }));
  }, [theme]);

  return { theme, toggleTheme, isReady };
}
