import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DB_PREFIX } from '../lib/constants';
import { Transaction, Sale } from '../types';

const SEED_COMPANY_ID = 'demo-company-1';

const defaultTransactions: Transaction[] = [
  { id: 't1', company_id: SEED_COMPANY_ID, type: 'receita', category: 'Vendas PDV', amount: 1450.00, description: 'Fechamento de Caixa', date: new Date().toISOString() },
  { id: 't2', company_id: SEED_COMPANY_ID, type: 'despesa', category: 'Fornecedores', amount: 420.00, description: 'Compra de grãos de café', date: new Date().toISOString() },
  { id: 't3', company_id: SEED_COMPANY_ID, type: 'despesa', category: 'Aluguel', amount: 800.00, description: 'Aluguel comercial', date: new Date().toISOString() }
];

function getLocal<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(DB_PREFIX + key);
  if (!data) {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(fallback));
    return fallback;
  }
  try { return JSON.parse(data); } catch { return fallback; }
}

function setLocal<T>(key: string, value: T): void {
  localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
}

export async function getTransactions(companyId = SEED_COMPANY_ID): Promise<Transaction[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('transactions').select('*').eq('company_id', companyId);
    if (!error && data) return data;
  }
  return getLocal<Transaction[]>('transactions', defaultTransactions);
}

export async function createTransaction(txData: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
  const newTx: Transaction = {
    ...txData,
    id: 'tx-' + Date.now(),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('transactions').insert([newTx]).select().single();
    if (!error && data) return data;
  }

  const txs = getLocal<Transaction[]>('transactions', defaultTransactions);
  setLocal('transactions', [newTx, ...txs]);
  return newTx;
}

export async function getFinancialMetrics(companyId = SEED_COMPANY_ID) {
  const salesData: Sale[] = getLocal<Sale[]>('sales', []);
  const txsData = await getTransactions(companyId);

  const totalRevenue = salesData.reduce((acc, s) => acc + s.total_amount, 0) +
    txsData.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = txsData.filter(t => t.type === 'despesa').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const averageTicket = salesData.length > 0 ? salesData.reduce((acc, s) => acc + s.total_amount, 0) / salesData.length : 0;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    averageTicket,
    totalSalesCount: salesData.length
  };
}
