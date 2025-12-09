import { ChevronDown, ChevronUp, Package, DollarSign } from 'lucide-react';

interface Produto {
  nome: string;
  codigo: string;
  preco_custo: number;
  preco_venda: number;
  quantidade?: number;
}

interface Venda {
  id: number;
  id_venda: number;
  produtos: Produto[];
  comissao_itens: number;
  frete: number;
  desconto: number;
  comissao_final: number;
  dt_venda: string;
  contato_nome?: string;
}

interface VendaRowProps {
  venda: Venda;
  isExpanded: boolean;
  onToggle: () => void;
  formatCurrency: (value: number) => string;
  formatDateBR: (isoDate: string) => string;
  calcularValorVenda: (venda: Venda) => number;
  calcularValorCusto: (venda: Venda) => number;
}

export function VendaRow({
  venda,
  isExpanded,
  onToggle,
  formatCurrency,
  formatDateBR,
  calcularValorVenda,
  calcularValorCusto,
}: VendaRowProps) {
  return (
    <>
      {/* Linha principal */}
      <tr className="hover:bg-emerald-50/50 transition-colors">
        <td className="px-6 py-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
          #{venda.id_venda}
        </td>
        <td className="px-6 py-4 text-left text-slate-700 whitespace-nowrap">
          {venda.contato_nome || '-'}
        </td>
        <td className="px-6 py-4 text-left text-slate-700 whitespace-nowrap">
          {formatDateBR(venda.dt_venda)}
        </td>
        <td className="px-6 py-4 text-right text-slate-700 font-semibold whitespace-nowrap">
          {formatCurrency(calcularValorVenda(venda))}
        </td>
        <td className="px-6 py-4 text-right text-red-600 font-medium whitespace-nowrap">
          <span className="inline-block">
            -{formatCurrency(calcularValorCusto(venda))}
          </span>
        </td>
        <td className="px-6 py-4 text-right text-red-600 font-medium whitespace-nowrap">
          <span className="inline-block">-{formatCurrency(venda.frete)}</span>
        </td>
        <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg whitespace-nowrap">
          {formatCurrency(venda.comissao_final)}
        </td>
        <td className="px-6 py-4 text-center whitespace-nowrap">
          <button
            onClick={onToggle}
            className="inline-flex text-xs items-center gap-2 px-2 py-2 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 rounded-lg transition-all"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                Ver Detalhes
              </>
            )}
          </button>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td
            colSpan={8}
            className="bg-gradient-to-br from-slate-50 to-emerald-50/30 px-6 py-6"
          >
            <div className="space-y-6">
              {/* Tabela de Produtos */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    <Package size={20} className="text-emerald-600" />
                    Produtos da Venda
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 whitespace-nowrap">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                          Produto
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                          Qtd
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                          Preço Custo (un)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                          Preço Venda (un)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                          Total Venda
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 whitespace-nowrap">
                          Margem Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {venda.produtos?.map((produto, idx) => {
                        const qtd = produto.quantidade ?? 1;
                        const totalVenda =
                          (produto.preco_venda ?? 0) * qtd;
                        const totalCusto =
                          (produto.preco_custo ?? 0) * qtd;
                        const margemTotal = totalVenda - totalCusto;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-sm text-slate-600 font-mono whitespace-nowrap">
                              {produto.codigo}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                              {produto.nome}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-slate-700 whitespace-nowrap">
                              {qtd}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-slate-700 whitespace-nowrap">
                              {formatCurrency(produto.preco_custo)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-slate-700 whitespace-nowrap">
                              {formatCurrency(produto.preco_venda)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-slate-700 whitespace-nowrap">
                              {formatCurrency(totalVenda)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600 whitespace-nowrap">
                              {formatCurrency(margemTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cálculo da Comissão */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                    <DollarSign size={20} className="text-emerald-600" />
                    Cálculo da Comissão Final
                  </h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-700">
                      Comissão dos Itens (já considerando quantidade):
                    </span>
                    <span className="font-semibold text-slate-800 whitespace-nowrap">
                      {formatCurrency(venda.comissao_itens)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-700">Desconto da Venda:</span>
                    <span className="font-semibold text-red-600 whitespace-nowrap">
                      <span className="inline-block">
                        -{formatCurrency(venda.desconto)}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 bg-gradient-to-r from-emerald-50 to-emerald-100 -mx-6 px-6 py-4">
                    <span className="text-lg font-bold text-slate-800">
                      Comissão Final:
                    </span>
                    <span className="text-2xl font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(venda.comissao_final)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 italic pt-2 text-center">
                    Fórmula: Comissão Final = Comissão Itens - Desconto
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
