// Shared contract between the Electron main process, the render worker, the
// preload bridge, and the Svelte renderer. These types are erased at build
// time; nothing here emits runtime code.

type RenderStatus = "idle" | "loading" | "ready" | "error";

export type DocumentDirection = "ltr" | "rtl";

interface RenderMeta {
  bytes?: number;
  tokens?: number;
  images?: number;
  renderDurationMs?: number;
  documentPath?: string;
  direction?: DocumentDirection;
}

export interface RenderState {
  status: RenderStatus;
  html: string;
  meta: RenderMeta;
  error: string | null;
}

/** Data passed into the render worker via `workerData`. */
export interface RenderWorkerData {
  markdown: string;
  documentPath: string;
}

interface WorkerMeta {
  tokens: number;
  images: number;
  renderDurationMs: number;
  direction: DocumentDirection;
}

/** Message the render worker posts back to the main process. */
export type WorkerResult =
  | { ok: true; html: string; meta: WorkerMeta }
  | { ok: false; error: string };

/** API surface exposed on `window.markRover` by the preload bridge. */
export interface MarkRoverApi {
  getDocument(): Promise<RenderState>;
  copyText(text: string): Promise<boolean>;
  openExternalLink(href: string): Promise<boolean>;
  onDocumentUpdate(callback: (state: RenderState) => void): () => void;
  firstViewportReady(): void;
}
