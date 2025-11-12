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
import { Paginacao } from '../components/Paginacao';

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

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [filtroCodigo, setFiltroCodigo] = useState('');

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(25);

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
        !filtroCodigo.trim() || 
        String(v.id_venda).includes(filtroCodigo.trim()) ||
        (v.contato_nome && v.contato_nome.toLowerCase().includes(filtroCodigo.trim().toLowerCase()));

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


  const totalPaginas = Math.ceil(vendasFiltradas.length / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const vendasPaginadas = vendasFiltradas.slice(indiceInicio, indiceFim);

  const limparFiltros = () => {
    setDataInicio(null);
    setDataFim(null);
    setFiltroCodigo('');
    setPaginaAtual(1); 
  };

  const handlePaginaChange = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItensPorPaginaChange = (novaQuantidade: number) => {
    setItensPorPagina(novaQuantidade);
    setPaginaAtual(1); 
  };

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtroCodigo, dataInicio, dataFim]);

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
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Venda</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold whitespace-nowrap">Data Venda</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap">Valor da Venda</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap">Valor de Custo</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap">Frete</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap">Comissão Final</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold whitespace-nowrap">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vendasPaginadas.length === 0 ? (
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
                  vendasPaginadas.map((venda) => (
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

        {vendasFiltradas.length > 0 && (
          <>
            <div className="mt-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border-2 border-emerald-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700 font-medium">Total de Comissões</p>
                    <p className="text-xs text-emerald-600">
                      {vendasFiltradas.length} {vendasFiltradas.length === 1 ? 'venda encontrada' : 'vendas encontradas'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-700">
                    {formatCurrency(
                      vendasFiltradas.reduce((acc, v) => acc + (v.comissao_final ?? 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              itensPorPagina={itensPorPagina}
              totalItens={vendasFiltradas.length}
              onPaginaChange={handlePaginaChange}
              onItensPorPaginaChange={handleItensPorPaginaChange}
            />
          </>
        )}

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