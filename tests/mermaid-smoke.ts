import { _electron as electron } from "playwright";
import { resolve } from "node:path";

const file = resolve(process.cwd(), "tests/corpus/mermaid.md");

const app = await electron.launch({
  args: [".", "--", file],
  cwd: process.cwd()
});

try {
  const page = await app.firstWindow();

  // IntersectionObserver and requestAnimationFrame pause while the window is
  // occluded on macOS; keep it visible for the duration of the test.
  await app.evaluate(({ BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows()[0];
    window.setAlwaysOnTop(true);
    window.show();
  });

  await page.waitForSelector('[data-testid="document"]', { timeout: 5000 });

  // The first diagram sits in the initial viewport and must render to SVG.
  await page.waitForSelector(".mermaid-figure svg", { timeout: 15000 });

  // The invalid diagram must surface a visible, non-fatal failure state. The
  // app's label is localized (the saved locale survives across launches), so
  // assert on Mermaid's own diagnostic instead of the label text.
  await page.waitForSelector("pre.mermaid-error", { timeout: 15000 });
  const errorText = await page.locator("pre.mermaid-error").textContent();
  if (!errorText?.includes("Parse error")) {
    throw new Error(`Invalid diagram did not show a useful failure state: ${errorText}`);
  }

  // The far-below diagram must still be an inert placeholder before scrolling.
  const figuresBeforeScroll = await page.locator(".mermaid-figure").count();
  if (figuresBeforeScroll !== 1) {
    throw new Error(
      `Expected exactly 1 rendered diagram before scroll, found ${figuresBeforeScroll}`
    );
  }

  await page.evaluate(() => {
    document.getElementById("far-below-the-viewport")?.scrollIntoView();
  });
  await page.waitForFunction(
    () => document.querySelectorAll(".mermaid-figure svg").length >= 2,
    undefined,
    { timeout: 15000 }
  );

  console.log("Playwright mermaid lazy-rendering smoke passed.");
} finally {
  await app.close();
}
