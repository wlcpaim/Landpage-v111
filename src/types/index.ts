export interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  created_at?: string;
}

export interface User {
  id: string;
  company_id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  created_at?: string;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  company_id: string;
  category_id: string;
  name: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleItem {
  id?: string;
  sale_id?: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  company_id: string;
  client_id?: string;
  client_name?: string;
  total_amount: number;
  discount: number;
  payment_method: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito';
  status: 'concluida' | 'cancelada';
  cashier_id: string;
  created_at: string;
  items?: SaleItem[];
}

export interface CashRegister {
  id: string;
  company_id: string;
  user_id: string;
  opening_amount: number;
  closing_amount?: number;
  expected_amount?: number;
  status: 'aberto' | 'fechado';
  opened_at: string;
  closed_at?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  company_id: string;
  type: 'receita' | 'despesa';
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at?: string;
}

export interface Client {
  id: string;
  company_id: string;
  name: string;
  email: string;
  phone: string;
  debt: number;
  created_at?: string;
}
