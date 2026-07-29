"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckTitle: string;
  cardCount: number;
  onConfirm: () => void;
}

export function DeleteDeckDialog({
  open,
  onOpenChange,
  deckTitle,
  cardCount,
  onConfirm,
}: DeleteDeckDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
          </div>
          <DialogTitle>Delete &ldquo;{deckTitle}&rdquo;?</DialogTitle>
          <DialogDescription>
            This will permanently delete this deck and all {cardCount} flashcard
            {cardCount === 1 ? "" : "s"} inside it, including your favorites, ratings, and
            progress for this deck. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete Deck
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
