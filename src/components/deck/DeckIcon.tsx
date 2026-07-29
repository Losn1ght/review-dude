import { createElement } from "react";
import { getDeckIcon } from "@/lib/deckStyle";
import type { DeckIconKey } from "@/lib/types";

interface DeckIconProps {
  icon: DeckIconKey | undefined;
  className?: string;
}

export function DeckIcon({ icon, className }: DeckIconProps) {
  return createElement(getDeckIcon(icon), { className, "aria-hidden": true });
}
