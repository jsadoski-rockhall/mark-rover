import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";
import type { MarkRoverApi, RenderState } from "../shared/ipc.ts";

const api: MarkRoverApi = {
  getDocument: () => ipcRenderer.invoke("document:get"),
  copyText: (text) => ipcRenderer.invoke("clipboard:write-text", text),
  openExternalLink: (href) => ipcRenderer.invoke("link:open-external", href),
  onDocumentUpdate: (callback) => {
    const listener = (_event: IpcRendererEvent, state: RenderState) => callback(state);
    ipcRenderer.on("document:update", listener);
    return () => ipcRenderer.off("document:update", listener);
  },
  firstViewportReady: () => ipcRenderer.send("metric:first-viewport-ready")
};

contextBridge.exposeInMainWorld("markRover", api);
