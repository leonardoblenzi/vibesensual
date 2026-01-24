
import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, Store, Globe } from 'lucide-react';
import { SaleSource, Product, Sale } from '../types';
import { InventoryController } from '../controllers/InventoryController';
import { SalesController } from '../controllers/SalesController';

const SalesRegistrationView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [source, setSource] = useState<SaleSource>(SaleSource.CATALOG);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fix: Using an internal async function to fetch products
    const loadProducts = async () => {
      const prods = await InventoryController.getProducts();
      setProducts(prods);
    };
    loadProducts();
  }, []);

  // Fix: Converted to async to properly handle SalesController.registerSale
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await SalesController.registerSale({
        productId: selectedProductId,
        productName: products.find(p => p.id === selectedProductId)?.name || '',
        quantity,
        totalPrice: parseFloat(price.replace(',', '.')),
        source,
        date: new Date().toISOString().split('T')[0]
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSelectedProductId('');
      setPrice('');
    } catch (err) {
      alert("Erro ao registrar venda");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-4">
      <header className="text-center">
        <h2 className="text-3xl font-bold vibe-text-gradient">Registrar Venda (MVC)</h2>
      </header>

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-4 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={20} /> Venda processada e estoque atualizado!
        </div>
      )}

      <form onSubmit={handleRegister} className="glass p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {Object.values(SaleSource).map(s => (
            <button 
              key={s} type="button" 
              onClick={() => setSource(s)}
              className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${source === s ? 'vibe-gradient border-transparent text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
            >
              {s === SaleSource.CATALOG ? <Store size={18} /> : <Globe size={18} />} {s}
            </button>
          ))}
        </div>

        <select required value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
          <option value="">Selecionar Produto...</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</option>)}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Qtd" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white" />
          <input placeholder="Preço Final (R$)" value={price} onChange={e => setPrice(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white" />
        </div>

        <button type="submit" className="w-full py-5 vibe-gradient rounded-2xl font-black text-white shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2">
          <ShoppingCart size={20} /> Finalizar Venda
        </button>
      </form>
    </div>
  );
};

export default SalesRegistrationView;
