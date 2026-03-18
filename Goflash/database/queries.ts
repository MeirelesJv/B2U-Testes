import { getConnection } from "./connection";

export async function buscarCodigoDeBarras() {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query("select * from LOJA_VENDA_PRODUTO order by DATA_VENDA desc");
  return result.recordset[0];
}

export async function updateEstoqueCodigoDeBarras(
  PRODUTO: string,
  COR_PRODUTO: string,
  COD_FILIAL: string,
) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("PRODUTO", PRODUTO)
    .input("COR_PRODUTO", COR_PRODUTO)
    .input("COD_FILIAL", COD_FILIAL)
    .query(
      "update a set a.ESTOQUE = '1000',ES1 = '100',ES2 = '100',ES3 = '100',ES4 = '100',ES5 = '100',ES6 = '100',ES7 = '100',ES8 = '100',ES9 = '100',ES10 = '100' from ESTOQUE_PRODUTOS a join FILIAIS b on a.FILIAL = b.FILIAL where a.PRODUTO = @PRODUTO and a.COR_PRODUTO = @COR_PRODUTO and b.COD_FILIAL = @COD_FILIAL",
    );
}

export async function buscarCadastroCliente() {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query(
      "SELECT TOP 1 a.* FROM CLIENTES_VAREJO a LEFT JOIN LOJA_VENDA b ON a.CODIGO_CLIENTE = b.CODIGO_CLIENTE WHERE b.CODIGO_CLIENTE IS NULL and LEN(REPLACE(CPF_CGC, ' ', '')) = 11 and REPLACE(a.CPF_CGC,' ','') <> '00000000000' and EMAIL is not null",
    );
  return result.recordset[0];
}

export async function deletarCadastroCliente(cpf: string) {
  const pool = await getConnection();
  const result = await pool
    .request()
    .input("CODIGO_CLIENTE", cpf)
    .query(
      "delete from CLIENTES_VAREJO where CODIGO_CLIENTE = @CODIGO_CLIENTE",
    );
}

export async function permiteVendaSemCliente() {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query(
      "select * from PARAMETROS where PARAMETRO = 'PermiteVendaSemCliente'",
    );
  return result.recordset[0];
}

export async function buscarTroca() {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query(
      "select top 1 a.TICKET from LOJA_VENDA a join LOJA_VENDA_TROCA b on a.TICKET = b.TICKET where a.DATA_HORA_CANCELAMENTO is null order by a.DATA_VENDA desc",
    );
  return result.recordset[0];
}
