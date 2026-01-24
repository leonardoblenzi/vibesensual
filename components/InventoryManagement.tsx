
import React from 'react';
import { AlertTriangle, ArrowUpRight, ArrowDownRight, PackageCheck } from 'lucide-react';

const InventoryManagement: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold vibe-text-gradient">Controle de Estoque</h2>
        <p className="text-slate-400 mt-1">Acompanhe entradas, saídas e alertas de reposição.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border-l-4 border-rose-500 shadow-xl shadow-rose-500/10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 font-medium">Itens em Alerta</h3>
            <AlertTriangle className="text-rose-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">05</p>
          <p className="text-xs text-rose-400 mt-2">Abaixo do estoque mínimo</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 font-medium">Entradas (Mês)</h3>
            <ArrowUpRight className="text-emerald-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">+124</p>
          <p className="text-xs text-emerald-400 mt-2">Novos itens registrados</p>
        </div>
        <div className="glass p-6 rounded-2xl border-l-4 border-purple-500">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-slate-400 font-medium">Valor em Estoque</h3>
            <PackageCheck className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-white">R$ 4.280</p>
          <p className="text-xs text-slate-500 mt-2">Patrimônio em mercadoria</p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-800 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Ações de Reposição</h3>
        <div className="space-y-4">
          {[
            { name: 'Óleo de Massagem', current: 2, min: 5 },
            { name: 'Bullet recarregável', current: 1, min: 3 },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div>
                <p className="text-white font-medium">{item.name}</p>
                <p className="text-sm text-slate-500">Mínimo: {item.min} | Atual: <span className="text-rose-400 font-bold">{item.current}</span></p>
              </div>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg transition-colors">
                Pedir Reposição
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
