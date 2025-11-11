// types/index.ts

export interface Produto {
  nome: string;
  codigo: string;
  preco_custo: number;
  preco_venda: number;
}

export interface Venda {
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

export interface VendasFilters {
  dataInicio: Date | null;
  dataFim: Date | null;
  filtroCodigo: string;
}

export interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder: string;
}

export interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}