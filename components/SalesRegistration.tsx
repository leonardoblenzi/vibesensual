
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  CheckCircle2, 
  Store, 
  Globe, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  DollarSign, 
  Percent, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { SaleSource, Product, PricingRule, Sale } from '../types';

const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Vibrador Ponto G Golfinho Liso', 
    description: '', categoryId: 'cat2', 
    price: 19.90, promoPrice: 14.90, costPrice: 5.00, 
    stock: 21, minStock: 5, sku: 'VB-40543', 
    images: [], variations: [] 
  },
  { 
    id: '2', 
    name: 'Gel Funcional Hot Ice 15g', 
    description: '', categoryId: 'cat1', 
    price: 26.90, promoPrice: 21.90, costPrice: 8.50, 
    stock: 45, minStock: 10, sku: 'GH-1241', 
    images: [], variations: [] 
  }
];

const SalesRegistration: React.FC = () => {
  const [source, setSource] = useState<SaleSource>(SaleSource.CATALOG);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [salePrice, setSalePrice] = useState<string>('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [rules, setRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    const savedRules = localStorage.getItem('vibe_pricing_rules');
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    }
  }, []);

  const selectedProduct = useMemo(() => 
    MOCK_PRODUCTS.find(p => p.id === selectedProductId), 
    [selectedProductId]
  );

  const financialSummary = useMemo(() => {
    if (!selectedProduct || !salePrice) return { profitR: 0, profitP: 0, totalFees: 0, isLoss: false };

    const price = parseFloat(salePrice.replace(',', '.'));
    const totalCost = selectedProduct.costPrice * quantity;
    const rule = rules.find(r => r.source === source);
    
    const mktFees = rule ? (price * (rule.marketplaceFee || 0) / 100) : 0;
    const commFees = rule ? (price * (rule.commission || 0) / 100) : 0;
    const fixedFees = rule ? (rule.fixedFee || 0) : 0;
    
    const totalFees = mktFees + commFees + fixedFees;
    const profitR = price - totalCost - totalFees;
    const profitP = price > 0 ? (profitR / price) * 100 : 0;

    return { profitR, profitP, totalFees, isLoss: profitR < 0 };
  }, [selectedProduct, quantity, salePrice, source, rules]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !salePrice) return;
    
    const priceValue = parseFloat(salePrice.replace(',', '.'));

    const newSale: Sale = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      totalPrice: priceValue,
      date: saleDate,
      source,
      profitR: financialSummary.profitR,
      profitP: financialSummary.profitP,
      costAtTime: selectedProduct.costPrice,
      customerName,
      customerPhone
    };

    // Persistência
    const existingSales = JSON.parse(localStorage.getItem('vibe_sales') || '[]');
    localStorage.setItem('vibe_sales', JSON.stringify([newSale, ...existingSales]));
    
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelectedProductId('');
      setSalePrice('');
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <header className="text-center">
        <h2 className="text-3xl font-bold vibe-text-gradient italic">Registrar Venda</h2>
        <p className="text-slate-400 mt-2">Atualize seu estoque e acompanhe a rentabilidade de cada canal.</p>
      </header>

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
          <CheckCircle2 size={24} />
          <span className="font-bold">Venda registrada com sucesso no sistema!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleRegister} className="lg:col-span-2 glass p-8 rounded-3xl border border-slate-800 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Store size={14} /> Origem da Venda
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: SaleSource.CATALOG, label: 'Catálogo', icon: <Store size={18} /> },
                { id: SaleSource.MARKETPLACE_ML, label: 'M. Livre', icon: <Globe size={18} /> },
                { id: SaleSource.MARKETPLACE_SHOPEE, label: 'Shopee', icon: <Globe size={18} /> },
                { id: SaleSource.MARKETPLACE_AMAZON, label: 'Amazon', icon: <Globe size={18} /> },
              ].map((opt) => (
                <button 
                  key={opt.id}
                  type="button"
                  onClick={() => setSource(opt.id)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${source === opt.id ? 'vibe-gradient border-transparent text-white shadow-lg shadow-purple-500/20' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  {opt.icon}
                  <span className="font-bold text-[10px] uppercase tracking-tighter">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={14} /> Produto
              </label>
              <select 
                required
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none font-bold"
              >
                <option value="">Selecione...</option>
                {MOCK_PRODUCTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Data
              </label>
              <input 
                type="date" 
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none color-scheme-dark" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Qtd</label>
              <input 
                type="number" 
                min="1" 
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Preço Final (Venda)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">R$</span>
                <input 
                  type="text" 
                  placeholder="0,00"
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-800">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Dados do Cliente (Opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Nome" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
              />
              <input 
                placeholder="WhatsApp" 
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 vibe-gradient rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <ShoppingCart size={20} /> Finalizar Registro
          </button>
        </form>

        <aside className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-slate-800 space-y-6 sticky top-8">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] border-b border-slate-800 pb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-purple-400" /> Analítico da Venda
            </h3>
            
            {selectedProduct ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-4 rounded-2xl border transition-colors ${financialSummary.isLoss ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lucro Líquido</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-black ${financialSummary.isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
                        R$ {financialSummary.profitR.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-2xl border transition-colors ${financialSummary.isLoss ? 'bg-rose-500/10 border-rose-500/30' : 'bg-purple-500/10 border-purple-500/30'}`}>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Margem Real</p>
                    <div className="flex items-center gap-2">
                      <Percent size={18} className="text-purple-400" />
                      <span className="text-2xl font-black text-white">{financialSummary.profitP.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex justify-between"><span>Custo Prod.:</span><span className="text-slate-200">R$ {(selectedProduct.costPrice * quantity).toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Taxas Canal:</span><span className="text-rose-400">- R$ {financialSummary.totalFees.toFixed(2)}</span></div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between text-white font-black"><span>Receita:</span><span>R$ {parseFloat(salePrice.replace(',', '.') || '0').toFixed(2)}</span></div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-4 opacity-30">
                <ShoppingCart size={48} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">Selecione um produto</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SalesRegistration;
