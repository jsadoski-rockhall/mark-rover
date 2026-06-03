import { _electron as electron } from "playwright";
import { resolve } from "node:path";

const file = resolve(process.cwd(), "tests/corpus/smoke.md");

const app = await electron.launch({
  args: [".", "--", file],
  cwd: process.cwd()
});

try {
  const page = await app.firstWindow();
  await page.waitForSelector('[data-testid="document"]', { timeout: 5000 });

  const heading = await page.locator("h1").first().textContent();
  if (heading !== "Smoke Document") {
    throw new Error(`Unexpected heading: ${heading}`);
  }

  const imageLoading = await page.locator("img").first().getAttribute("loading");
  if (imageLoading !== "lazy") {
    throw new Error(`Expected lazy image, got ${imageLoading}`);
  }

  await page.locator('[data-testid="text-size-slider"]').fill("22");
  const readerFontSize = await page.locator('[data-testid="document"]').evaluate((element) => {
    return window.getComputedStyle(element).fontSize;
  });
  if (readerFontSize !== "22px") {
    throw new Error(`Expected resized reader text to be 22px, got ${readerFontSize}`);
  }

  await page.locator('a[href^="https://"]').first().click();
  await page.waitForSelector('[role="dialog"]', { timeout: 2000 });
  const dialogText = await page.locator('[role="dialog"]').textContent();
  if (!dialogText?.includes("https://example.com/")) {
    throw new Error(`External link dialog did not show normalized URL: ${dialogText}`);
  }

  await page.locator("button", { hasText: "Cancel" }).click();
  await page.waitForSelector('[role="dialog"]', { state: "detached", timeout: 2000 });

  console.log("Playwright Electron smoke passed.");
} finally {
  await app.close();
}
