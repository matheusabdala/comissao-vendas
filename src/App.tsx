/* eslint-disable */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Package,
  TrendingUp,
  Loader2,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/** Supabase — (ideal mover para env vars) */
const supabaseUrl = 'https://aksoskjfqktbzlqtbovm.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrc29za2pmcWt0YnpscXRib3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MjY3MjcsImV4cCI6MjA3ODEwMjcyN30.fEIfmMROhzaW1Y7lOIn45V3qFyzY_H2M-NkyHHgLIIU';
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

/* ===== DatePicker custom (mantido) ===== */
function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const popoverRef = useRef<HTMLDivElement>(null);

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const formatDate = (date: Date | null) => (date ? date.toLocaleDateString('pt-BR') : placeholder);
  const isSelected = (date: Date | null) => !!date && !!value && date.toDateString() === value.toDateString();
  const isToday = (date: Date | null) => !!date && date.toDateString() === new Date().toDateString();

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const selectDate = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border-2 border-slate-200 rounded-xl bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-emerald-600" />
          <span className={value ? 'text-slate-900' : 'text-slate-500'}>{formatDate(value)}</span>
        </div>
        {value && <X size={16} className="text-slate-400 hover:text-red-500 transition-colors" onClick={clearDate} />}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={previousMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-semibold text-slate-800">
              {meses[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button type="button" onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center text-xs font-semibold text-slate-600 py-2">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => (
              <div key={index} className="aspect-square">
                {date ? (
                  <button
                    type="button"
                    onClick={() => selectDate(date)}
                    className={`w-full h-full rounded-lg text-sm font-medium transition-all ${
                      isSelected(date)
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : isToday(date)
                        ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-300 hover:bg-emerald-100'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                const hoje = new Date();
                onChange(hoje);
                setCurrentMonth(hoje);
                setIsOpen(false);
              }}
              className="w-full py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======= Tabela ======= */
export default function ComissoesTable() {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [filtroCodigo, setFiltroCodigo] = useState('');

  /** Busca real do Supabase */
  const fetchVendas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comissao_vendas')
        .select(
          'id,id_venda,contato_nome,dt_venda,comissao_itens,frete,desconto,comissao_final,produtos'
        )
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

      const vendaDate = new Date(v.dt_venda);
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

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

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
        {/* Header */}
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

        {/* Filtros */}
        <div className="mb-6 bg-white rounded-2xl shadow-xl border-0 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
              <Calendar className="text-emerald-600" size={20} />
              Filtros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data Início</label>
              <DatePicker value={dataInicio} onChange={setDataInicio} placeholder="Selecione a data inicial" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Data Fim</label>
              <DatePicker value={dataFim} onChange={setDataFim} placeholder="Selecione a data final" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Código da Venda</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ex.: 12345"
                value={filtroCodigo}
                onChange={(e) => setFiltroCodigo(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {vendasFiltradas.length === vendas.length
                ? `Mostrando todas as ${vendas.length} vendas`
                : `Mostrando ${vendasFiltradas.length} de ${vendas.length} vendas`}
            </div>

            {(dataInicio || dataFim || filtroCodigo) && (
              <button
                onClick={limparFiltros}
                className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all flex items-center gap-2 font-medium"
              >
                <X size={16} />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
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
                    <React.Fragment key={venda.id}>
                      <tr className="hover:bg-emerald-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-slate-800">#{venda.id_venda}</td>
                        <td className="px-6 py-4 text-left text-slate-700">{venda.contato_nome || '-'}</td>
                        <td className="px-6 py-4 text-left text-slate-700">
                          {new Intl.DateTimeFormat('pt-BR').format(new Date(venda.dt_venda))}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700 font-medium">
                          {formatCurrency(venda.comissao_itens)}
                        </td>
                        <td className="px-6 py-4 text-right text-red-600 font-medium">
                          -{formatCurrency(venda.frete)}
                        </td>
                        <td className="px-6 py-4 text-right text-red-600 font-medium">
                          -{formatCurrency(venda.desconto)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">
                          {formatCurrency(venda.comissao_final)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => toggleRow(venda.id_venda)}
                            className="inline-flex  text-xs items-center gap-2 px-2 py-2 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 rounded-lg transition-all"
                          >
                            {expandedRows.has(venda.id_venda) ? (
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

                      {expandedRows.has(venda.id_venda) && (
                        <tr>
                          <td colSpan={8} className="bg-gradient-to-br from-slate-50 to-emerald-50/30 px-6 py-6">
                            <div className="space-y-6">
                              {/* Produtos */}
                              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4">
                                  <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                                    <Package size={20} className="text-emerald-600" />
                                    Produtos da Venda
                                  </h3>
                                </div>
                                <div className="overflow-hidden">
                                  <table className="w-full">
                                    <thead className="bg-slate-50">
                                      <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Código</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Produto</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Preço Custo</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Preço Venda</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Margem</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {venda.produtos?.map((produto, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                          <td className="px-4 py-3 text-sm text-slate-600 font-mono">{produto.codigo}</td>
                                          <td className="px-4 py-3 text-sm text-slate-800 font-medium">{produto.nome}</td>
                                          <td className="px-4 py-3 text-sm text-right text-slate-700">
                                            {formatCurrency(produto.preco_custo)}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-right text-slate-700">
                                            {formatCurrency(produto.preco_venda)}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                                            {formatCurrency(produto.preco_venda - produto.preco_custo)}
                                          </td>
                                        </tr>
                                      ))}
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
                                  <div className="flex justify-between items-center pt-3 bg-gradient-to-r from-emerald-50 to-emerald-100 -mx-6 px-6 py-4">
                                    <span className="text-lg font-bold text-slate-800">Comissão Final:</span>
                                    <span className="text-2xl font-bold text-emerald-600">
                                      {formatCurrency(venda.comissao_final)}
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-500 italic pt-2 text-center">
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
                <strong>Frete:</strong> Valor do frete que é subtraído da comissão
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
