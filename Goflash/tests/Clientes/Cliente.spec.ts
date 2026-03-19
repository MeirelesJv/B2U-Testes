import { test, expect } from "@playwright/test";
import { config } from "../../config";
import {
  buscarCadastroCliente,
  deletarCadastroCliente,
} from "../../database/queries";
import { closeConnection } from "../../database/connection";

test.afterAll(async () => {
  await closeConnection(); // fecha a conexão ao terminar os testes
});

test("Cadastro de cliente", async ({ page }) => {
  await page.goto("localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Pagina de cliente
  await page.goto("localhost:" + config.porta + "/#/cliente");
  await page.getByRole("link", { name: "add", exact: true }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  //Pesquisa no banco um cadastro de um cliente sem venda para substituir
  const cadastroCliente = await buscarCadastroCliente();

  //Preenchimento de um novo cliente
  await page
    .getByRole("textbox", { name: "Nome do cliente" })
    .fill(cadastroCliente.CLIENTE_VAREJO);
  await page.locator('input[name="cpfDefault"]').fill(cadastroCliente.CPF_CGC);
  await page
    .getByRole("textbox", { name: "e-mail" })
    .fill(cadastroCliente.EMAIL);
  await page.locator('input[name="telefoneDDD"]').fill(cadastroCliente.DDD);
  await page
    .locator('input[name="telefoneNumero"]')
    .fill(cadastroCliente.TELEFONE);
  await page.getByRole("textbox", { name: "Nascimento" }).fill("07/11/2000");

  let select = page.locator('select[name="genero"]');
  await select.selectOption({ index: 1 });

  await page.getByRole("textbox", { name: "CEP" }).fill(cadastroCliente.CEP);
  await page.getByRole("link", { name: "more", exact: true }).click();
  await page.waitForTimeout(2000);

  await page.locator('input[name="numero"]').fill(cadastroCliente.NUMERO);

  //Roda a query que deleta o cliente
  const deletaClienteCadastrado = await deletarCadastroCliente(
    cadastroCliente.CODIGO_CLIENTE,
  );
  await page.waitForTimeout(1000);

  //Salva
  await page.getByRole("button", { name: "Salvar", exact: true }).click();
  await page.waitForTimeout(1000);

  //Caso tenha o pop-up de fidelidade
  const popupFidelidade = page.getByRole("heading", {
    name: "Para salvar o cadastro do cliente é necessário confirmar os termos abaixo:",
  });

  if (await popupFidelidade.isVisible()) {
    await page.getByRole("checkbox").nth(2).click();
    await page.getByRole("checkbox").nth(3).click();
    await page.getByRole("link", { name: "Sim" }).click();
    await page.waitForTimeout(500);
  } else {
    await page.getByRole("checkbox").nth(1).click();
    await page.getByRole("checkbox").nth(2).click();
    await page.getByRole("link", { name: "Sim" }).click();
    await page.waitForTimeout(500);
  }

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
