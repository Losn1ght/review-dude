"use client";

import { useCallback } from "react";
import { useIsClient } from "@/hooks/useIsClient";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const isClient = useIsClient();

  const readValue = useCallback((): T => {
    if (!isClient) return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch {
      return initialValue;
    }
  }, [isClient, key, initialValue]);

  const value = readValue();

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = readValue();
      const resolved = next instanceof Function ? next(current) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // ignore write errors (quota, private mode)
      }
    },
    [key, readValue]
  );

  return [value, update, isClient];
}
