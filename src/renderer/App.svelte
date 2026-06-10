<script lang="ts">
  import { onMount, tick } from "svelte";
  import { layout, prepare, type LayoutResult } from "@chenglou/pretext";
  import type { RenderState } from "../shared/ipc.ts";

  type Locale = "en" | "es";
  type FontKey = "serif" | "sans" | "mono" | "slab" | "comic" | "script";
  type Treatment = "broadsheet" | "manuscript" | "console";
  type Messages = Record<string, string>;

  interface ReaderPreferences {
    measure: number;
    fontSize: number;
    lineHeight: number;
    font: FontKey;
    ligatures: boolean;
    locale: Locale;
    treatment: Treatment;
    codeLineNumbers: boolean;
  }

  const preferenceKey = "mark-rover.reader-preferences";
  const widthOptions: number[] = [66, 70, 88];
  const treatmentOptions: { key: string; value: Treatment }[] = [
    { key: "treatmentBroadsheet", value: "broadsheet" },
    { key: "treatmentManuscript", value: "manuscript" },
    { key: "treatmentConsole", value: "console" }
  ];
  const treatmentValues = new Set<Treatment>(treatmentOptions.map((option) => option.value));
  const fontOptions: { key: string; value: FontKey }[] = [
    { key: "fontSerif", value: "serif" },
    { key: "fontSans", value: "sans" },
    { key: "fontMono", value: "mono" },
    { key: "fontSlab", value: "slab" },
    { key: "fontComic", value: "comic" },
    { key: "fontScript", value: "script" }
  ];
  const localeOptions: { label: string; value: Locale }[] = [
    { label: "English", value: "en" },
    { label: "Español", value: "es" }
  ];
  const messages: Record<Locale, Messages> = {
    en: {
      appName: "Mark Rover",
      lineWidth: "Line width",
      lineHeight: "Line",
      textSize: "Size",
      ligatures: "Ligatures",
      treatment: "Treatment",
      treatmentBroadsheet: "Broadsheet",
      treatmentManuscript: "Manuscript",
      treatmentConsole: "Console",
      loading: "Loading document...",
      openExternalTitle: "Open external link?",
      cancel: "Cancel",
      open: "Open",
      copy: "Copy",
      copied: "Copied",
      locale: "Locale",
      lineNumbers: "Line numbers",
      renderingDiagram: "Rendering diagram...",
      mermaidFailed: "Mermaid failed",
      tokens: "tokens",
      pretextLines: "pretext lines",
      fontSerif: "Serif",
      fontSans: "Sans",
      fontMono: "Mono",
      fontSlab: "Slab",
      fontComic: "Comic",
      fontScript: "Script"
    },
    es: {
      appName: "Mark Rover",
      lineWidth: "Ancho de línea",
      lineHeight: "Línea",
      textSize: "Tamaño",
      ligatures: "Ligaduras",
      treatment: "Estilo",
      treatmentBroadsheet: "Broadsheet",
      treatmentManuscript: "Manuscrito",
      treatmentConsole: "Consola",
      loading: "Cargando documento...",
      openExternalTitle: "¿Abrir enlace externo?",
      cancel: "Cancelar",
      open: "Abrir",
      copy: "Copiar",
      copied: "Copiado",
      locale: "Idioma",
      lineNumbers: "Números de línea",
      renderingDiagram: "Renderizando diagrama...",
      mermaidFailed: "Mermaid falló",
      tokens: "tokens",
      pretextLines: "líneas pretext",
      fontSerif: "Serif",
      fontSans: "Sans",
      fontMono: "Mono",
      fontSlab: "Slab",
      fontComic: "Comic",
      fontScript: "Script"
    }
  };
  // Each stack ends with the platform emoji fonts so emoji never fall through
  // to a glyphless last-resort font on Windows or Linux.
  const emojiFallback = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';
  const fontStacks: Record<FontKey, string> = {
    serif: `Georgia, Cambria, "Times New Roman", serif, ${emojiFallback}`,
    sans: `Inter, ui-sans-serif, system-ui, sans-serif, ${emojiFallback}`,
    mono: `"SFMono-Regular", Consolas, "Liberation Mono", monospace, ${emojiFallback}`,
    slab: `Rockwell, "Roboto Slab", "American Typewriter", serif, ${emojiFallback}`,
    comic: `"Comic Sans MS", "Comic Sans", cursive, ${emojiFallback}`,
    script: `"Snell Roundhand", "Brush Script MT", cursive, ${emojiFallback}`
  };

  let state: RenderState = {
    status: "loading",
    html: "",
    meta: {},
    error: null
  };
  function noop(): void {}

  let preferences: ReaderPreferences = {
    measure: 70,
    fontSize: 18,
    lineHeight: 1.68,
    font: "serif",
    ligatures: true,
    locale: "en",
    treatment: "broadsheet",
    codeLineNumbers: false
  };
  let pretextStats: LayoutResult | null = null;
  let pendingExternalLink: string | null = null;

  $: readerStyle = [
    `--reader-measure: ${preferences.measure}ch`,
    `--reader-font-size: ${preferences.fontSize}px`,
    `--reader-line-height: ${preferences.lineHeight}`,
    `--reader-font: ${fontStacks[preferences.font]}`,
    `--reader-ligatures: ${preferences.ligatures ? "common-ligatures contextual" : "none"}`
  ].join("; ");
  $: t = messages[preferences.locale] ?? messages.en;

  function savePreferences(): void {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  }

  function updatePreference<K extends keyof ReaderPreferences>(
    key: K,
    value: ReaderPreferences[K]
  ): void {
    preferences = { ...preferences, [key]: value };
    savePreferences();
    queuePretextProbe();
  }

  function queuePretextProbe(): void {
    if (localStorage.getItem("mark-rover.pretext-probe") === "off") return;
    requestAnimationFrame(runPretextProbe);
  }

  function runPretextProbe(): void {
    const article = document.querySelector('[data-testid="document"]');
    const firstParagraph = article?.querySelector("p");
    if (!article || !firstParagraph?.textContent) return;

    const fontSize = preferences.fontSize;
    const width = Math.min(article.clientWidth || 720, preferences.measure * fontSize * 0.56);
    const lineHeightPx = fontSize * preferences.lineHeight;
    const prepared = prepare(
      firstParagraph.textContent,
      `${fontSize}px ${fontStacks[preferences.font]}`
    );
    pretextStats = layout(prepared, width, lineHeightPx);
  }

  function enhanceCodeBlocks(): void {
    const article = document.querySelector('[data-testid="document"]');
    if (!article) return;

    for (const pre of article.querySelectorAll("pre")) {
      const code = pre.querySelector("code");
      if (!code) continue;

      // The gutter is always built; the line-numbers preference only toggles
      // its visibility via the `show-line-numbers` class on the article. It
      // sits outside <code>, so copy (which reads code.textContent) and text
      // selection (user-select: none) never pick up the numbers.
      if (
        pre.dataset.lineNumbered !== "true" &&
        !code.classList.contains("language-mermaid")
      ) {
        const codeText = (code.textContent ?? "").replace(/\n$/, "");
        const lineCount = codeText === "" ? 1 : codeText.split("\n").length;
        const gutter = document.createElement("span");
        gutter.className = "line-number-gutter";
        gutter.setAttribute("aria-hidden", "true");
        gutter.textContent = Array.from({ length: lineCount }, (_, line) => String(line + 1)).join(
          "\n"
        );
        pre.dataset.lineNumbered = "true";
        pre.classList.add("line-numbered");
        pre.prepend(gutter);
      }

      if (pre.dataset.copyEnhanced === "true") continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "copy-code-button";
      button.textContent = t.copy;
      button.addEventListener("click", async () => {
        await window.markRover.copyText(code.textContent ?? "");
        button.textContent = t.copied;
        setTimeout(() => {
          button.textContent = t.copy;
        }, 900);
      });

      pre.dataset.copyEnhanced = "true";
      pre.append(button);
    }
  }

  function hashText(text: string): string {
    let hash = 5381;
    for (let index = 0; index < text.length; index += 1) {
      hash = (hash * 33) ^ text.charCodeAt(index);
    }
    return (hash >>> 0).toString(36);
  }

  function enhanceTaskLists(): void {
    const article = document.querySelector('[data-testid="document"]');
    const documentPath = state.meta?.documentPath ?? "untitled";
    if (!article) return;

    article
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((input, index) => {
        if (input.dataset.taskEnhanced === "true") return;

        const labelText = input.closest("li")?.textContent?.trim() ?? `task-${index}`;
        const key = `mark-rover.task:${documentPath}:${index}:${hashText(labelText)}`;
        const saved = localStorage.getItem(key);
        if (saved !== null) {
          input.checked = saved === "true";
        }

        input.disabled = false;
        input.dataset.taskEnhanced = "true";
        input.addEventListener("change", () => {
          localStorage.setItem(key, String(input.checked));
        });
      });
  }

  function enhanceLinks(): void {
    const article = document.querySelector('[data-testid="document"]');
    if (!article) return;

    article.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
      if (anchor.dataset.linkEnhanced === "true") return;
      anchor.dataset.linkEnhanced = "true";
      anchor.addEventListener("click", (event) => {
        const href = anchor.getAttribute("href") ?? "";
        if (href.startsWith("#")) return;

        event.preventDefault();

        if (/^https?:\/\//i.test(href)) {
          pendingExternalLink = new URL(href).toString();
        }
      });
    });
  }

  function handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Element | null;
    const anchor = target?.closest("a[href]");
    if (!anchor) return;
    if (!anchor.closest('[data-testid="document"]')) return;

    const href = anchor.getAttribute("href") ?? "";
    if (href.startsWith("#")) return;

    event.preventDefault();

    if (/^https?:\/\//i.test(href)) {
      pendingExternalLink = new URL(href).toString();
    }
  }

  function enhanceTables(): void {
    const article = document.querySelector('[data-testid="document"]');
    if (!article) return;

    article.querySelectorAll("table").forEach((table) => {
      if (table.dataset.tableEnhanced === "true") return;
      const rowCount = table.querySelectorAll("tbody tr").length;
      const columnCount =
        table.querySelectorAll("thead th").length ||
        table.querySelectorAll("tr:first-child > *").length;
      table.dataset.tableEnhanced = "true";
      table.dataset.rows = String(rowCount);
      table.dataset.columns = String(columnCount);
      if (rowCount >= 8 || columnCount >= 6) {
        table.classList.add("large-markdown-table");
      }
    });
  }

  function enhanceMermaid(): void {
    const article = document.querySelector('[data-testid="document"]');
    if (!article) return;

    const blocks = Array.from(article.querySelectorAll("pre > code.language-mermaid"));
    if (blocks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          renderMermaidBlock(entry.target as HTMLElement);
        }
      },
      { rootMargin: "420px 0px" }
    );

    blocks.forEach((code, index) => {
      const pre = code.parentElement;
      if (!pre || pre.dataset.mermaidEnhanced === "true") return;
      pre.dataset.mermaidEnhanced = "true";
      pre.dataset.mermaidIndex = String(index);
      pre.dataset.loadingLabel = t.renderingDiagram;
      pre.classList.add("mermaid-placeholder");
      observer.observe(pre);
    });
  }

  async function renderMermaidBlock(pre: HTMLElement): Promise<void> {
    const code = pre.querySelector("code");
    if (!code) return;

    pre.classList.add("mermaid-loading");
    try {
      const mermaid = await import("mermaid");
      mermaid.default.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default"
      });
      const id = `mark-rover-mermaid-${Date.now()}-${pre.dataset.mermaidIndex}`;
      const { svg } = await mermaid.default.render(id, code.textContent ?? "");
      const figure = document.createElement("figure");
      figure.className = "mermaid-figure";
      figure.innerHTML = svg;
      pre.replaceWith(figure);
    } catch (error) {
      pre.classList.add("mermaid-error");
      pre.append(`\n${t.mermaidFailed}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      pre.classList.remove("mermaid-loading");
    }
  }

  async function approveExternalLink(): Promise<void> {
    if (!pendingExternalLink) return;
    const href = pendingExternalLink;
    pendingExternalLink = null;
    await window.markRover.openExternalLink(href);
  }

  async function markReady(): Promise<void> {
    await tick();
    window.markRover?.firstViewportReady();
  }

  async function initializeDocument(): Promise<() => void> {
    const saved = localStorage.getItem(preferenceKey);
    if (saved) {
      preferences = { ...preferences, ...(JSON.parse(saved) as Partial<ReaderPreferences>) };
    }
    if (!treatmentValues.has(preferences.treatment)) {
      preferences = { ...preferences, treatment: "broadsheet" };
    }
    state = await window.markRover.getDocument();
    if (state.status === "ready") markReady();
    if (state.status === "ready") {
      queuePretextProbe();
      enhanceCodeBlocks();
      enhanceTaskLists();
      enhanceLinks();
      enhanceTables();
      enhanceMermaid();
    }
    const unsubscribe = window.markRover.onDocumentUpdate((nextState) => {
      state = nextState;
      if (state.status === "ready") markReady();
      if (state.status === "ready") {
        queuePretextProbe();
        requestAnimationFrame(enhanceCodeBlocks);
        requestAnimationFrame(enhanceTaskLists);
        requestAnimationFrame(enhanceLinks);
        requestAnimationFrame(enhanceTables);
        requestAnimationFrame(enhanceMermaid);
      }
    });
    return unsubscribe;
  }

  onMount(() => {
    let unsubscribeDocumentUpdates: () => void = noop;
    document.addEventListener("click", handleDocumentClick, true);
    initializeDocument().then((unsubscribe) => {
      unsubscribeDocumentUpdates = unsubscribe;
      return undefined;
    });

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      unsubscribeDocumentUpdates();
    };
  });
</script>

<main
  class="app-shell min-h-screen text-slate-950 transition-colors dark:text-zinc-50"
  class:treatment-broadsheet={preferences.treatment === "broadsheet"}
  class:treatment-manuscript={preferences.treatment === "manuscript"}
  class:treatment-console={preferences.treatment === "console"}
>
  <div class="mx-auto flex min-h-screen w-full max-w-[96ch] flex-col px-5 py-6 sm:px-8 lg:px-10">
    <header class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 font-ui text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
      <div class="font-ui font-semibold tracking-wide text-slate-700 dark:text-zinc-200">{t.appName}</div>
      <div class="flex flex-wrap items-center gap-3">
        <fieldset class="flex items-center gap-1" aria-label={t.treatment}>
          {#each treatmentOptions as option}
            <button
              class:active-control={preferences.treatment === option.value}
              class="control-button"
              type="button"
              on:click={() => updatePreference("treatment", option.value)}
            >
              {t[option.key]}
            </button>
          {/each}
        </fieldset>
        <fieldset class="flex items-center gap-1" aria-label={t.lineWidth}>
          {#each widthOptions as width}
            <button
              class:active-control={preferences.measure === width}
              class="control-button"
              type="button"
              on:click={() => updatePreference("measure", width)}
            >
              {width}
            </button>
          {/each}
        </fieldset>
        <label class="flex items-center gap-2">
          <span>{t.lineHeight}</span>
          <input
            class="h-1 w-24 accent-slate-900 dark:accent-zinc-100"
            type="range"
            min="1.35"
            max="2"
            step="0.01"
            value={preferences.lineHeight}
            on:input={(event) => updatePreference("lineHeight", Number(event.currentTarget.value))}
          />
        </label>
        <label class="flex items-center gap-2">
          <span>{t.textSize}</span>
          <input
            class="h-1 w-24 accent-slate-900 dark:accent-zinc-100"
            type="range"
            min="14"
            max="24"
            step="1"
            value={preferences.fontSize}
            aria-label={t.textSize}
            data-testid="text-size-slider"
            on:input={(event) => updatePreference("fontSize", Number(event.currentTarget.value))}
          />
          <output class="tabular-nums" data-testid="text-size-value">{preferences.fontSize}</output>
        </label>
        <select
          class="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={preferences.font}
          on:change={(event) => updatePreference("font", event.currentTarget.value as FontKey)}
        >
          {#each fontOptions as option}
            <option value={option.value}>{t[option.key]}</option>
          {/each}
        </select>
        <select
          class="rounded border border-slate-300 bg-white px-2 py-1 text-slate-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          value={preferences.locale}
          aria-label={t.locale}
          data-testid="locale-select"
          on:change={(event) => updatePreference("locale", event.currentTarget.value as Locale)}
        >
          {#each localeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={preferences.ligatures}
            on:change={(event) => updatePreference("ligatures", event.currentTarget.checked)}
          />
          <span>{t.ligatures}</span>
        </label>
        <label class="flex items-center gap-2">
          <input
            type="checkbox"
            checked={preferences.codeLineNumbers}
            data-testid="line-numbers-toggle"
            on:change={(event) => updatePreference("codeLineNumbers", event.currentTarget.checked)}
          />
          <span>{t.lineNumbers}</span>
        </label>
      </div>
      {#if state.status === "ready"}
        <div>
          {state.meta?.tokens ?? 0} {t.tokens}{#if pretextStats} · {pretextStats.lineCount} {t.pretextLines}{/if}
        </div>
      {/if}
    </header>

    {#if state.status === "loading" || state.status === "idle"}
      <section class="grid flex-1 place-items-center">
        <div class="text-center font-ui text-sm text-slate-500 dark:text-zinc-400">{t.loading}</div>
      </section>
    {:else if state.status === "error"}
      <section class="rounded border border-red-300 bg-red-50 p-4 font-ui text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
        {state.error}
      </section>
    {:else}
      <article
        class="reader prose-mark-rover"
        class:show-line-numbers={preferences.codeLineNumbers}
        style={readerStyle}
        dir={state.meta?.direction ?? "ltr"}
        data-testid="document">{@html state.html}</article>
    {/if}
  </div>
</main>

{#if pendingExternalLink}
  <div class="modal-backdrop" role="presentation">
    <div class="security-modal" role="dialog" aria-modal="true" aria-labelledby="external-link-title">
      <h2 id="external-link-title">{t.openExternalTitle}</h2>
      <p>{pendingExternalLink}</p>
      <div class="modal-actions">
        <button type="button" class="secondary-action" on:click={() => (pendingExternalLink = null)}>{t.cancel}</button>
        <button type="button" class="primary-action" on:click={approveExternalLink}>{t.open}</button>
      </div>
    </div>
  </div>
{/if}
