"use client";

import { useState } from "react";
import { Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JumpToCardProps {
  total: number;
  onJump: (index: number) => void;
}

export function JumpToCard({ total, onJump }: JumpToCardProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function handleJump() {
    const num = parseInt(value, 10);
    if (!Number.isNaN(num) && num >= 1 && num <= total) {
      onJump(num - 1);
      setOpen(false);
      setValue("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Hash className="size-4" />
        Jump
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jump to card</DialogTitle>
        </DialogHeader>
        <Input
          type="number"
          min={1}
          max={total}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleJump();
          }}
          placeholder={`1 - ${total}`}
          aria-label="Card number"
          autoFocus
        />
        <DialogFooter>
          <Button onClick={handleJump}>Go</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
