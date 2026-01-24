
import React, { useState } from 'react';
import { Truck, CheckCircle2, Search, Calendar, PackagePlus, DollarSign, ListOrdered } from 'lucide-react';

const StockInflow: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <header className="text-center">
        <h2 className="text-3xl font-bold vibe-text-gradient">Novas Entradas de Estoque</h2>
        <p className="text-slate-400 mt-2">Registre a chegada de novas mercadorias e atualize seu custo médio.</p>
      </header>

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
          <CheckCircle2 size={24} />
          <span className="font-bold">Carga registrada! O estoque foi incrementado com sucesso.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl border border-slate-800 space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Search size={16} /> Identificar Produto
          </label>
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
                required
                type="text" 
                placeholder="Busque por Nome ou SKU..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
             />
          </div>
          <p className="text-[10px] text-slate-500 px-2 uppercase font-bold tracking-widest">Apenas produtos já cadastrados podem receber entradas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
              <Calendar size={16} /> Data da Compra
            </label>
            <input 
              required
              type="date" 
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none color-scheme-dark" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
              <ListOrdered size={16} /> Quantidade Recebida
            </label>
            <input 
              required
              type="number" 
              min="1"
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
            <DollarSign size={16} /> Preço de Custo Unitário (R$)
          </label>
          <div className="relative">
             <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
                required
                type="number" 
                step="0.01"
                placeholder="0,00"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
             />
          </div>
          <p className="text-[10px] text-slate-500 px-2 uppercase font-bold tracking-widest">Isso atualizará o custo médio do produto no sistema.</p>
        </div>

        <button 
          type="submit"
          className="w-full py-4 vibe-gradient rounded-2xl font-bold text-white text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.01] transition-transform active:scale-95 flex items-center justify-center gap-3"
        >
          <PackagePlus size={24} />
          Registrar Entrada
        </button>
      </form>

      <div className="glass p-6 rounded-2xl border border-slate-800">
         <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Truck size={18} className="text-purple-400" /> Últimas Entradas</h3>
         <div className="space-y-3">
            {[
              { product: 'Gel Hot 15g', qty: 50, cost: 8.50, date: '2023-10-24' },
              { product: 'Óleo de Massagem', qty: 20, cost: 14.20, date: '2023-10-22' },
            ].map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                 <div>
                    <div className="text-sm text-white font-medium">{entry.product}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{entry.date}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-emerald-400 font-bold text-sm">+{entry.qty} un</div>
                    <div className="text-[10px] text-slate-500">Total: R$ {(entry.qty * entry.cost).toFixed(2)}</div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default StockInflow;
