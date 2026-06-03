const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("markRover", {
  getDocument: () => ipcRenderer.invoke("document:get"),
  copyText: (text) => ipcRenderer.invoke("clipboard:write-text", text),
  openExternalLink: (href) => ipcRenderer.invoke("link:open-external", href),
  onDocumentUpdate: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("document:update", listener);
    return () => ipcRenderer.off("document:update", listener);
  },
  firstViewportReady: () => ipcRenderer.send("metric:first-viewport-ready")
});
