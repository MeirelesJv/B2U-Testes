import { test, expect } from "@playwright/test";
import { config } from "../../config";
import {
  buscarDestinoConsumivel,
  buscarCodigoDeBarras,
} from "../../database/queries";
import { closeConnection } from "../../database/connection";

//Roda os testes em sequencia
test.describe.configure({ mode: "serial" });

test.afterAll(async () => {
  await closeConnection(); // fecha a conexão ao terminar os testes
});
//Emissão de NF-e

let tempoEspera = 3000;

test("Teste de Consumivel 5.", async ({ page }) => {
  test.setTimeout(0);

  await page.goto("http://localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Caso tenha o pop-up de tabela vencida
  const popupTributo = page.getByTestId("closeModalTributoAproximado");

  if (await popupTributo.isVisible()) {
    await popupTributo.click();
    await page.waitForLoadState("networkidle");
  }

  //Espera o botao de Gestão
  let gestaoBotao = await page
    .locator("#main-menu")
    .getByRole("link", { name: "equalizer Gestão" })
    .isVisible();

  if (gestaoBotao) {
    await page
      .locator("#main-menu")
      .getByRole("link", { name: "equalizer Gestão" })
      .click();
    await page.waitForTimeout(tempoEspera);
  }

  //Espera o botão de Nota fiscal
  let notaFiscalBotao = await page
    .getByRole("link", { name: "memory Notas Fiscais Notas" })
    .isVisible();

  await page.waitForLoadState("networkidle");
  if (notaFiscalBotao) {
    await page
      .getByRole("link", { name: "memory Notas Fiscais Notas" })
      .click();

    await page.waitForTimeout(tempoEspera);
  }

  //Popup de nota pendente
  let popUpNotaPendente = await page
    .getByText("Existem notas pendentes a serem enviadas, deseja verificar?")
    .isVisible();
  if (popUpNotaPendente) {
    await page.getByRole("button", { name: "Voltar" }).click();
    await page.waitForTimeout(500);
  }

  //Adicionar consumivel
  await page.getByRole("link", { name: "add" }).click();
  await page.waitForTimeout(tempoEspera);

  //Seleciona a primeira natureza que começar com 5.
  let select = page.getByTestId("naturezaNFeConsumivel");
  let options = await select.evaluate((el: HTMLSelectElement) =>
    Array.from(el.options).map((o) => o.text),
  );
  let opcao = options.find((o) => o.trim().startsWith("5."));
  await select.selectOption({ label: opcao! });

  //Seleciona a Serie
  let serieNF = page.getByTestId("serieNFeConsumivel");
  await serieNF.selectOption({ index: 1 });

  //Avança
  await page.getByTestId("btnCriaNFeConsumivel").click();

  //Destino
  await page.getByTestId("btnDestinatarioNFeConsumivel").click();
  await page.getByTestId("destinoFilialNFeConsumivel").click();
  let filialConsumivel = await buscarDestinoConsumivel();
  await page
    .getByTestId("pesquisaDestinatarioNFeConsumivel")
    .fill(filialConsumivel.FILIAL);

  await page.getByRole("cell", { name: filialConsumivel.FILIAL }).click();

  //Avançar
  await page.getByTestId("btnCriaNFeConsumivel").click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(tempoEspera);

  //Coloca produto
  let produto = await buscarCodigoDeBarras();
  await page
    .getByTestId("pesquisaProdutoNFeConsumivel")
    .fill(produto.CODIGO_BARRA);

  await page.getByTestId("adicionaProdutoNFeConsumivel").click();
  await page.waitForTimeout(tempoEspera);
  const preco = produto.PRECO_LIQUIDO.toFixed(2).replace(".", ",");

  //Coloca o valor no produto
  await page.getByTestId("precoUnitarioProduto").fill(preco);

  //Volume
  await page.getByTestId("volumeNFeConsumivel").fill("1");

  //Finaliza
  await page.getByTestId("btnSalvaNFeConsumivel").click();

  //Valida se foi gerada com Sucesso
  await expect(page.getByLabel("Nota Fiscal Gerada Com Sucesso")).toBeVisible({
    timeout: 120000,
  });

  //Emitir consumivel
  await page.getByRole("button", { name: "more_vert" }).click();
  await page.getByRole("link", { name: "receipt Enviar Sefaz" }).click();

  //Valida se foi gerada com Sucesso
  await expect(page.getByLabel("NF Gerada com sucesso.")).toBeVisible({
    timeout: 120000,
  });
});

test("Teste de Consumivel 6.", async ({ page }) => {
  test.setTimeout(0);

  await page.goto("http://localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Caso tenha o pop-up de tabela vencida
  const popupTributo = page.getByTestId("closeModalTributoAproximado");

  if (await popupTributo.isVisible()) {
    await popupTributo.click();
    await page.waitForLoadState("networkidle");
  }

  //Espera o botao de Gestão
  let gestaoBotao = await page
    .locator("#main-menu")
    .getByRole("link", { name: "equalizer Gestão" })
    .isVisible();

  if (gestaoBotao) {
    await page
      .locator("#main-menu")
      .getByRole("link", { name: "equalizer Gestão" })
      .click();
    await page.waitForTimeout(tempoEspera);
  }

  //Espera o botão de Nota fiscal
  let notaFiscalBotao = await page
    .getByRole("link", { name: "memory Notas Fiscais Notas" })
    .isVisible();

  await page.waitForLoadState("networkidle");
  if (notaFiscalBotao) {
    await page
      .getByRole("link", { name: "memory Notas Fiscais Notas" })
      .click();

    await page.waitForTimeout(tempoEspera);
  }

  //Popup de nota pendente
  let popUpNotaPendente = await page
    .getByText("Existem notas pendentes a serem enviadas, deseja verificar?")
    .isVisible();
  if (popUpNotaPendente) {
    await page.getByRole("button", { name: "Voltar" }).click();
    await page.waitForTimeout(500);
  }

  //Adicionar consumivel
  await page.getByRole("link", { name: "add" }).click();
  await page.waitForTimeout(tempoEspera);

  //Seleciona a primeira natureza que começar com 6.
  let select = page.getByTestId("naturezaNFeConsumivel");
  let options = await select.evaluate((el: HTMLSelectElement) =>
    Array.from(el.options).map((o) => o.text),
  );
  let opcao = options.find((o) => o.trim().startsWith("6."));
  await select.selectOption({ label: opcao! });

  //Seleciona a Serie
  let serieNF = page.getByTestId("serieNFeConsumivel");
  await serieNF.selectOption({ index: 1 });

  //Avança
  await page.getByTestId("btnCriaNFeConsumivel").click();

  //Destino
  await page.getByTestId("btnDestinatarioNFeConsumivel").click();
  await page.getByTestId("destinoFilialNFeConsumivel").click();
  let filialConsumivel = await buscarDestinoConsumivel();
  await page
    .getByTestId("pesquisaDestinatarioNFeConsumivel")
    .fill(filialConsumivel.FILIAL);

  await page.getByRole("cell", { name: filialConsumivel.FILIAL }).click();

  //Avançar
  await page.getByTestId("btnCriaNFeConsumivel").click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(tempoEspera);

  //Coloca produto
  let produto = await buscarCodigoDeBarras();
  await page
    .getByTestId("pesquisaProdutoNFeConsumivel")
    .fill(produto.CODIGO_BARRA);

  await page.getByTestId("adicionaProdutoNFeConsumivel").click();
  await page.waitForTimeout(tempoEspera);
  const preco = produto.PRECO_LIQUIDO.toFixed(2).replace(".", ",");

  //Coloca o valor no produto
  await page.getByTestId("precoUnitarioProduto").fill(preco);

  //Volume
  await page.getByTestId("volumeNFeConsumivel").fill("1");

  //Finaliza
  await page.getByTestId("btnSalvaNFeConsumivel").click();

  //Valida se foi gerada com Sucesso
  await expect(page.getByLabel("Nota Fiscal Gerada Com Sucesso")).toBeVisible({
    timeout: 120000,
  });

  //Emitir consumivel
  await page.getByRole("button", { name: "more_vert" }).click();
  await page.getByRole("link", { name: "receipt Enviar Sefaz" }).click();

  //Valida se foi gerada com Sucesso
  await expect(page.getByLabel("NF Gerada com sucesso.")).toBeVisible({
    timeout: 120000,
  });
});
