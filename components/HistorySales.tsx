
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  ChevronDown, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Store,
  Globe,
  Trash2,
  Package
} from 'lucide-react';
import { Sale, SaleSource } from '../types';

const HistorySales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterSource, setFilterSource] = useState<SaleSource | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedSales = localStorage.getItem('vibe_sales');
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    }
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchSource = filterSource === 'ALL' || sale.source === filterSource;
      const matchSearch = sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchDate = (!dateStart || sale.date >= dateStart) && (!dateEnd || sale.date <= dateEnd);
      return matchSource && matchSearch && matchDate;
    });
  }, [sales, filterSource, searchTerm, dateStart, dateEnd]);

  const stats = useMemo(() => {
    const revenue = filteredSales.reduce((acc, s) => acc + s.totalPrice, 0);
    const profit = filteredSales.reduce((acc, s) => acc + s.profitR, 0);
    const avgMargin = filteredSales.length > 0 ? (profit / revenue) * 100 : 0;
    
    return { revenue, profit, avgMargin, count: filteredSales.length };
  }, [filteredSales]);

  const handleDeleteSale = (id: string) => {
    if (confirm('Deseja excluir este registro de venda permanentemente?')) {
      const newSales = sales.filter(s => s.id !== id);
      setSales(newSales);
      localStorage.setItem('vibe_sales', JSON.stringify(newSales));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold vibe-text-gradient italic">Histórico de Vendas</h2>
          <p className="text-slate-400 mt-1">Monitore sua lucratividade em tempo real.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-all">
            <Download size={18} /> Exportar
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vendas Totais</p>
          <p className="text-2xl font-black text-white">{stats.count}</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Faturamento</p>
          <p className="text-2xl font-black text-white">R$ {stats.revenue.toFixed(2)}</p>
        </div>
        <div className="glass p-6 rounded-3xl border-l-4 border-l-emerald-500 border-slate-800 shadow-xl shadow-emerald-500/10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lucro Acumulado</p>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            <p className="text-2xl font-black text-emerald-400">R$ {stats.profit.toFixed(2)}</p>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Margem Média</p>
          <p className="text-2xl font-black text-purple-400">{stats.avgMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass p-6 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Busca</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
            <input 
              type="text" 
              placeholder="Produto ou Cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Origem</label>
          <select 
            value={filterSource}
            onChange={e => setFilterSource(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">Todas as Origens</option>
            <option value={SaleSource.CATALOG}>Catálogo</option>
            <option value={SaleSource.MARKETPLACE_ML}>Mercado Livre</option>
            <option value={SaleSource.MARKETPLACE_SHOPEE}>Shopee</option>
            <option value={SaleSource.MARKETPLACE_AMAZON}>Amazon</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">De:</label>
          <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white outline-none color-scheme-dark" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Até:</label>
          <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white outline-none color-scheme-dark" />
        </div>
      </div>

      {/* Sales List */}
      <div className="glass rounded-[2rem] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-5">Venda / Data</th>
                <th className="px-8 py-5">Produto</th>
                <th className="px-8 py-5">Origem</th>
                <th className="px-8 py-5">Valor</th>
                <th className="px-8 py-5">Lucro (R$)</th>
                <th className="px-8 py-5">Margem (%)</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSales.length > 0 ? filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-white mb-0.5">#{sale.id.slice(-5)}</div>
                    <div className="text-[10px] text-slate-500">{new Date(sale.date).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-purple-400 transition-colors">
                        <Package size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{sale.productName}</div>
                        <div className="text-[10px] text-slate-500">{sale.quantity} unidade(s)</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {sale.source === SaleSource.CATALOG ? <Store size={14} className="text-emerald-400" /> : <Globe size={14} className="text-purple-400" />}
                      <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{sale.source}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-xs text-white">R$ {sale.totalPrice.toFixed(2)}</td>
                  <td className={`px-8 py-6 font-black text-xs ${sale.profitR < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {sale.profitR < 0 ? '-' : '+'} R$ {Math.abs(sale.profitR).toFixed(2)}
                  </td>
                  <td className="px-8 py-6">
                    <div className={`px-2 py-1 rounded-full text-[9px] font-black w-fit border ${sale.profitP < 15 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                      {sale.profitP.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => handleDeleteSale(sale.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-600 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto space-y-4 opacity-30">
                      <Calendar size={48} className="mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Nenhuma venda encontrada para os filtros selecionados.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorySales;
