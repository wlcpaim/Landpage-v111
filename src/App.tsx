import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { ShoppingCart, LayoutDashboard, Package, DollarSign, Users, Store, AlertTriangle, Shield, CheckCircle, Plus, Search, Trash2, ArrowRight } from 'lucide-react';
import { getProducts, getOpenCashRegister, openCashRegister, closeCashRegister, createSale } from './services/posService';
import { getTransactions, createTransaction } from './services/financeService';
import { getClients, createClient } from './services/clientService';
import { Product, CartItem, Transaction, Client } from './types';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado</h1>
            <p className="text-slate-400 text-sm mb-6">{this.state.error?.message || 'Ocorreu um erro inesperado na aplicação.'}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-600/20"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

function Navbar() {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">OmniPOS</span>
            <span className="text-xs block text-emerald-400 font-medium">Core SaaS</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/pos" className="text-slate-300 hover:text-emerald-400 text-sm font-medium flex items-center gap-2 transition">
            <ShoppingCart className="w-4 h-4" /> Frente de Caixa (PDV)
          </Link>
          <Link to="/dashboard" className="text-slate-300 hover:text-emerald-400 text-sm font-medium flex items-center gap-2 transition">
            <LayoutDashboard className="w-4 h-4" /> Retaguarda
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/pos" className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20">
            Abrir PDV
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomeView() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
          <Shield className="w-3.5 h-3.5" /> Sistema PDV SaaS e Retaguarda Financeira
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Gestão completa e inteligente para o seu <span className="text-emerald-400">negócio</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Controle seu Frente de Caixa (PDV), estoque, clientes e fluxo financeiro em tempo real com alta performance e sincronização em nuvem.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/pos" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-xl shadow-emerald-600/20">
            Acessar Frente de Caixa (PDV) <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition">
            Acessar Retaguarda <LayoutDashboard className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">PDV Ágil & Offline-First</h3>
            <p className="text-slate-400 text-sm">Realize vendas rapidamente com suporte a leitor de código de barras, múltiplos pagamentos e abertura de caixa.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Retaguarda Financeira</h3>
            <p className="text-slate-400 text-sm">Acompanhe receitas, despesas, fluxo de caixa e relatórios consolidados em tempo real.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Controle de Estoque</h3>
            <p className="text-slate-400 text-sm">Gerencie produtos, categorias e alertas automáticos de estoque mínimo com facilidade.</p>
          </div>
        </div>
      </div>
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        OmniPOS Core 1.9.9 — Todos os direitos reservados. <Link to="/admin" className="text-slate-600 hover:text-slate-400 ml-2">Admin</Link>
      </footer>
    </div>
  );
}

function POSView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito'>('dinheiro');
  const [cashRegister, setCashRegister] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const prods = await getProducts();
    setProducts(prods);
    const reg = await getOpenCashRegister();
    setCashRegister(reg);
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(id: string, qty: number) {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
    }
  }

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  async function handleCheckout() {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await createSale({
        company_id: 'demo-company-1',
        total_amount: totalAmount,
        discount: 0,
        payment_method: paymentMethod,
        status: 'concluida',
        cashier_id: 'u1',
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        }))
      });
      alert('Venda realizada com sucesso!');
      setCart([]);
      loadData();
    } catch (err) {
      alert('Erro ao finalizar venda.');
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.barcode && p.barcode.includes(search)));

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col md:flex-row">
      <div className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Frente de Caixa (PDV)</h1>
            <p className="text-slate-400 text-sm">Caixa: <span className="text-emerald-400 font-medium">{cashRegister ? 'Aberto' : 'Fechado'}</span></p>
          </div>
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Buscar produto ou código..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-12rem)] pb-4">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-4 text-left flex flex-col justify-between transition group"
            >
              <div>
                <span className="text-xs text-slate-500 block mb-1">Estoque: {product.stock}</span>
                <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-emerald-400 transition">{product.name}</h3>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-emerald-400 font-bold">R$ {product.price.toFixed(2)}</span>
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" /> Carrinho Atual
          </h2>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 mb-4">
            {cart.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">Carrinho vazio</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-white">{item.name}</h4>
                    <span className="text-xs text-emerald-400">R$ {item.price.toFixed(2)} un</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-800 rounded-lg">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-slate-400 hover:text-white">-</button>
                      <span className="px-2 text-sm text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-slate-400 hover:text-white">+</button>
                    </div>
                    <button onClick={() => updateQuantity(item.id, 0)} className="text-slate-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="border-t border-slate-800 pt-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Forma de Pagamento</span>
            </div>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 mb-4"
            >
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">Pix</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
            </select>

            <div className="flex justify-between items-center text-lg font-bold text-white mb-6">
              <span>Total:</span>
              <span className="text-emerald-400">R$ {totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0 || loading}
            onClick={handleCheckout}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            {loading ? 'Processando...' : 'Finalizar Venda'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tab, setTab] = useState<'finance' | 'clients'>('finance');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const txs = await getTransactions();
    setTransactions(txs);
    const cls = await getClients();
    setClients(cls);
  }

  const totalRevenue = transactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'despesa').reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Retaguarda do Sistema</h1>
            <p className="text-slate-400 text-sm">Gerencie finanças e clientes da sua empresa</p>
          </div>
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setTab('finance')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'finance' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Finanças
            </button>
            <button
              onClick={() => setTab('clients')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === 'clients' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Clientes
            </button>
          </div>
        </div>

        {tab === 'finance' ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <span className="text-slate-400 text-sm block mb-1">Receitas Totais</span>
                <span className="text-2xl font-bold text-emerald-400">R$ {totalRevenue.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <span className="text-slate-400 text-sm block mb-1">Despesas Totais</span>
                <span className="text-2xl font-bold text-red-400">R$ {totalExpense.toFixed(2)}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <span className="text-slate-400 text-sm block mb-1">Saldo Líquido</span>
                <span className="text-2xl font-bold text-white">R$ {(totalRevenue - totalExpense).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Transações Recentes</h3>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white text-sm">{tx.description || tx.category}</h4>
                      <span className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'receita' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Lista de Clientes</h3>
            <div className="space-y-3">
              {clients.map(client => (
                <div key={client.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white text-sm">{client.name}</h4>
                    <span className="text-xs text-slate-500">{client.email || 'Sem e-mail'} • {client.phone || 'Sem telefone'}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-300">Débito: R$ {(client.debt || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminView() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
        <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Área Administrativa</h1>
        <p className="text-slate-400 text-sm mb-6">Painel de controle restrito do sistema OmniPOS Core.</p>
        <Link to="/" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-xl transition">
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/pos" element={<POSView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/admin/login" element={<AdminView />} />
          <Route path="/admin/dashboard" element={<AdminView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
