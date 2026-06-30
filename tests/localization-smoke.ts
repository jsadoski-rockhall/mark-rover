import { _electron as electron } from "playwright";
import { resolve } from "node:path";

const file = resolve(process.cwd(), "tests/corpus/smoke.md");

const app = await electron.launch({
  args: [".", "--", file],
  cwd: process.cwd()
});

try {
  const page = await app.firstWindow();

  // Pin the bottom control island visible (it auto-hides in normal use) so the
  // locale select stays interactable.
  await page.evaluate(() => {
    localStorage.setItem("mark-rover.island-autohide", "off");
  });

  await page.waitForSelector('[data-testid="document"]', { timeout: 5000 });

  // The island opens collapsed to a single pill; expand it to reach the locale
  // select.
  await page.locator('[data-testid="control-island-toggle"]').click();

  await page.locator('[data-testid="locale-select"]').selectOption("es");
  await page.locator('a[href^="https://"]').first().click();
  await page.waitForSelector('[role="dialog"]', { timeout: 2000 });

  const dialogText = await page.locator('[role="dialog"]').textContent();
  if (!dialogText?.includes("¿Abrir enlace externo?")) {
    throw new Error(`Expected Spanish external-link title, got: ${dialogText}`);
  }

  if (!dialogText.includes("Cancelar") || !dialogText.includes("Abrir")) {
    throw new Error(`Expected Spanish modal actions, got: ${dialogText}`);
  }

  console.log("Localization Electron smoke passed.");
} finally {
  await app.close();
}
