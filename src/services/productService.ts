import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DB_PREFIX } from '../lib/constants';
import { Product } from '../types';
import { getProducts } from './posService';

function getLocalProducts(): Product[] {
  const data = localStorage.getItem(DB_PREFIX + 'products');
  return data ? JSON.parse(data) : [];
}

function setLocalProducts(products: Product[]): void {
  localStorage.setItem(DB_PREFIX + 'products', JSON.stringify(products));
}

export async function createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const newProd: Product = {
    ...productData,
    id: 'p-' + Date.now(),
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').insert([newProd]).select().single();
    if (!error && data) return data;
  }

  const products = getLocalProducts();
  setLocalProducts([newProd, ...products]);
  return newProd;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (!error && data) return data;
  }

  const products = getLocalProducts();
  let updatedProd: Product = products[0];
  const updated = products.map(p => {
    if (p.id === id) {
      updatedProd = { ...p, ...updates };
      return updatedProd;
    }
    return p;
  });
  setLocalProducts(updated);
  return updatedProd;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) return true;
  }

  const products = getLocalProducts();
  const filtered = products.filter(p => p.id !== id);
  setLocalProducts(filtered);
  return true;
}

export { getProducts };
