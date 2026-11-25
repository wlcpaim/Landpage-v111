import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DB_PREFIX } from '../lib/constants';
import { Client } from '../types';

const SEED_COMPANY_ID = 'demo-company-1';

const defaultClients: Client[] = [
  { id: 'cl-1', company_id: SEED_COMPANY_ID, name: 'Ana Souza', email: 'ana@email.com', phone: '(11) 98888-1111', debt: 0 },
  { id: 'cl-2', company_id: SEED_COMPANY_ID, name: 'Carlos Lima', email: 'carlos@email.com', phone: '(11) 97777-2222', debt: 45.00 }
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

export async function getClients(companyId = SEED_COMPANY_ID): Promise<Client[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('clients').select('*').eq('company_id', companyId);
    if (!error && data) return data;
  }
  return getLocal<Client[]>('clients', defaultClients);
}

export async function createClient(clientData: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  const newClient: Client = {
    ...clientData,
    id: 'cl-' + Date.now(),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('clients').insert([newClient]).select().single();
    if (!error && data) return data;
  }

  const clients = getLocal<Client[]>('clients', defaultClients);
  setLocal('clients', [newClient, ...clients]);
  return newClient;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
    if (!error && data) return data;
  }

  const clients = getLocal<Client[]>('clients', defaultClients);
  let updatedClient: Client = clients[0];
  const updated = clients.map(c => {
    if (c.id === id) {
      updatedClient = { ...c, ...updates };
      return updatedClient;
    }
    return c;
  });
  setLocal('clients', updated);
  return updatedClient;
}
