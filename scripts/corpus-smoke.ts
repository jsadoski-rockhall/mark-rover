import { Worker } from "node:worker_threads";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { RenderWorkerData, WorkerResult } from "../src/shared/ipc.ts";

const corpusDir = resolve(process.cwd(), "tests/corpus");
const files = (await readdir(corpusDir)).filter((file) => file.endsWith(".md")).toSorted();

function renderMarkdown(markdown: string, documentPath: string): Promise<WorkerResult> {
  return new Promise((resolveRender, rejectRender) => {
    const workerData: RenderWorkerData = { markdown, documentPath };
    const worker = new Worker(resolve(process.cwd(), "src/main/render-worker.ts"), {
      workerData
    });
    worker.once("message", resolveRender);
    worker.once("error", rejectRender);
  });
}

const failures: string[] = [];

for (const file of files) {
  const documentPath = resolve(corpusDir, file);
  const markdown = await readFile(documentPath, "utf8");
  const result = await renderMarkdown(markdown, documentPath);

  if (!result.ok) {
    failures.push(`${file}: render failed: ${result.error}`);
    continue;
  }

  if (result.html.includes("�")) {
    failures.push(`${file}: replacement character (U+FFFD) in rendered output`);
  }

  if (/<script/i.test(result.html)) failures.push(`${file}: script tag survived`);
  if (/<iframe/i.test(result.html)) failures.push(`${file}: iframe tag survived`);
  if (/onerror=|onclick=/i.test(result.html)) failures.push(`${file}: event handler survived`);

  if (file === "smoke.md" && !/loading="lazy"/.test(result.html)) {
    failures.push("smoke.md: lazy image attribute missing");
  }

  if (file === "smoke.md" && !/src="mark-rover-file:\/\//.test(result.html)) {
    failures.push("smoke.md: relative image was not rewritten to mark-rover-file protocol");
  }

  if (file === "task-list.md" && !/type="checkbox"/.test(result.html)) {
    failures.push("task-list.md: checkbox input missing");
  }

  if (file === "table-heavy.md" && !/<table>/.test(result.html)) {
    failures.push("table-heavy.md: table missing");
  }

  if (file === "table-wide.md") {
    const headerCells = result.html.match(/<th>/g)?.length ?? 0;
    if (headerCells < 12) {
      failures.push(`table-wide.md: expected 12 header cells, found ${headerCells}`);
    }
  }

  if (file === "table-long.md") {
    const bodyRows = result.html.match(/<tr>/g)?.length ?? 0;
    if (bodyRows < 48) {
      failures.push(`table-long.md: expected at least 48 rows, found ${bodyRows}`);
    }
  }

  if (file === "code-heavy.md" && !/hljs-/.test(result.html)) {
    failures.push("code-heavy.md: highlight.js classes missing");
  }

  if (file === "smoke.md" && !/id="smoke-document"/.test(result.html)) {
    failures.push("smoke.md: heading anchor missing");
  }

  if (file === "smoke.md" && !/href="#code-section"/.test(result.html)) {
    failures.push("smoke.md: anchor link missing");
  }

  if (file === "smoke.md" && result.meta.direction !== "ltr") {
    failures.push("smoke.md: document direction should be inferred as ltr");
  }

  if (file === "non-english-glyphs.md") {
    // One representative sample per script/glyph family. Each must survive
    // worker rendering and sanitization byte-for-byte.
    const glyphSamples = [
      "smörgåsbord",
      "Tiếng Việt",
      "Ελληνικά",
      "французских",
      "ひらがな",
      "視野無限廣",
      "다람쥐",
      "العربية",
      "עברית",
      "देवनागरी",
      "தமிழ்",
      "👩‍💻",
      "∑ ∏ √ ∞",
      "€ £ ¥ ₹",
      "ffi ffl",
      "grüße",
      "λ = α + β × Δ"
    ];
    for (const sample of glyphSamples) {
      if (!result.html.includes(sample)) {
        failures.push(`non-english-glyphs.md: sample did not survive rendering: ${sample}`);
      }
    }
  }

  if (file === "rtl-mixed.md") {
    if (result.meta.direction !== "rtl") {
      failures.push("rtl-mixed.md: document direction should be inferred as rtl");
    }
    if (!/<p dir="ltr">/.test(result.html)) {
      failures.push(
        "rtl-mixed.md: LTR paragraph inside RTL document missing explicit dir attribute"
      );
    }
    if (/<pre[^>]*dir="rtl"/.test(result.html)) {
      failures.push("rtl-mixed.md: code block must not be marked rtl");
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Rendered ${files.length} corpus files successfully.`);
