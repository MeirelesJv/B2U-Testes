import { config } from "./config";
import { chromium } from "@playwright/test";

async function globalSetup() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  await page.goto("http://localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  await page.getByPlaceholder("Usuário").fill(config.usuario);
  await page.getByPlaceholder("senha").fill(config.senha);
  await page.getByRole("button", { name: "FAZER LOGIN" }).click();
  await page.waitForLoadState("networkidle");

  await page.context().storageState({ path: "auth.json" });
  await browser.close();
}

export default globalSetup;
