"use client";

import { memo } from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { DeckMenu } from "@/components/deck/DeckMenu";
import { DeckIcon } from "@/components/deck/DeckIcon";
import { getDeckColorClasses, formatUpdatedAt } from "@/lib/deckStyle";
import type { DeckMeta } from "@/lib/types";

interface DeckCardProps {
  deck: DeckMeta;
  progressPercent: number;
  hasProgress: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function DeckCardComponent({ deck, progressPercent, hasProgress, onEdit, onDuplicate, onDelete }: DeckCardProps) {
  const colorClasses = getDeckColorClasses(deck.color);
  const updatedLabel = formatUpdatedAt(deck.updatedAt);

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${colorClasses.bg}`}>
            <DeckIcon icon={deck.icon} className="size-4 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <ProgressRing percent={progressPercent} size={40} strokeWidth={4} />
            <DeckMenu onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
          </div>
        </div>
        <CardTitle className="text-lg">{deck.title}</CardTitle>
        {deck.description && <CardDescription>{deck.description}</CardDescription>}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {deck.category && (
            <Badge variant="secondary" className="text-[10px]">
              {deck.category}
            </Badge>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="size-3.5" aria-hidden="true" />
            {deck.cardCount} card{deck.cardCount === 1 ? "" : "s"}
          </span>
          {updatedLabel && (
            <span className="text-xs text-muted-foreground">Updated {updatedLabel}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="bg-transparent border-t-0 pt-0">
        <Button className="w-full" nativeButton={false} render={<Link href={`/study/${deck.id}`} />}>
          {hasProgress ? "Continue" : "Start Studying"}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export const DeckCard = memo(DeckCardComponent);
