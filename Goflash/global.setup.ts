import { chromium } from "@playwright/test";
import { config } from "./config";
import { buscarTipoAmbiente } from "./database/queries";
import fs from "fs";

async function globalSetup() {
  console.log("Iniciando login...");
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Verifica se está em Homolog
  let verificaAmbiente = await buscarTipoAmbiente();
  if (verificaAmbiente.VALOR_ATUAL != "2") {
    throw new Error("Ambiente não configurado para Homolog");
  }

  await page.getByPlaceholder("Usuário").fill(config.usuarioGoflash);
  await page.getByPlaceholder("senha").fill(config.senhaGoflash);
  await page.getByRole("button", { name: "FAZER LOGIN" }).click();
  await page.waitForLoadState("networkidle");

  await context.storageState({ path: "auth.json" });

  const authJson = JSON.parse(fs.readFileSync("auth.json", "utf-8"));
  authJson.cookies = authJson.cookies.map((cookie: any) => ({
    ...cookie,
    domain: "localhost",
  }));
  fs.writeFileSync("auth.json", JSON.stringify(authJson, null, 2));

  console.log("✅ Login concluído!");
  await browser.close();
}

export default globalSetup;
