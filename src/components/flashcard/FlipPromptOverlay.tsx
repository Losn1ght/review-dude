"use client";

import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";

interface FlipPromptOverlayProps {
  overlayKey: string;
  message: string;
}

const VISIBLE_MS = 5000;
const FADE_MS = 350;
const TOTAL_S = (FADE_MS * 2 + VISIBLE_MS) / 1000;
const FADE_IN_END = FADE_MS / (FADE_MS * 2 + VISIBLE_MS);
const FADE_OUT_START = 1 - FADE_IN_END;

export function FlipPromptOverlay({ overlayKey, message }: FlipPromptOverlayProps) {
  return (
    <motion.div
      key={overlayKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: TOTAL_S,
        times: [0, FADE_IN_END, FADE_OUT_START, 1],
        ease: "easeInOut",
      }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 backdrop-blur-sm"
    >
      <motion.div
        animate={{ rotateY: [0, 20, 0, -20, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <RotateCw className="size-7 text-primary" aria-hidden="true" />
      </motion.div>
      <p className="px-6 text-center text-sm font-medium text-foreground">{message}</p>
    </motion.div>
  );
}
