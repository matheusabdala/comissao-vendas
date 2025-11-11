function calcularValorVenda(venda: Venda): number {
  const totalProdutos =
    (venda.produtos ?? []).reduce((acc, p) => acc + (p.preco_venda ?? 0), 0);

  const frete = venda.frete ?? 0;
  const desconto = venda.desconto ?? 0;

  return totalProdutos + frete - desconto;
}

function calcularValorCusto(venda: Venda): number {
  return (venda.produtos ?? []).reduce((acc, p) => acc + (p.preco_custo ?? 0), 0);
}
