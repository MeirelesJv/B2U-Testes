import { test, expect } from "@playwright/test";
import { config } from "../config";

test("Cadastro de cliente", async ({ page }) => {
  await page.goto("localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Pagina de cliente
  await page.goto("localhost:" + config.porta + "/#/cliente");
  await page.getByRole("link", { name: "add", exact: true }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  //Preenchimento de um novo cliente
  await page
    .getByRole("textbox", { name: "Nome do cliente" })
    .fill("Cliente teste");
  await page.locator('input[name="cpfDefault"]').fill(config.cpf);
  await page
    .getByRole("textbox", { name: "e-mail" })
    .fill("emailteste@teste.com");

  //Salva
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page.getByRole("checkbox").nth(1).click();
  await page.getByRole("checkbox").nth(2).click();
  await page.getByRole("link", { name: "Sim" }).click();
  await page.waitForTimeout(500);

  let cpfJaCadastrado = await page
    .getByLabel("Já existe um cliente")
    .isVisible();

  //Cpf já usado
  if (cpfJaCadastrado) {
    throw new Error("CPF já cadastrado");
  }

  //Se redicionar, ele aprova o teste
  await expect(page).toHaveURL(
    "http://localhost:" + config.porta + "/#/cliente",
  );
});
