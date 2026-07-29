"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ImportUploadStepProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  error?: string;
}

export function ImportUploadStep({ onFileSelected, isProcessing, error }: ImportUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return;
    }
    onFileSelected(file);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold sm:text-3xl">Import from PDF</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload a PDF of review notes, a handout, or a board-exam questionnaire. We&apos;ll scan it for
        numbered questions with lettered choices, an answer, and a rationale, and turn them into a
        deck you can review before saving.
      </p>

      <Card
        className={`mt-6 border-2 border-dashed ${isDragging ? "border-primary bg-primary/5" : "border-border"}`}
      >
        <CardContent
          className="flex flex-col items-center justify-center gap-3 py-12 text-center"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Reading and analyzing your PDF…</p>
            </>
          ) : (
            <>
              <UploadCloud className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Drag and drop a PDF here, or click below to browse
              </p>
              <Button type="button" onClick={() => inputRef.current?.click()}>
                <FileText className="size-4" />
                Choose PDF
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}
