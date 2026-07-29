export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Intentionally point at a missing worker script: some mobile Safari versions throw
  // uncatchable errors communicating with a real pdf.js web worker over postMessage.
  // Pointing at a 404 makes the real Worker fail to load, which pdf.js's own fallback
  // logic catches, dropping to an in-page "fake worker" that runs on the main thread
  // instead (verified locally as reliable for files this size).
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf-worker-disabled.mjs";

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
