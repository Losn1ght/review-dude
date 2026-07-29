"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudyMode } from "@/lib/types";

interface ModeSelectorProps {
  mode: StudyMode;
  onChange: (mode: StudyMode) => void;
}

const MODES: { value: StudyMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "shuffle", label: "Shuffle" },
  { value: "favorites", label: "Favorites" },
  { value: "incorrect", label: "Incorrect Review" },
  { value: "exam", label: "Exam Mode" },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <Select value={mode} onValueChange={(value) => onChange(value as StudyMode)}>
      <SelectTrigger aria-label="Study mode" className="w-[170px]">
        <SelectValue placeholder="Select mode" />
      </SelectTrigger>
      <SelectContent>
        {MODES.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
