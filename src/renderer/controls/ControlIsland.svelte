<!-- The reader's control island. The quietest possible surface: a single serif
     "Aa" pill showing the current size, which blooms upward into a specimen
     sheet. Its signature is a live preview that re-typesets itself as you
     adjust, so changing type shows type. Pins itself visible while open. -->
<script lang="ts">
  import {
    fontOptions,
    fontStacks,
    localeOptions,
    treatmentOptions,
    widthOptions,
    type FontKey,
    type Locale,
    type Messages,
    type ReaderPreferences,
    type UpdatePreference
  } from "../reader-preferences.ts";
  import { autoHide } from "./autohide.ts";

  let {
    preferences,
    t,
    effectiveFontSize,
    update
  }: {
    preferences: ReaderPreferences;
    t: Messages;
    effectiveFontSize: number;
    update: UpdatePreference;
  } = $props();

  let expanded = $state(false);

  const faceLabel = $derived(
    t[fontOptions.find((option) => option.value === preferences.font)?.key ?? "fontSerif"]
  );

  // The preview mirrors the reader's own settings. Size is capped so a large
  // reading size still fits two lines inside the sheet and the leading stays
  // legible at a glance.
  const previewStyle = $derived(
    [
      `font-family: ${fontStacks[preferences.font]}`,
      `font-size: ${Math.min(effectiveFontSize, 21)}px`,
      `line-height: ${preferences.lineHeight}`,
      `font-variant-ligatures: ${preferences.ligatures ? "common-ligatures contextual" : "none"}`
    ].join("; ")
  );
</script>

<div class="island-layer">
  <div
    class="island island-cue"
    data-island-pinned={expanded ? "true" : "false"}
    use:autoHide={{ proximity: 120 }}
  >
    {#if expanded}
      <div class="cue-sheet">
        <div class="cue-preview">
          <span class="isl-label">{faceLabel} · {effectiveFontSize}</span>
          <p class="cue-preview-text" style={previewStyle}>
            Reading should feel calm. Type set for the long page.
          </p>
        </div>

        <div class="cue-row">
          <span class="isl-label">{t.treatment}</span>
          <fieldset class="island-group" aria-label={t.treatment}>
            {#each treatmentOptions as option}
              <button
                class="control-button"
                class:active-control={preferences.treatment === option.value}
                type="button"
                on:click={() => update("treatment", option.value)}
              >
                {t[option.key]}
              </button>
            {/each}
          </fieldset>
        </div>

        <div class="cue-row">
          <span class="isl-label">{t.lineWidth}</span>
          <fieldset class="island-group" aria-label={t.lineWidth}>
            {#each widthOptions as width}
              <button
                class="control-button"
                class:active-control={preferences.measure === width}
                type="button"
                on:click={() => update("measure", width)}
              >
                {width}
              </button>
            {/each}
          </fieldset>
        </div>

        <div class="cue-row">
          <span class="isl-label">{t.textSize}</span>
          <div class="cue-controls">
            <input
              class="isl-range isl-range-wide"
              type="range"
              min="14"
              max="24"
              step="1"
              value={preferences.fontSize}
              aria-label={t.textSize}
              data-testid="text-size-slider"
              on:input={(event) => update("fontSize", Number(event.currentTarget.value))}
            />
            <output class="isl-readout tabular-nums" data-testid="text-size-value">{effectiveFontSize}</output>
            <label class="isl-checkline">
              <input
                class="isl-check"
                type="checkbox"
                checked={preferences.fitTextSize}
                data-testid="fit-text-toggle"
                on:change={(event) => update("fitTextSize", event.currentTarget.checked)}
              />
              <span>{t.fitText}</span>
            </label>
          </div>
        </div>

        <div class="cue-row">
          <span class="isl-label">{t.lineHeight}</span>
          <input
            class="isl-range isl-range-wide"
            type="range"
            min="1.35"
            max="2"
            step="0.01"
            value={preferences.lineHeight}
            aria-label={t.lineHeight}
            on:input={(event) => update("lineHeight", Number(event.currentTarget.value))}
          />
        </div>

        <div class="cue-row">
          <span class="isl-label">{t.typeface}</span>
          <div class="cue-controls">
            <select
              class="island-select"
              value={preferences.font}
              aria-label={t.typeface}
              on:change={(event) => update("font", event.currentTarget.value as FontKey)}
            >
              {#each fontOptions as option}
                <option value={option.value}>{t[option.key]}</option>
              {/each}
            </select>
            <label class="isl-checkline">
              <input
                class="isl-check"
                type="checkbox"
                checked={preferences.ligatures}
                on:change={(event) => update("ligatures", event.currentTarget.checked)}
              />
              <span>{t.ligatures}</span>
            </label>
          </div>
        </div>

        <div class="cue-row">
          <span class="isl-label">{t.locale}</span>
          <div class="cue-controls">
            <select
              class="island-select"
              value={preferences.locale}
              aria-label={t.locale}
              data-testid="locale-select"
              on:change={(event) => update("locale", event.currentTarget.value as Locale)}
            >
              {#each localeOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
            <label class="isl-checkline">
              <input
                class="isl-check"
                type="checkbox"
                checked={preferences.codeLineNumbers}
                data-testid="line-numbers-toggle"
                on:change={(event) => update("codeLineNumbers", event.currentTarget.checked)}
              />
              <span>{t.lineNumbers}</span>
            </label>
          </div>
        </div>
      </div>
    {/if}

    <button
      type="button"
      class="cue-toggle"
      aria-expanded={expanded}
      aria-label={t.typeface}
      data-testid="control-island-toggle"
      on:click={() => (expanded = !expanded)}
    >
      <span class="cue-aa">Aa</span>
      <span class="cue-size tabular-nums">{effectiveFontSize}</span>
      <span class="cue-caret" aria-hidden="true">{expanded ? "▾" : "▴"}</span>
    </button>
  </div>
</div>

<style>
  .island-cue {
    align-items: stretch;
    background: var(--isl-paper);
    border: 1px solid var(--isl-rule);
    border-radius: 14px;
    box-shadow: var(--isl-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .cue-toggle {
    align-items: center;
    border-radius: 12px;
    color: var(--isl-ink);
    display: flex;
    gap: 0.5rem;
    padding: 0.42rem 0.7rem;
  }

  .cue-toggle:hover {
    background: var(--isl-field);
  }

  .cue-aa {
    font-family: Georgia, Cambria, "Times New Roman", serif;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1;
  }

  .cue-size {
    color: var(--isl-muted);
    font-size: 0.78rem;
  }

  .cue-caret {
    color: var(--isl-muted);
    font-size: 0.7rem;
    margin-left: auto;
  }

  .cue-sheet {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    min-width: 20rem;
    padding: 0.7rem 0.85rem 0.5rem;
  }

  .cue-preview {
    border-bottom: 1px solid var(--isl-rule);
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding-bottom: 0.65rem;
  }

  .cue-preview-text {
    color: var(--isl-ink);
    margin: 0;
  }

  .cue-row {
    align-items: center;
    display: grid;
    gap: 0.85rem;
    grid-template-columns: 4.6rem minmax(0, 1fr);
  }

  .cue-controls {
    align-items: center;
    display: flex;
    gap: 0.55rem;
  }
</style>
