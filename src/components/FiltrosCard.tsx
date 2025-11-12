import { Calendar, X } from 'lucide-react';
import { DatePicker } from './DatePicker'; 

interface FiltrosCardProps {
  dataInicio: Date | null;
  dataFim: Date | null;
  filtroCodigo: string;
  vendasFiltradasCount: number;
  vendasTotalCount: number;
  onDataInicioChange: (date: Date | null) => void;
  onDataFimChange: (date: Date | null) => void;
  onFiltroCodigoChange: (value: string) => void;
  onLimparFiltros: () => void;
}

export function FiltrosCard({
  dataInicio,
  dataFim,
  filtroCodigo,
  vendasFiltradasCount,
  vendasTotalCount,
  onDataInicioChange,
  onDataFimChange,
  onFiltroCodigoChange,
  onLimparFiltros,
}: FiltrosCardProps) {
  
  const filtrosAtivos = dataInicio || dataFim || filtroCodigo;

  return (
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
          <DatePicker
            value={dataInicio}
            onChange={onDataInicioChange}
            placeholder="Selecione a data inicial"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Data Fim</label>
          <DatePicker
            value={dataFim}
            onChange={onDataFimChange}
            placeholder="Selecione a data final"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Código ou Cliente</label>
          <input
            type="text"
            placeholder="Ex.: 12345 ou Maria Silva"
            value={filtroCodigo}
            onChange={(e) => onFiltroCodigoChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          {vendasFiltradasCount === vendasTotalCount
            ? `Mostrando todas as ${vendasTotalCount} vendas`
            : `Mostrando ${vendasFiltradasCount} de ${vendasTotalCount} vendas`}
        </div>

        {filtrosAtivos && (
          <button
            onClick={onLimparFiltros}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 hover:border-red-300 transition-all flex items-center gap-2 font-medium"
          >
            <X size={16} />
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
}