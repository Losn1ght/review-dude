"use client";

import { useRef } from "react";
import type { TouchEvent as ReactTouchEvent } from "react";

export interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
}

const SWIPE_THRESHOLD = 50;
const DOUBLE_TAP_DELAY = 300;

export function useSwipe(handlers: SwipeHandlers) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastTapTime = useRef(0);

  function onTouchStart(event: ReactTouchEvent) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: ReactTouchEvent) {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handlers.onSwipeLeft?.();
      } else {
        handlers.onSwipeRight?.();
      }
      return;
    }

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      const now = Date.now();
      if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
        handlers.onDoubleTap?.();
        lastTapTime.current = 0;
      } else {
        lastTapTime.current = now;
        window.setTimeout(() => {
          if (Date.now() - lastTapTime.current >= DOUBLE_TAP_DELAY) {
            handlers.onTap?.();
          }
        }, DOUBLE_TAP_DELAY);
      }
    }
  }

  return { onTouchStart, onTouchEnd };
}
