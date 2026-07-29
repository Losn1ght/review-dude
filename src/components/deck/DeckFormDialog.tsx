"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeckIcon } from "@/components/deck/DeckIcon";
import { cn } from "@/lib/utils";
import { DECK_COLOR_KEYS, DECK_ICON_KEYS } from "@/lib/types";
import type { DeckColorKey, DeckFormValues, DeckIconKey } from "@/lib/types";
import { getDeckColorClasses } from "@/lib/deckStyle";

interface DeckFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  /** Changing this remounts the form with fresh values — bump it each time the dialog is opened. */
  formKey: string | number;
  initialValues?: DeckFormValues;
  onSubmit: (values: DeckFormValues) => { ok: boolean; error?: string };
}

const EMPTY_VALUES: DeckFormValues = {
  title: "",
  description: "",
  category: "",
  color: "slate",
  icon: "book-open",
};

export function DeckFormDialog({ open, onOpenChange, mode, formKey, initialValues, onSubmit }: DeckFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DeckFormBody
          key={formKey}
          mode={mode}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface DeckFormBodyProps {
  mode: "create" | "edit";
  initialValues?: DeckFormValues;
  onSubmit: (values: DeckFormValues) => { ok: boolean; error?: string };
  onCancel: () => void;
  onSuccess: () => void;
}

function DeckFormBody({ mode, initialValues, onSubmit, onCancel, onSuccess }: DeckFormBodyProps) {
  const [values, setValues] = useState<DeckFormValues>(initialValues ?? EMPTY_VALUES);
  const [error, setError] = useState<string | undefined>();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = onSubmit(values);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    onSuccess();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === "create" ? "Create a new deck" : "Edit deck"}</DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Give your deck a name and optional details. You can add cards later."
            : "Update this deck's details. Changes save immediately."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="deck-title" className="text-xs font-medium text-muted-foreground">
            Deck name
          </label>
          <Input
            id="deck-title"
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="e.g. Cardiology Essentials"
            autoFocus
            maxLength={60}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="deck-description" className="text-xs font-medium text-muted-foreground">
            Description <span className="text-muted-foreground/70">(optional)</span>
          </label>
          <Input
            id="deck-description"
            value={values.description ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="What is this deck for?"
            maxLength={140}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="deck-category" className="text-xs font-medium text-muted-foreground">
            Category <span className="text-muted-foreground/70">(optional)</span>
          </label>
          <Input
            id="deck-category"
            value={values.category ?? ""}
            onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}
            placeholder="e.g. Cardiology"
            maxLength={40}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Cover color</p>
          <div className="flex flex-wrap gap-2">
            {DECK_COLOR_KEYS.map((color) => {
              const classes = getDeckColorClasses(color);
              const isSelected = values.color === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={`Color ${color}`}
                  aria-pressed={isSelected}
                  onClick={() => setValues((v) => ({ ...v, color: color as DeckColorKey }))}
                  className={cn(
                    "flex size-7 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110",
                    classes.bg,
                    isSelected && "ring-2"
                  )}
                >
                  {isSelected && <Check className="size-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Icon</p>
          <div className="flex flex-wrap gap-2">
            {DECK_ICON_KEYS.map((iconKey) => {
              const isSelected = values.icon === iconKey;
              return (
                <button
                  key={iconKey}
                  type="button"
                  aria-label={`Icon ${iconKey}`}
                  aria-pressed={isSelected}
                  onClick={() => setValues((v) => ({ ...v, icon: iconKey as DeckIconKey }))}
                  className={cn(
                    "flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted",
                    isSelected && "border-primary bg-primary/10"
                  )}
                >
                  <DeckIcon icon={iconKey} className="size-4" />
                </button>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Create Deck" : "Save Changes"}</Button>
        </DialogFooter>
      </form>
    </>
  );
}
