/* eslint-disable */

import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronDown, ChevronUp, DollarSign, Package, TrendingUp, Loader2, Calendar, X } from 'lucide-react';

// mover para arquivo separado, e usar variáveis de ambiente
const supabaseUrl = 'https://aksoskjfqktbzlqtbovm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrc29za2pmcWt0YnpscXRib3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MjY3MjcsImV4cCI6MjA3ODEwMjcyN30.fEIfmMROhzaW1Y7lOIn45V3qFyzY_H2M-NkyHHgLIIU';
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
  dt_venda: string;      // ISO (YYYY-MM-DD) recomendado
  contato_nome?: string;
}

export default function ComissoesTable() {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Filtros (novos) ----
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');

  useEffect(() => {
    fetchVendas();
  }, []);

  async function fetchVendas() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comissao_vendas')
        .select('*')
        .order('id_venda', { ascending: false });

      if (error) throw error;
      if (data) setVendas(data as unknown as Venda[]);
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
      alert('Erro ao carregar dados das comissões.');
    } finally {
      setLoading(false);
    }
  }

  // Lista já filtrada (data + código)
  const vendasFiltradas = useMemo(() => {
    return vendas.filter((v) => {
      const passaCodigo =
        !filtroCodigo.trim() || String(v.id_venda).includes(filtroCodigo.trim());

      // Comparação de datas usando objetos Date para segurança
      const vendaDate = new Date(v.dt_venda);
      const passaInicio = !dataInicio || vendaDate >= new Date(dataInicio);
      const passaFim = !dataFim || vendaDate <= new Date(dataFim);

      return passaCodigo && passaInicio && passaFim;
    });
  }, [vendas, filtroCodigo, dataInicio, dataFim]);

  const limparFiltros = () => {
    setDataInicio('');
    setDataFim('');
    setFiltroCodigo('');
  };

  const toggleRow = (idVenda: number): void => {
    const newExpanded = new Set(expandedRows);
    newExpanded.has(idVenda) ? newExpanded.delete(idVenda) : newExpanded.add(idVenda);
    setExpandedRows(newExpanded);
  };

  const formatCurrency = (value: number): string => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p>Carregando comissões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <TrendingUp className="text-emerald-600" />
              Comissões de Vendas
            </h1>
            <p className="text-slate-600 mt-2">Detalhamento de comissões por venda</p>
          </div>
          <button
            onClick={fetchVendas}
            className="px-4 py-2 text-sm bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Atualizar dados
          </button>
        </div>

        {/* ---- Barra de Filtros (minimalista) ---- */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" /> 
                Data Início
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-slate-300"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>
              {dataInicio && (
                <p className="mt-1 text-xs text-slate-500">
                  {new Intl.DateTimeFormat('pt-BR').format(new Date(dataInicio))}
                </p>
              )}
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" /> 
                Data Fim
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-slate-300"
                  style={{
                    colorScheme: 'light'
                  }}
                />
              </div>
              {dataFim && (
                <p className="mt-1 text-xs text-slate-500">
                  {new Intl.DateTimeFormat('pt-BR').format(new Date(dataFim))}
                </p>
              )}
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Código da Venda
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex.: 12345"
                value={filtroCodigo}
                onChange={(e) => setFiltroCodigo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-slate-300"
              />
            </div>

            <div className="flex gap-2 items-end">
              {(dataInicio || dataFim || filtroCodigo) && (
                <button
                  onClick={limparFiltros}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-2 font-medium"
                  title="Limpar filtros"
                >
                  <X size={18} /> Limpar
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
              {vendasFiltradas.length === vendas.length
                ? `Mostrando todas as ${vendas.length} vendas`
                : `Mostrando ${vendasFiltradas.length} de ${vendas.length} vendas`}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Venda</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Data Venda</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Comissão Itens</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Frete</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Desconto</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Comissão Final</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vendasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                      {vendas.length === 0
                        ? 'Nenhuma venda encontrada no banco de dados.'
                        : 'Nenhuma venda encontrada com os filtros aplicados.'}
                    </td>
                  </tr>
                ) : (
                  vendasFiltradas.map((venda) => (
                    <React.Fragment key={venda.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-800">#{venda.id_venda}</td>
                        <td className="px-6 py-4 text-left text-slate-700">
                          {venda.contato_nome || ''}
                        </td>
                        <td className="px-6 py-4 text-left text-slate-700">
                          {new Intl.DateTimeFormat('pt-BR').format(new Date(venda.dt_venda))}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700">
                          {formatCurrency(venda.comissao_itens)}
                        </td>
                        <td className="px-6 py-4 text-right text-red-600">
                          -{formatCurrency(venda.frete)}
                        </td>
                        <td className="px-6 py-4 text-right text-red-600">
                          -{formatCurrency(venda.desconto)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">
                          {formatCurrency(venda.comissao_final)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleRow(venda.id_venda)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            {expandedRows.has(venda.id_venda) ? (
                              <>
                                <ChevronUp size={16} />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} />
                                Ver Detalhes
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {expandedRows.has(venda.id_venda) && (
                        <tr>
                          <td colSpan={8} className="bg-slate-50 px-6 py-6">
                            <div className="space-y-6">
                              {/* Produtos */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                  <Package size={20} className="text-slate-600" />
                                  Produtos da Venda
                                </h3>
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-slate-100">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                          Código
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                          Produto
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                          Preço Custo
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                          Preço Venda
                                        </th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                          Margem
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {venda.produtos && Array.isArray(venda.produtos) ? (
                                        venda.produtos.map((produto, idx) => (
                                          <tr key={idx} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                                              {produto.codigo}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-800">
                                              {produto.nome}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-slate-700">
                                              {formatCurrency(produto.preco_custo)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-slate-700">
                                              {formatCurrency(produto.preco_venda)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium text-emerald-600">
                                              {formatCurrency(produto.preco_venda - produto.preco_custo)}
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={5} className="px-4 py-3 text-sm text-center text-slate-500">
                                            Detalhes dos produtos não disponíveis.
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Cálculo da Comissão */}
                              <div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                  <DollarSign size={20} className="text-slate-600" />
                                  Cálculo da Comissão Final
                                </h3>
                                <div className="bg-white rounded-lg shadow p-6 space-y-3">
                                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                    <span className="text-slate-700">Comissão dos Itens:</span>
                                    <span className="font-semibold text-slate-800">
                                      {formatCurrency(venda.comissao_itens)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                    <span className="text-slate-700">Frete:</span>
                                    <span className="font-semibold text-red-600">
                                      -{formatCurrency(venda.frete)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                                    <span className="text-slate-700">Desconto da Venda:</span>
                                    <span className="font-semibold text-red-600">
                                      -{formatCurrency(venda.desconto)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center pt-3 bg-emerald-50 -mx-6 px-6 py-4 rounded-b-lg">
                                    <span className="text-lg font-bold text-slate-800">Comissão Final:</span>
                                    <span className="text-2xl font-bold text-emerald-600">
                                      {formatCurrency(venda.comissao_final)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 italic pt-2">
                                    Fórmula: Comissão Final = Comissão Itens - Frete - Desconto
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 text-sm text-slate-600 bg-white rounded-lg shadow p-4">
          <p className="font-semibold mb-2">Legenda:</p>
          <ul className="space-y-1">
            <li>• <strong>Comissão Itens:</strong> Soma das comissões de todos os produtos da venda</li>
            <li>• <strong>Frete:</strong> Valor do frete que é subtraído da comissão</li>
            <li>• <strong>Desconto:</strong> Desconto aplicado na venda</li>
            <li>• <strong>Comissão Final:</strong> Comissão Itens - Frete - Desconto</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
