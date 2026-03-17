import { getConnection } from "./connection";

export async function buscarCodigoDeBarras() {
  const pool = await getConnection();
  const result = await pool
    .request()
    .query("select * from LOJA_VENDA_PRODUTO order by DATA_VENDA desc");
  return result.recordset[0];
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
