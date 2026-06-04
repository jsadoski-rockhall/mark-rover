import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import sanitizeHtml from "sanitize-html";
import hljs from "highlight.js";
import { dirname, isAbsolute, resolve } from "node:path";
import { parentPort, workerData } from "node:worker_threads";

const startedAt = performance.now();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, language) {
    const trimmedLanguage = language?.trim();
    if (trimmedLanguage && hljs.getLanguage(trimmedLanguage)) {
      return hljs.highlight(code, { language: trimmedLanguage, ignoreIllegals: true }).value;
    }
    return md.utils.escapeHtml(code);
  }
}).use(taskLists, {
  enabled: true,
  label: true,
  labelAfter: true
});

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+=\u005B\]{}\\|;:'",.<>/?]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

md.core.ruler.push("mark_rover_heading_anchors", (state) => {
  const seen = new Map();

  for (let index = 0; index < state.tokens.length; index += 1) {
    const token = state.tokens[index];
    if (token.type !== "heading_open") continue;

    const inline = state.tokens[index + 1];
    if (!inline || inline.type !== "inline") continue;

    const baseSlug = slugify(inline.content) || "section";
    const count = seen.get(baseSlug) ?? 0;
    seen.set(baseSlug, count + 1);
    token.attrSet("id", count === 0 ? baseSlug : `${baseSlug}-${count + 1}`);
  }
});

const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, idx, options, env, self) => {
  const src = tokens[idx].attrGet("src");
  if (src && !/^(https?:|data:|mark-rover-file:)/i.test(src)) {
    const baseDir = dirname(workerData.documentPath);
    const assetPath = isAbsolute(src) ? src : resolve(baseDir, src);
    tokens[idx].attrSet("src", `mark-rover-file://${encodeURIComponent(assetPath)}`);
  }
  tokens[idx].attrSet("loading", "lazy");
  tokens[idx].attrSet("decoding", "async");
  return defaultImage(tokens, idx, options, env, self);
};

const defaultLinkOpen = md.renderer.rules.link_open;
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet("href") ?? "";
  if (/^https?:/i.test(href)) {
    tokens[idx].attrSet("rel", "noreferrer");
  }
  return defaultLinkOpen
    ? defaultLinkOpen(tokens, idx, options, env, self)
    : self.renderToken(tokens, idx, options);
};

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "input",
  "span"
]);

try {
  const tokens = md.parse(workerData.markdown, {});
  const rendered = md.renderer.render(tokens, md.options, {});
  const html = sanitizeHtml(rendered, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "loading", "decoding", "width", "height"],
      input: ["type", "checked", "disabled"],
      code: ["class"],
      pre: ["class"],
      span: ["class"],
      th: ["align"],
      td: ["align"],
      "*": ["id"]
    },
    allowedSchemes: ["http", "https", "mailto", "data", "mark-rover-file"],
    allowedSchemesByTag: {
      img: ["mark-rover-file", "data", "http", "https"]
    }
  });

  parentPort.postMessage({
    ok: true,
    html,
    meta: {
      tokens: tokens.length,
      images: tokens.filter(
        (token) =>
          token.type === "inline" && token.children?.some((child) => child.type === "image")
      ).length,
      renderDurationMs: performance.now() - startedAt
    }
  });
} catch (error) {
  parentPort.postMessage({
    ok: false,
    error: error instanceof Error ? error.message : String(error)
  });
}
