/// <reference types="svelte" />
/// <reference types="vite/client" />

import type { MarkRoverApi } from "../shared/ipc.ts";

declare global {
  interface Window {
    markRover: MarkRoverApi;
  }
}
