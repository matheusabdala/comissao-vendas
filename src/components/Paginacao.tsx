import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  itensPorPagina: number;
  totalItens: number;
  onPaginaChange: (pagina: number) => void;
  onItensPorPaginaChange: (quantidade: number) => void;
}

export function Paginacao({
  paginaAtual,
  totalPaginas,
  itensPorPagina,
  totalItens,
  onPaginaChange,
  onItensPorPaginaChange,
}: PaginacaoProps) {
  
  const inicio = totalItens === 0 ? 0 : (paginaAtual - 1) * itensPorPagina + 1;
  const fim = Math.min(paginaAtual * itensPorPagina, totalItens);

  const gerarPaginas = () => {
    const paginas: (number | string)[] = [];
    
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) {
        paginas.push(i);
      }
    } else {
      paginas.push(1);
      
      if (paginaAtual > 3) {
        paginas.push('...');
      }
      
      const inicio = Math.max(2, paginaAtual - 1);
      const fim = Math.min(totalPaginas - 1, paginaAtual + 1);
      
      for (let i = inicio; i <= fim; i++) {
        paginas.push(i);
      }
      
      if (paginaAtual < totalPaginas - 2) {
        paginas.push('...');
      }
      
      paginas.push(totalPaginas);
    }
    
    return paginas;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Informações e Seletor de Itens por Página */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-sm text-slate-600">
            Mostrando <span className="font-semibold text-slate-800">{inicio}</span> a{' '}
            <span className="font-semibold text-slate-800">{fim}</span> de{' '}
            <span className="font-semibold text-slate-800">{totalItens}</span> vendas
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Itens por página:</label>
            <select
              value={itensPorPagina}
              onChange={(e) => onItensPorPaginaChange(Number(e.target.value))}
              className="px-3 py-2 border-2 border-slate-200 rounded-lg hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-20 transition-all text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Controles de Paginação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPaginaChange(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="p-2 rounded-lg border-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all"
            title="Página anterior"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>

          <div className="flex items-center gap-1">
            {gerarPaginas().map((pagina, index) => (
              <div key={index}>
                {pagina === '...' ? (
                  <span className="px-3 py-2 text-slate-400">...</span>
                ) : (
                  <button
                    onClick={() => onPaginaChange(pagina as number)}
                    className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all ${
                      paginaAtual === pagina
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border-2 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300'
                    }`}
                  >
                    {pagina}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onPaginaChange(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas || totalPaginas === 0}
            className="p-2 rounded-lg border-2 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-200 transition-all"
            title="Próxima página"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}