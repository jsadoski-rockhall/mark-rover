import { app, BrowserWindow, clipboard, ipcMain, protocol, shell } from "electron";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { Worker } from "node:worker_threads";
import { fileURLToPath } from "node:url";
import type { RenderState, RenderWorkerData, WorkerResult } from "../shared/ipc.ts";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "mark-rover-file",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
]);

const startedAt = performance.now();
const rendererUrl = process.env.MARK_ROVER_RENDERER_URL;
const bench = process.env.MARK_ROVER_BENCH === "1";
const here = fileURLToPath(new URL(".", import.meta.url));
const cdpPort = process.env.MARK_ROVER_CDP_PORT;

if (cdpPort) {
  app.commandLine.appendSwitch("remote-debugging-port", cdpPort);
}

let mainWindow: BrowserWindow | undefined;
let currentDocument: { path: string | null } | null = null;
let renderState: RenderState = {
  status: "idle",
  html: "",
  meta: {},
  error: null
};
let firstViewportReadyEmitted = false;

async function markFirstViewportReadyFromDomProbe(): Promise<void> {
  if (!bench || !mainWindow) return;
  const win = mainWindow;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const result = await win.webContents.executeJavaScript(
      "Boolean(document.querySelector('[data-testid=\"document\"]')?.textContent?.trim())"
    );
    if (result) {
      metric("first_viewport_ready", { source: "main-dom-probe" });
      return;
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 25));
  }
}

function metric(event: string, extra: Record<string, unknown> = {}): void {
  if (!bench) return;
  if (event === "first_viewport_ready") {
    if (firstViewportReadyEmitted) return;
    firstViewportReadyEmitted = true;
  }
  process.stdout.write(
    `${JSON.stringify({ app: "mark-rover", event, t: performance.now() - startedAt, ...extra })}\n`
  );
  if (event === "first_viewport_ready") {
    setTimeout(() => app.quit(), 20);
  }
}

function getRenderWorkerPath(): string {
  const bundledPath = resolve(here, "render-worker.cjs");
  if (!app.isPackaged) return bundledPath;

  const unpackedPath = resolve(
    process.resourcesPath,
    "app.asar.unpacked/dist/main/render-worker.cjs"
  );
  return existsSync(unpackedPath) ? unpackedPath : bundledPath;
}

function getDocumentPath(): string | null {
  const marker = process.argv.lastIndexOf("--");
  const rawPath = marker >= 0 ? process.argv[marker + 1] : process.argv.at(-1);
  if (!rawPath || rawPath === "." || rawPath.endsWith("electron")) return null;
  return isAbsolute(rawPath) ? rawPath : resolve(process.cwd(), rawPath);
}

function createWindow(): void {
  metric("window_requested");
  const win = new BrowserWindow({
    width: 980,
    height: 760,
    minWidth: 420,
    minHeight: 320,
    show: false,
    title: currentDocument ? `Mark Rover - ${currentDocument.path}` : "Mark Rover",
    backgroundColor: "#f8fafc",
    webPreferences: {
      preload: resolve(here, "../preload/preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });
  mainWindow = win;

  win.once("ready-to-show", () => {
    metric("window_ready");
    win.show();
  });

  win.webContents.on("did-finish-load", () => {
    metric("first_paint");
  });

  win.webContents.on("console-message", (_event, level, message) => {
    metric("renderer_console", { level, message });
  });

  win.webContents.on("preload-error", (_event, preloadPath, error) => {
    metric("preload_error", { preloadPath, message: error.message });
  });

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (event) => {
    event.preventDefault();
  });

  if (rendererUrl) {
    win.loadURL(rendererUrl);
  } else {
    win.loadFile(resolve(here, "../../dist/renderer/index.html"));
  }
}

async function renderDocument(documentPath: string | null): Promise<void> {
  if (!documentPath) {
    renderState = {
      status: "ready",
      html: "<h1>Mark Rover</h1><p>Open a markdown file to begin.</p>",
      meta: { bytes: 0 },
      error: null
    };
    return;
  }

  currentDocument = { path: documentPath };
  renderState = { status: "loading", html: "", meta: {}, error: null };
  metric("file_read_start");
  const markdown = await readFile(documentPath, "utf8");
  metric("file_read_done", { bytes: Buffer.byteLength(markdown) });
  metric("parse_start");

  const workerData: RenderWorkerData = { markdown, documentPath };
  const worker = new Worker(getRenderWorkerPath(), { workerData });

  worker.once("message", (message: WorkerResult) => {
    if (message.ok) {
      metric("parse_done", { bytes: Buffer.byteLength(markdown), ...message.meta });
      renderState = {
        status: "ready",
        html: message.html,
        meta: { ...message.meta, documentPath },
        error: null
      };
      metric("model_ready", { ...message.meta });
    } else {
      renderState = {
        status: "error",
        html: "",
        meta: {},
        error: message.error || "Unknown render failure"
      };
    }
    mainWindow?.webContents.send("document:update", renderState);
    if (message.ok) {
      markFirstViewportReadyFromDomProbe();
    }
  });

  worker.once("error", (error: Error) => {
    metric("parse_error", { message: error.message });
    renderState = { status: "error", html: "", meta: {}, error: error.message };
    mainWindow?.webContents.send("document:update", renderState);
  });

  worker.once("exit", (code: number) => {
    if (code !== 0 && renderState.status === "loading") {
      metric("parse_exit", { code });
      renderState = {
        status: "error",
        html: "",
        meta: {},
        error: `Worker exited with code ${code}`
      };
      mainWindow?.webContents.send("document:update", renderState);
    }
  });
}

ipcMain.handle("document:get", () => renderState);
ipcMain.handle("clipboard:write-text", (_event, text) => {
  clipboard.writeText(String(text));
  return true;
});
ipcMain.handle("link:open-external", async (_event, href) => {
  const url = new URL(String(href));
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`Unsupported external protocol: ${url.protocol}`);
  }
  await shell.openExternal(url.toString());
  return true;
});
ipcMain.on("metric:first-viewport-ready", () => metric("first_viewport_ready"));

// NOTE: do not `await app.whenReady()` at the top level of this ESM entry
// point. Electron does not emit the `ready` event until the main module has
// finished evaluating, so a top-level await on `whenReady()` deadlocks the
// app (it launches but never opens a window). Run startup from the callback.
app.whenReady().then(async () => {
  metric("process_start");
  protocol.handle("mark-rover-file", async (request) => {
    const encodedPath = request.url.replace("mark-rover-file://", "");
    const filePath = decodeURIComponent(encodedPath);
    const bytes = await readFile(filePath);
    return new Response(bytes);
  });
  currentDocument = { path: getDocumentPath() };
  createWindow();
  await renderDocument(currentDocument.path);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
