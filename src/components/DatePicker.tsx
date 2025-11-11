import { useState, useRef, useEffect } from 'react';
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const popoverRef = useRef<HTMLDivElement>(null);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Fechar ao clicar fora
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