/* eslint-disable */
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Package,    
  TrendingUp,    
  Loader2,     
} from 'lucide-react';


import { FiltrosCard } from '../components/FiltrosCard';
import { VendaRow } from '../components/VendaRow';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Produto {
  nome: string;
  codigo: string;
  preco_custo: number;
  preco_venda: number;
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

// --- Funções de Cálculo (Helpers) ---
// (Passadas como props para VendaRow)

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


// Componente Principal
export default function ComissoesTable() {
  
  function parseDateLocal(isoDate: string): Date {
    const [y, m, d] = isoDate.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }

  function formatDateBR(isoDate: string): string {
    return new Intl.DateTimeFormat('pt-BR').format(parseDateLocal(isoDate));
  }
  
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

  // Estados 
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Filtros
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [filtroCodigo, setFiltroCodigo] = useState('');

  /** Supabase */
  const fetchVendas = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('comissao_vendas')
        .select(
          'id,id_venda,contato_nome,dt_venda,comissao_itens,frete,desconto,comissao_final,produtos,created_at'
        )
        .order('created_at', { ascending: false }) 
        .order('id_venda', { ascending: false });    

      if (error) throw error;
      setVendas((data || []) as unknown as Venda[]);
    } catch (e) {
      console.error('Erro ao buscar comissões:', e);
      alert('Erro ao carregar dados das comissões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendas();
  }, []);


  const vendasFiltradas = useMemo(() => {
    return vendas.filter((v) => {
      const passaCodigo =
        !filtroCodigo.trim() || String(v.id_venda).includes(filtroCodigo.trim());

      const vendaDate =  parseDateLocal(v.dt_venda);
      vendaDate.setHours(0, 0, 0, 0);

      const inicio = dataInicio ? new Date(dataInicio) : null;
      if (inicio) inicio.setHours(0, 0, 0, 0);

      const fim = dataFim ? new Date(dataFim) : null;
      if (fim) fim.setHours(23, 59, 59, 999);

      const passaInicio = !inicio || vendaDate >= inicio;
      const passaFim = !fim || vendaDate <= fim;

      return passaCodigo && passaInicio && passaFim;
    });
  }, [vendas, filtroCodigo, dataInicio, dataFim]);

  const limparFiltros = () => {
    setDataInicio(null);
    setDataFim(null);
    setFiltroCodigo('');
  };

  const toggleRow = (idVenda: number): void => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(idVenda) ? newExpanded.delete(idVenda) : newExpanded.add(idVenda);
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p>Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-emerald-600" size={36} />
              Comissões de Vendas
            </h1>
            <p className="text-slate-600 mt-2">Detalhamento de comissões por venda</p>
          </div>
          <button
            onClick={fetchVendas}
            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            Atualizar dados
          </button>
        </div>

        <FiltrosCard
          dataInicio={dataInicio}
          dataFim={dataFim}
          filtroCodigo={filtroCodigo}
          vendasFiltradasCount={vendasFiltradas.length}
          vendasTotalCount={vendas.length}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
          onFiltroCodigoChange={setFiltroCodigo}
          onLimparFiltros={limparFiltros}
        />

        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Venda</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Data Venda</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Valor da Venda</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Valor de Custo</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Frete</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Comissão Final</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vendasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      <Package size={48} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">
                        {vendas.length === 0
                          ? 'Nenhuma venda encontrada no banco de dados.'
                          : 'Nenhuma venda encontrada com os filtros aplicados.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  vendasFiltradas.map((venda) => (
                    <VendaRow
                      key={venda.id}
                      venda={venda}
                      isExpanded={expandedRows.has(venda.id_venda)}
                      onToggle={() => toggleRow(venda.id_venda)}
                      formatCurrency={formatCurrency}
                      formatDateBR={formatDateBR}
                      calcularValorVenda={calcularValorVenda}
                      calcularValorCusto={calcularValorCusto}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <p className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded"></span>
            Legenda
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Comissão Itens:</strong> Soma das comissões de todos os produtos da venda
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Desconto:</strong> Desconto aplicado na venda
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span>
                <strong>Comissão Final:</strong> Comissão Itens - Frete - Desconto
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}