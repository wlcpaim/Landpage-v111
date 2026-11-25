import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DB_PREFIX } from '../lib/constants';
import { Product, Sale, CashRegister, SaleItem } from '../types';

const SEED_COMPANY_ID = 'demo-company-1';

const defaultProducts: Product[] = [
  { id: 'p1', company_id: SEED_COMPANY_ID, category_id: 'c1', name: 'Café Espresso Gourmet', barcode: '7891001', price: 6.50, cost_price: 2.00, stock: 150, min_stock: 20 },
  { id: 'p2', company_id: SEED_COMPANY_ID, category_id: 'c1', name: 'Pão de Queijo Artesanal', barcode: '7891002', price: 5.00, cost_price: 1.50, stock: 80, min_stock: 15 },
  { id: 'p3', company_id: SEED_COMPANY_ID, category_id: 'c2', name: 'Sanduíche Natural de Frango', barcode: '7891003', price: 14.90, cost_price: 6.00, stock: 25, min_stock: 5 },
  { id: 'p4', company_id: SEED_COMPANY_ID, category_id: 'c3', name: 'Suco Natural de Laranja 500ml', barcode: '7891004', price: 8.00, cost_price: 3.00, stock: 40, min_stock: 10 }
];

const defaultCashRegister: CashRegister = {
  id: 'cash-1',
  company_id: SEED_COMPANY_ID,
  user_id: 'u1',
  opening_amount: 300.00,
  status: 'aberto',
  opened_at: new Date().toISOString()
};

function getLocal<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(DB_PREFIX + key);
  if (!data) {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
}

export async function getProducts(companyId = SEED_COMPANY_ID): Promise<Product[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').eq('company_id', companyId);
    if (!error && data) return data;
  }
  return getLocal<Product[]>('products', defaultProducts);
}

export async function getOpenCashRegister(companyId = SEED_COMPANY_ID): Promise<CashRegister | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('cash_registers').select('*').eq('company_id', companyId).eq('status', 'aberto').maybeSingle();
    if (!error && data) return data;
  }
  const registers = getLocal<CashRegister[]>('cash_registers', [defaultCashRegister]);
  return registers.find(r => r.company_id === companyId && r.status === 'aberto') || null;
}

export async function openCashRegister(companyId: string, userId: string, openingAmount: number): Promise<CashRegister> {
  const newReg: CashRegister = {
    id: 'cash-' + Date.now(),
    company_id: companyId,
    user_id: userId,
    opening_amount: openingAmount,
    status: 'aberto',
    opened_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('cash_registers').insert([newReg]).select().single();
    if (!error && data) return data;
  }

  const registers = getLocal<CashRegister[]>('cash_registers', [defaultCashRegister]);
  const updated = [newReg, ...registers];
  setLocal('cash_registers', updated);
  return newReg;
}

export async function closeCashRegister(cashRegisterId: string, closingAmount: number, notes?: string): Promise<CashRegister> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('cash_registers').update({ status: 'fechado', closing_amount: closingAmount, closed_at: now, notes }).eq('id', cashRegisterId).select().single();
    if (!error && data) return data;
  }

  const registers = getLocal<CashRegister[]>('cash_registers', [defaultCashRegister]);
  const updated = registers.map(r => r.id === cashRegisterId ? { ...r, status: 'fechado' as const, closing_amount: closingAmount, closed_at: now, notes } : r);
  setLocal('cash_registers', updated);
  return updated.find(r => r.id === cashRegisterId)!;
}

export async function createSale(saleData: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
  const saleId = 'sale-' + Date.now();
  const newSale: Sale = {
    ...saleData,
    id: saleId,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { items, ...header } = newSale;
    const { data, error } = await supabase.from('sales').insert([header]).select().single();
    if (!error && data && items) {
      const dbItems = items.map(it => ({ ...it, sale_id: saleId }));
      await supabase.from('sale_items').insert(dbItems);
    }
    if (!error && data) return newSale;
  }

  const sales = getLocal<Sale[]>('sales', []);
  setLocal('sales', [newSale, ...sales]);

  // Atualizar estoque local
  const products = getProductsSync();
  if (newSale.items) {
    for (const item of newSale.items) {
      const p = products.find(prod => prod.id === item.product_id);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }
    setLocal('products', products);
  }

  return newSale;
}

function getProductsSync(): Product[] {
  const data = localStorage.getItem(DB_PREFIX + 'products');
  return data ? JSON.parse(data) : defaultProducts;
}
