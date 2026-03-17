import { test, expect } from "@playwright/test";
import { config } from "../../config";
import { buscarCodigoDeBarras } from "../../database/queries";
import { closeConnection } from "../../database/connection";

//Testes com emissão pelo Tray Service

let tempoEspera = 3000;

test.afterAll(async () => {
  await closeConnection(); // fecha a conexão ao terminar os testes
});

test("Teste de Venda", async ({ page }) => {
  test.setTimeout(0);

  //Verificar se o parametro de envio pelo Tray Service está ativo
  await page.goto("http://localhost:" + config.porta + "/#/config");
  await page.waitForLoadState("networkidle");

  const checkedEnvioNfceTela = await page
    .getByRole("checkbox", {
      name: "Realiza envio de nfce diretamente pelo sistema sem uso do tray service",
    })
    .isChecked();

  if (checkedEnvioNfceTela) {
    //Está marcado
    await page
      .getByRole("checkbox", {
        name: "Realiza envio de nfce diretamente pelo sistema sem uso do tray service",
      })
      .click();

    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(tempoEspera);
  } else {
    //Não está marcado
  }

  //Acessa o site
  await page.goto("http://localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Caso tenha o pop-up de tabela vencida
  const popupTributo = page.getByTestId("closeModalTributoAproximado");

  if (await popupTributo.isVisible()) {
    await popupTributo.click();
    await page.waitForLoadState("networkidle");
  }

  //Verifica se tem uma venda já aberta
  const temVendaAberta = await page
    .locator("#main-menu-venda-add p")
    .getByText("Retomar Venda")
    .nth(1)
    .isVisible();
  if (temVendaAberta) {
    //Cancelando a venda pendente
    //Abre ela
    await page.locator('a[href="#/venda/add/"]').first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(tempoEspera);

    //Abre o popUp de cancelar
    await page
      .locator('[ng-click="cancelPedido()"]')
      .nth(1)
      .click({ force: true });

    //Preenchimento dos campos de cancelamento
    await page.getByPlaceholder("Gerente").fill(config.usuarioGoflash);
    await page.getByPlaceholder("senha").fill(config.senhaGoflash);

    //Seleciona o primeiro motivo
    let selectMotivo = page.locator("select#motivos");
    await selectMotivo.selectOption({ index: 1 });

    //Preenchimento do Motivo
    await page
      .getByPlaceholder("Motivo para autorização")
      .fill("Teste de cancelamento");

    //Confirmar
    await page.getByRole("button", { name: "SIM, AUTORIZAR" }).click();
    await page.waitForTimeout(tempoEspera);
  } else {
    //Abre uma nova venda
    await page.locator('a[href="#/venda/add/"]').first().click();
    await page.waitForLoadState("networkidle");
  }

  //Seleciona o vendedor
  let select = page.locator("select#vendedor");
  await select.selectOption({ index: 1 }); // seleciona o primeiro

  //Verifica se o campo de cliente está preenchido
  await page.waitForTimeout(2000);
  const icone = page.locator('i.material-icons[ng-click="limparCliente()"]');
  if (await icone.isVisible()) {
  } else {
    await page.locator("#cliente").fill(config.cliente);
    await page.waitForTimeout(2000);
    await page.waitForSelector('[role="option"]', { state: "visible" });
    await page.locator('[role="option"] a').first().click();
    await page.waitForTimeout(500);
  }

  //Coloca o poduto
  if (!config.codProdutoBarra) {
    const codProduto = await buscarCodigoDeBarras();
    await page.locator("#codigo-barras").fill(codProduto.CODIGO_BARRA);
  } else {
    await page.locator("#codigo-barras").fill(config.codProdutoBarra);
  }
  await page.keyboard.press("Enter");
  await page.waitForTimeout(tempoEspera);

  //Pagamento
  await page.waitForSelector('a p:has-text("Pagamento")', { state: "visible" });
  await page.locator('[ng-hide="isPreVenda() || caixaAberto()"]').click();
  await page.locator('[ng-click="gotoNextPagamento()"]').nth(1).click();
  await page.waitForTimeout(500);

  //Seleciona forma de pagamento
  await page.locator("label").getByText("DINHEIRO").click();
  await page.locator('[ng-click="gotoNextPagamento()"]').nth(1).click();
  await page.waitForTimeout(1000);

  //Confirmar pagamento
  await page.locator('[ng-click="confirmarpagamentoTroco()"]').click();
  await page.locator('[ng-click="gotoNextPagamento()"]').nth(1).click();

  //Confirmar
  await page.waitForTimeout(1000);
  await page.locator('[ng-click="finishPedido(state.ImprimeDanfe)"]').click();

  //Espera o popup de exito aparecer, se demorar 2m ele da como errado
  await expect(page.getByText("Ticket gerado com êxito")).toBeVisible({
    timeout: 120000,
  });
});

test("Teste de Troca", async ({ page }) => {
  test.setTimeout(0);

  //Verificar se o parametro de envio pelo Tray Service está ativo
  await page.goto("http://localhost:" + config.porta + "/#/config");
  await page.waitForLoadState("networkidle");

  const checkedEnvioNfceTela = await page
    .getByRole("checkbox", {
      name: "Realiza envio de nfce diretamente pelo sistema sem uso do tray service",
    })
    .isChecked();

  if (checkedEnvioNfceTela) {
    //Está marcado
    await page
      .getByRole("checkbox", {
        name: "Realiza envio de nfce diretamente pelo sistema sem uso do tray service",
      })
      .click();

    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(tempoEspera);
  } else {
    //Não está marcado
  }

  //Acessa o site
  await page.goto("http://localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Caso tenha o pop-up de tabela vencida
  const popupTributo = page.getByTestId("closeModalTributoAproximado");

  if (await popupTributo.isVisible()) {
    await popupTributo.click();
    await page.waitForLoadState("networkidle");
  }

  //Verifica se tem uma venda já aberta
  const temVendaAberta = await page
    .locator("#main-menu-venda-add p")
    .getByText("Retomar Venda")
    .nth(1)
    .isVisible();
  if (temVendaAberta) {
    //Cancelando a venda pendente
    //Abre ela
    await page.locator('a[href="#/venda/add/"]').first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(tempoEspera);

    //Abre o popUp de cancelar
    await page
      .locator('[ng-click="cancelPedido()"]')
      .nth(1)
      .click({ force: true });

    //Preenchimento dos campos de cancelamento
    await page.getByPlaceholder("Gerente").fill(config.usuarioGoflash);
    await page.getByPlaceholder("senha").fill(config.senhaGoflash);
    //Seleciona o primeiro motivo
    let selectMotivo = page.locator("select#motivos");
    await selectMotivo.selectOption({ index: 1 });
    //Preenchimento do Motivo
    await page
      .getByPlaceholder("Motivo para autorização")
      .fill("Teste de cancelamento");
    //Confirmar
    await page.getByRole("button", { name: "SIM, AUTORIZAR" }).click();
    await page.waitForTimeout(tempoEspera);
  } else {
    //Abre uma nova venda
    await page.locator('a[href="#/venda/add/"]').first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(tempoEspera);
  }

  //Seleciona o vendedor
  let select = page.locator("select#vendedor");
  await select.selectOption({ index: 1 }); // seleciona o primeiro

  //Verifica se o campo de cliente está preenchido
  const icone = page.locator('i.material-icons[ng-click="limparCliente()"]');
  if (await icone.isVisible()) {
    console.log("ta com cliente");
  } else {
    await page.locator("#cliente").fill(config.cliente);
    await page.waitForTimeout(1000);
    await page.waitForSelector('[role="option"]', { state: "visible" });
    await page.locator('[role="option"] a').first().click();
    await page.waitForTimeout(500);
  }

  //Coloca o poduto
  const codProduto = await buscarCodigoDeBarras();
  if (!config.codProdutoBarra) {
    //Primeiro produto
    await page.locator("#codigo-barras").fill(codProduto.CODIGO_BARRA);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(tempoEspera);

    //Produto troca
    await page.locator('[ng-click="toggleTroca()"]').nth(1).click();
    await page.locator("#codigo-barras").fill(codProduto.CODIGO_BARRA);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(tempoEspera);
  } else {
    //Primeiro produto
    await page.locator("#codigo-barras").fill(config.codProdutoBarra);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(tempoEspera);

    //Produto troca
    await page.locator('[ng-click="toggleTroca()"]').nth(1).click();
    await page.locator("#codigo-barras").fill(config.codProdutoBarra);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(tempoEspera);
  }

  //Pagamento
  await page.locator('[ng-hide="isPreVenda() || caixaAberto()"]').click();
  await page.locator('[ng-click="gotoNextPagamento()"]').nth(1).click();
  await page.waitForTimeout(500);

  //Seleciona forma de pagamento
  await page.locator("label").getByText("DINHEIRO").click();
  await page.locator('[ng-click="gotoNextPagamento()"]').nth(1).click();
  await page.waitForTimeout(1000);

  //Confirmar pagamento
  await page.locator('[ng-click="confirmarpagamentoTroco()"]').click();
  await page.locator('[ng-click="gotoNextPagamento()"]').nth(1).click();

  //Confirmar
  await page.waitForTimeout(1000);
  await page.locator('[ng-click="finishPedido(state.ImprimeDanfe)"]').click();

  //Espera o popup de exito aparecer, se demorar 2m ele da como errado
  await expect(page.getByText("Ticket gerado com êxito")).toBeVisible({
    timeout: 120000,
  });
});

test("Teste de Cancelamento", async ({ page }) => {
  test.setTimeout(0);

  //Verificar se o parametro de envio pelo Tray Service está ativo
  await page.goto("http://localhost:" + config.porta + "/#/config");
  await page.waitForLoadState("networkidle");

  const checkedEnvioNfceTela = await page
    .getByRole("checkbox", {
      name: "Realiza envio de nfce diretamente pelo sistema sem uso do tray service",
    })
    .isChecked();

  if (checkedEnvioNfceTela) {
    //Está marcado
    await page
      .getByRole("checkbox", {
        name: "Realiza envio de nfce diretamente pelo sistema sem uso do tray service",
      })
      .click();

    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(tempoEspera);
  } else {
    //Não está marcado
  }

  //Acessa o site
  await page.goto("http://localhost:" + config.porta);
  await page.waitForLoadState("networkidle");

  //Caso tenha o pop-up de tabela vencida
  const popupTributo = page.getByTestId("closeModalTributoAproximado");

  if (await popupTributo.isVisible()) {
    await popupTributo.click();
    await page.waitForLoadState("networkidle");
  }

  await page.locator("#main-menu-venda").click();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("table tbody tr", { state: "visible" });

  //Verifica o status da venda
  let ticket = await page
    .locator("tbody tr")
    .nth(0)
    .getByText("Cancelado")
    .isVisible();

  if (ticket) {
    throw new Error("A primeira nota nao pode ser cancelada ou antiga");
  }

  //Espera tabela carregar
  await Promise.all([
    page.waitForResponse(
      (resp) => resp.url().includes("/pedido") && resp.status() === 200,
    ),
    page.locator("tbody tr").nth(0).locator("a").first().click(),
    await page.waitForLoadState("networkidle"),
  ]);

  //abre o dropdown
  await page.locator(".dropdown-toggle").first().click();
  await page.getByRole("link", { name: "do_not_disturb_on Cancelar" }).click();

  //Preenchimento dos campos de cancelamento
  await page.getByPlaceholder("Gerente").fill(config.usuarioGoflash);
  await page.getByPlaceholder("senha").fill(config.senhaGoflash);

  //Seleciona o primeiro motivo
  let selectMotivo = page.locator("select#motivos");
  await selectMotivo.selectOption({ index: 1 });

  //Confirma
  await page.getByRole("button", { name: "SIM, AUTORIZAR" }).click();

  //Preenche a Justificativa
  await page.getByPlaceholder("Justificativa").fill("Teste de cancelamento");
  await page.getByRole("button", { name: "CANCELAR" }).click();

  await expect(page.getByText("Nota cancelada!")).toBeVisible({
    timeout: 12000,
  });
});

test("testar a conexão", async ({ page }) => {});
