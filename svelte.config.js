import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// Picked up by both vite-plugin-svelte (at build/dev time) and svelte-check
// (at type-check time) so `<script lang="ts">` is understood everywhere.
export default {
  preprocess: vitePreprocess()
};
