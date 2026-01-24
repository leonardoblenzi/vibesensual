
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Tag, 
  Info, 
  Edit2, 
  X, 
  Percent, 
  DollarSign, 
  Calculator, 
  Trash2, 
  Plus, 
  Store,
  ArrowRight
} from 'lucide-react';
import { SaleSource, PricingRule } from '../types';

const STORAGE_KEY = 'vibe_pricing_rules';

const DEFAULT_RULES: PricingRule[] = [
  { id: '1', name: 'M. Livre Padrão', source: SaleSource.MARKETPLACE_ML, type: 'markup', value: 18, marketplaceFee: 12, commission: 5, fixedFee: 5.50 },
  { id: '2', name: 'Shopee Black', source: SaleSource.MARKETPLACE_SHOPEE, type: 'markup', value: 20, marketplaceFee: 18, commission: 2, fixedFee: 3.00 },
  { id: '3', name: 'Amazon Prime', source: SaleSource.MARKETPLACE_AMAZON, type: 'markup', value: 15, marketplaceFee: 15, commission: 0, fixedFee: 0 },
  { id: '4', name: 'Margem Padrão Loja', source: SaleSource.CATALOG, type: 'markup', value: 100, marketplaceFee: 0, commission: 0, fixedFee: 2.00 },
];

const PricingRules: React.FC = () => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [editingRule, setEditingRule] = useState<Partial<PricingRule> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [simCost, setSimCost] = useState<number>(10);

  // Load rules on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setRules(JSON.parse(saved));
    } else {
      setRules(DEFAULT_RULES);
    }
  }, []);

  // Save rules when they change
  const saveToStorage = (newRules: PricingRule[]) => {
    setRules(newRules);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRules));
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule({ ...rule });
    setIsNew(false);
  };

  const handleAddNew = (source: SaleSource | 'ALL') => {
    setEditingRule({
      id: Date.now().toString(),
      name: '',
      source: source === 'ALL' ? SaleSource.CATALOG : source,
      type: 'markup',
      value: 0,
      marketplaceFee: 0,
      commission: 0,
      fixedFee: 0
    });
    setIsNew(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir esta regra?')) {
      saveToStorage(rules.filter(r => r.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingRule || !editingRule.name) {
      alert('Por favor, insira um nome para a regra.');
      return;
    }
    
    let newRules;
    if (isNew) {
      newRules = [...rules, editingRule as PricingRule];
    } else {
      newRules = rules.map(r => r.id === editingRule.id ? (editingRule as PricingRule) : r);
    }
    saveToStorage(newRules);
    setEditingRule(null);
  };

  // Simulation Logic
  const calculateSim = () => {
    if (!editingRule) return 0;
    const markup = editingRule.value || 0;
    const fixed = editingRule.fixedFee || 0;
    const mktFee = editingRule.marketplaceFee || 0;
    const comm = editingRule.commission || 0;

    // Basic Markup Math: (Cost + Fixed) * (1 + Markup/100)
    let price = (simCost + fixed) * (1 + markup / 100);
    
    // If it's a marketplace, add fees on top of final price
    if (editingRule.source !== SaleSource.CATALOG) {
      const totalFeesPerc = (mktFee + comm) / 100;
      price = price / (1 - totalFeesPerc);
    }
    
    return price;
  };

  const mktRules = rules.filter(r => r.source !== SaleSource.CATALOG);
  const catalogRules = rules.filter(r => r.source === SaleSource.CATALOG);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold vibe-text-gradient">Regras de Preço</h2>
          <p className="text-slate-400 mt-1">Configure as margens para seu catálogo e canais externos.</p>
        </div>
        <button 
          onClick={() => handleAddNew('ALL')}
          className="flex items-center gap-2 px-6 py-3 vibe-gradient rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Nova Regra
        </button>
      </header>

      <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl flex items-start gap-4">
        <Info className="text-purple-400 shrink-0" size={24} />
        <p className="text-sm text-purple-200">
          As regras de markup são aplicadas ao preço de custo dos produtos. No **Catálogo Próprio**, você define sua margem direta. Nos **Marketplaces**, o sistema considera taxas de venda e comissões extras.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Own Catalog Rules Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Store className="text-emerald-400" size={20} /> Catálogo Próprio (Sua Loja)
          </h3>
          <div className="glass p-6 rounded-3xl border border-slate-800 space-y-4">
            {catalogRules.length > 0 ? catalogRules.map((rule) => (
              <div key={rule.id} className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all group relative">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-black text-white">{rule.name}</h4>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Venda Direta / Site</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(rule)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(rule.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Markup (Lucro)</p>
                      <p className="text-2xl font-black text-emerald-400">{rule.value}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Taxas Fixas</p>
                      <p className="text-2xl font-black text-slate-300">R$ {rule.fixedFee?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <DollarSign size={24} className="text-emerald-500" />
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-slate-500 italic text-sm">Nenhuma regra para o catálogo.</div>
            )}
            <button 
              onClick={() => handleAddNew(SaleSource.CATALOG)}
              className="w-full py-4 border-2 border-dashed border-emerald-500/20 rounded-2xl text-emerald-500/50 font-black uppercase tracking-widest text-xs hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all"
            >
              + Adicionar Regra de Catálogo
            </button>
          </div>
        </div>

        {/* Marketplace Rules Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-purple-400" size={20} /> Marketplaces Externos
          </h3>
          <div className="glass p-6 rounded-3xl border border-slate-800 space-y-4">
            {mktRules.length > 0 ? mktRules.map((rule) => (
              <div key={rule.id} className="p-5 bg-slate-900/40 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded">{rule.source}</span>
                    <h4 className="text-sm font-bold text-slate-200">{rule.name}</h4>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(rule)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(rule.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Taxa Mkt</p>
                    <p className="text-sm font-bold text-slate-300">{rule.marketplaceFee}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Comissão</p>
                    <p className="text-sm font-bold text-slate-300">{rule.commission}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-tighter">Fixo</p>
                    <p className="text-sm font-bold text-slate-300">R${rule.fixedFee?.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-purple-400 font-black uppercase tracking-tighter">Markup</p>
                    <p className="text-sm font-black text-purple-400">{rule.value}%</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center text-slate-500 italic text-sm">Nenhuma regra de marketplace.</div>
            )}
            <button 
              onClick={() => handleAddNew(SaleSource.MARKETPLACE_ML)}
              className="w-full py-4 border-2 border-dashed border-purple-500/20 rounded-2xl text-purple-500/50 font-black uppercase tracking-widest text-xs hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5 transition-all"
            >
              + Adicionar Regra Marketplace
            </button>
          </div>
        </div>
      </div>

      {/* Edit/New Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass w-full max-w-3xl rounded-[2.5rem] border border-slate-700 p-8 space-y-8 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Calculator className="text-purple-400" /> {isNew ? 'Criar Regra de Preço' : `Configurar: ${editingRule.name}`}
              </h3>
              <button onClick={() => setEditingRule(null)} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 transition-colors"><X /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Regra</label>
                  <input 
                    type="text" 
                    value={editingRule.name}
                    onChange={e => setEditingRule({...editingRule, name: e.target.value})}
                    placeholder="Ex: Margem Promoção Verão"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Canal de Venda</label>
                  <select 
                    value={editingRule.source}
                    onChange={e => setEditingRule({...editingRule, source: e.target.value as SaleSource})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                  >
                    <option value={SaleSource.CATALOG}>Site / Catálogo Próprio</option>
                    <option value={SaleSource.MARKETPLACE_ML}>Mercado Livre</option>
                    <option value={SaleSource.MARKETPLACE_SHOPEE}>Shopee</option>
                    <option value={SaleSource.MARKETPLACE_AMAZON}>Amazon</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Markup / Margem (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="number" 
                        value={editingRule.value}
                        onChange={e => setEditingRule({...editingRule, value: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taxa Fixa (R$)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="number" 
                        step="0.01"
                        value={editingRule.fixedFee}
                        onChange={e => setEditingRule({...editingRule, fixedFee: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none font-bold" 
                      />
                    </div>
                  </div>
                </div>

                {editingRule.source !== SaleSource.CATALOG && (
                  <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Taxa Canal (%)</label>
                      <input 
                        type="number" 
                        value={editingRule.marketplaceFee}
                        onChange={e => setEditingRule({...editingRule, marketplaceFee: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-rose-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Comissão Extra (%)</label>
                      <input 
                        type="number" 
                        value={editingRule.commission}
                        onChange={e => setEditingRule({...editingRule, commission: parseFloat(e.target.value) || 0})}
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-rose-500 outline-none" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Simulator Section */}
              <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 space-y-6">
                <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest">
                  <Calculator size={18} className="text-purple-400" /> Simulador de Preço
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase">Custo do Produto (R$)</label>
                    <input 
                      type="number" 
                      value={simCost}
                      onChange={e => setSimCost(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-slate-400">Custo Base</span>
                       <span className="text-white">R$ {simCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-slate-400">Taxas Fixas</span>
                       <span className="text-slate-300">+ R$ {(editingRule.fixedFee || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-emerald-400">Lucro Desejado ({editingRule.value}%)</span>
                       <span className="text-emerald-400">+ R$ {((simCost + (editingRule.fixedFee || 0)) * ((editingRule.value || 0) / 100)).toFixed(2)}</span>
                    </div>
                    {editingRule.source !== SaleSource.CATALOG && (
                       <div className="flex justify-between text-xs font-bold text-rose-400">
                          <span>Taxas Canal ({ (editingRule.marketplaceFee || 0) + (editingRule.commission || 0) }%)</span>
                          <span>+ R$ {(calculateSim() - ((simCost + (editingRule.fixedFee || 0)) * (1 + (editingRule.value || 0) / 100))).toFixed(2)}</span>
                       </div>
                    )}
                  </div>

                  <div className="pt-6 mt-6 border-t-2 border-dashed border-slate-800 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Preço Final de Venda</p>
                    <p className="text-4xl font-black vibe-text-gradient">R$ {calculateSim().toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setEditingRule(null)} className="flex-1 py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all">Cancelar</button>
               <button onClick={handleSave} className="flex-[2] py-4 vibe-gradient text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all">
                  Salvar Regra de Preço
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingRules;
