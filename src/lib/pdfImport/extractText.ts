function ensureReadableStreamAsyncIterator() {
  // Some Safari/WebKit versions ship ReadableStream without Symbol.asyncIterator support,
  // which pdf.js relies on internally (`for await (const value of readableStream)` in
  // getTextContent). Polyfill it so pdf.js's stream consumption works everywhere.
  const proto = ReadableStream.prototype as ReadableStream & {
    [Symbol.asyncIterator]?: () => AsyncIterator<unknown>;
  };
  if (typeof proto[Symbol.asyncIterator] === "function") return;

  proto[Symbol.asyncIterator] = function (this: ReadableStream) {
    const reader = this.getReader();
    return {
      next: () => reader.read(),
      return: (value?: unknown) => {
        reader.releaseLock();
        return Promise.resolve({ done: true as const, value });
      },
      [Symbol.asyncIterator]() {
        return this;
      },
    };
  };
}

export async function extractTextFromPdf(file: File): Promise<string> {
  ensureReadableStreamAsyncIterator();

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const buffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = "";
    let lastY: number | null = null;

    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
      currentLine += item.str + (item.hasEOL ? "" : " ");
      lastY = y;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    pageTexts.push(lines.join("\n"));
  }

  return pageTexts.join("\n");
}
