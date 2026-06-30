<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    layout,
    measureNaturalWidth,
    prepare,
    prepareWithSegments,
    type LayoutResult
  } from "@chenglou/pretext";
  import type { RenderState } from "../shared/ipc.ts";
  import { isLargeTable } from "../shared/table-threshold.ts";
  import {
    fontStacks,
    treatmentOptions,
    type Locale,
    type Messages,
    type ReaderPreferences,
    type Treatment
  } from "./reader-preferences.ts";
  // The reader's typesetting controls live in a calm, auto-hiding island at
  // the bottom of the window, off the page so reading stays quiet.
  import ControlIsland from "./controls/ControlIsland.svelte";

  const preferenceKey = "mark-rover.reader-preferences";
  const treatmentValues = new Set<Treatment>(treatmentOptions.map((option) => option.value));

  const messages: Record<Locale, Messages> = {
    en: {
      appName: "Mark Rover",
      lineWidth: "Line width",
      lineHeight: "Line",
      textSize: "Size",
      fitText: "Fit",
      ligatures: "Ligatures",
      treatment: "Treatment",
      typeface: "Typeface",
      treatmentFog: "Fog",
      treatmentSage: "Sage",
      treatmentDusk: "Dusk",
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
      fitText: "Ajustar",
      ligatures: "Ligaduras",
      treatment: "Estilo",
      typeface: "Tipografía",
      treatmentFog: "Niebla",
      treatmentSage: "Salvia",
      treatmentDusk: "Penumbra",
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
    fitTextSize: false,
    lineHeight: 1.68,
    font: "serif",
    ligatures: true,
    locale: "en",
    treatment: "fog",
    codeLineNumbers: false
  };
  let pretextStats: LayoutResult | null = null;
  let fittedFontSize: number | null = null;
  let adaptedLineHeight: number | null = null;
  let pendingExternalLink: string | null = null;

  $: effectiveFontSize =
    preferences.fitTextSize && fittedFontSize !== null ? fittedFontSize : preferences.fontSize;
  $: effectiveLineHeight = adaptedLineHeight ?? preferences.lineHeight;
  $: readerStyle = [
    `--reader-measure: ${preferences.measure}ch`,
    `--reader-font-size: ${effectiveFontSize}px`,
    `--reader-line-height: ${effectiveLineHeight}`,
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

  function contentWidth(article: Element): number | null {
    const container = article.parentElement;
    if (!container) return null;
    const containerStyles = getComputedStyle(container);
    const available =
      container.clientWidth -
      parseFloat(containerStyles.paddingLeft) -
      parseFloat(containerStyles.paddingRight);
    return Number.isFinite(available) && available > 0 ? available : null;
  }

  // A representative line of `measure` characters drawn from the document's own
  // prose so pretext measures the glyphs the reader actually sees.
  function referenceLine(article: Element): string {
    const fallback = "the quick brown fox jumps over the lazy dog and keeps on running ";
    let reference = article.querySelector("p")?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    while (reference.length < preferences.measure) reference += ` ${fallback}`;
    return reference.slice(0, preferences.measure);
  }

  // Finds the largest font size (preferred at most, 12px at least) at which a
  // representative line of `measure` characters fits the content width without
  // wrapping. Pretext measures the real font, so the result tracks the actual
  // glyph widths rather than a per-font width heuristic.
  function computeFittedFontSize(article: Element): number {
    const available = contentWidth(article);
    if (available === null) return preferences.fontSize;

    const reference = referenceLine(article);
    const fontAt = (size: number) => `${size}px ${fontStacks[preferences.font]}`;
    let size = preferences.fontSize;
    const naturalWidth = measureNaturalWidth(prepareWithSegments(reference, fontAt(size)));
    if (naturalWidth <= available) return size;

    // Glyph widths scale almost linearly with font size; estimate, then nudge
    // down until the reference line actually fits.
    size = Math.max(12, Math.floor((size * available) / naturalWidth));
    while (
      size > 12 &&
      measureNaturalWidth(prepareWithSegments(reference, fontAt(size))) > available
    ) {
      size -= 1;
    }
    return size;
  }

  // Narrow windows truncate the selected measure: the real line length is set
  // by the window, not the preference. Typographically a shorter measure wants
  // tighter leading, so scale line-height down toward a 1.45 floor in
  // proportion to how much of the selected measure actually fits. Pretext's
  // natural-width measurement makes "how much fits" glyph-accurate.
  function computeNarrowLeading(article: Element, fontSize: number): number | null {
    const floor = 1.45;
    if (preferences.lineHeight <= floor) return null;

    const available = contentWidth(article);
    if (available === null) return null;

    const naturalWidth = measureNaturalWidth(
      prepareWithSegments(referenceLine(article), `${fontSize}px ${fontStacks[preferences.font]}`)
    );
    if (naturalWidth <= available) return null;

    const ratio = available / naturalWidth;
    return Math.round((floor + (preferences.lineHeight - floor) * ratio) * 100) / 100;
  }

  function runPretextProbe(): void {
    const article = document.querySelector('[data-testid="document"]');
    const firstParagraph = article?.querySelector("p");
    if (!article || !firstParagraph?.textContent) return;

    fittedFontSize = preferences.fitTextSize ? computeFittedFontSize(article) : null;
    const fontSize =
      preferences.fitTextSize && fittedFontSize !== null ? fittedFontSize : preferences.fontSize;
    adaptedLineHeight = computeNarrowLeading(article, fontSize);
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
      if (isLargeTable(rowCount, columnCount)) {
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
      preferences = { ...preferences, treatment: "fog" };
    }
    state = await window.markRover.getDocument();
    if (state.status === "ready") markReady();
    if (state.status === "ready") {
      // The state assignment above has not flushed to the DOM yet, and the
      // enhancers query the rendered article.
      await tick();
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

  function handleWindowResize(): void {
    // Both fitted font size and narrow-window leading track the window width.
    queuePretextProbe();
  }

  onMount(() => {
    let unsubscribeDocumentUpdates: () => void = noop;
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("resize", handleWindowResize);
    initializeDocument().then((unsubscribe) => {
      unsubscribeDocumentUpdates = unsubscribe;
      return undefined;
    });

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("resize", handleWindowResize);
      unsubscribeDocumentUpdates();
    };
  });
</script>

<main
  class="app-shell min-h-screen text-slate-950 transition-colors dark:text-zinc-50"
  class:treatment-fog={preferences.treatment === "fog"}
  class:treatment-sage={preferences.treatment === "sage"}
  class:treatment-dusk={preferences.treatment === "dusk"}
>
  <div class="mx-auto flex min-h-screen w-full max-w-[96ch] flex-col px-5 pt-6 pb-28 sm:px-8 lg:px-10">
    <header class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 font-ui text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
      <div class="font-ui font-semibold tracking-wide text-slate-700 dark:text-zinc-200">{t.appName}</div>
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

  {#if state.status === "ready"}
    <ControlIsland {preferences} {t} {effectiveFontSize} update={updatePreference} />
  {/if}
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
