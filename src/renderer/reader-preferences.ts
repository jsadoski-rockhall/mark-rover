// Reader preference types and option lists, shared between App.svelte and the
// control island prototype variants.

export type Locale = "en" | "es";
export type FontKey = "serif" | "sans" | "mono" | "slab" | "comic" | "script";
export type Treatment = "fog" | "sage" | "dusk";
export type Messages = Record<string, string>;

export interface ReaderPreferences {
  measure: number;
  fontSize: number;
  fitTextSize: boolean;
  lineHeight: number;
  font: FontKey;
  ligatures: boolean;
  locale: Locale;
  treatment: Treatment;
  codeLineNumbers: boolean;
}

export type UpdatePreference = <K extends keyof ReaderPreferences>(
  key: K,
  value: ReaderPreferences[K]
) => void;

export const widthOptions: number[] = [66, 70, 88];

export const treatmentOptions: { key: string; value: Treatment }[] = [
  { key: "treatmentFog", value: "fog" },
  { key: "treatmentSage", value: "sage" },
  { key: "treatmentDusk", value: "dusk" }
];

export const fontOptions: { key: string; value: FontKey }[] = [
  { key: "fontSerif", value: "serif" },
  { key: "fontSans", value: "sans" },
  { key: "fontMono", value: "mono" },
  { key: "fontSlab", value: "slab" },
  { key: "fontComic", value: "comic" },
  { key: "fontScript", value: "script" }
];

export const localeOptions: { label: string; value: Locale }[] = [
  { label: "English", value: "en" },
  { label: "Español", value: "es" }
];

// Font stacks shared between the reader article (App.svelte) and the control
// islands' live type preview. Each stack ends with the platform emoji fonts so
// emoji never fall through to a glyphless last-resort font on Windows or Linux.
const emojiFallback = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';

export const fontStacks: Record<FontKey, string> = {
  serif: `Georgia, Cambria, "Times New Roman", serif, ${emojiFallback}`,
  sans: `Inter, ui-sans-serif, system-ui, sans-serif, ${emojiFallback}`,
  mono: `"SFMono-Regular", Consolas, "Liberation Mono", monospace, ${emojiFallback}`,
  slab: `Rockwell, "Roboto Slab", "American Typewriter", serif, ${emojiFallback}`,
  comic: `"Comic Sans MS", "Comic Sans", cursive, ${emojiFallback}`,
  script: `"Snell Roundhand", "Brush Script MT", cursive, ${emojiFallback}`
};
