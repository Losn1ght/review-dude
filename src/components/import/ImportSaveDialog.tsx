"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImportSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckTitle: string;
  cardCount: number;
  unresolvedCount: number;
  onConfirm: () => void;
}

export function ImportSaveDialog({
  open,
  onOpenChange,
  deckTitle,
  cardCount,
  unresolvedCount,
  onConfirm,
}: ImportSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle>Save &ldquo;{deckTitle}&rdquo;?</DialogTitle>
          <DialogDescription>
            This will add a new deck with {cardCount} flashcard{cardCount === 1 ? "" : "s"} to your
            library.
            {unresolvedCount > 0 && (
              <>
                {" "}
                <strong>{unresolvedCount}</strong> card{unresolvedCount === 1 ? "" : "s"} still{" "}
                {unresolvedCount === 1 ? "has" : "have"} an unconfirmed answer — you can still save
                and fix them later from the deck.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Continue Editing
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirm &amp; Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
