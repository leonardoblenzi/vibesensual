
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Download, 
  TrendingUp, 
  Calendar,
  Store,
  Globe,
  Trash2,
  Package
} from 'lucide-react';
import { Sale, SaleSource } from '../types';
import { SalesController } from '../controllers/SalesController';

const HistorySales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [filterSource, setFilterSource] = useState<SaleSource | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const data = await SalesController.getSales();
    setSales(data);
  };

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
    const revenue = filteredSales.reduce((acc, s) => acc + Number(s.totalPrice), 0);
    const profit = filteredSales.reduce((acc, s) => acc + Number(s.profitR), 0);
    const avgMargin = filteredSales.length > 0 ? (profit / revenue) * 100 : 0;
    
    return { revenue, profit, avgMargin, count: filteredSales.length };
  }, [filteredSales]);

  const handleDeleteSale = async (id: string) => {
    if (confirm('Deseja excluir este registro de venda?')) {
      await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      loadSales();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold vibe-text-gradient italic">Histórico de Vendas</h2>
          <p className="text-slate-400 mt-1">Dados reais persistidos no banco de dados.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-all">
          <Download size={18} /> Exportar
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Vendas Totais</p>
          <p className="text-2xl font-black text-white">{stats.count}</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Faturamento</p>
          <p className="text-2xl font-black text-white">R$ {stats.revenue.toFixed(2)}</p>
        </div>
        <div className="glass p-6 rounded-3xl border-l-4 border-l-emerald-500 border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lucro Acumulado</p>
          <p className="text-2xl font-black text-emerald-400">R$ {stats.profit.toFixed(2)}</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-slate-800">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Margem Média</p>
          <p className="text-2xl font-black text-purple-400">{stats.avgMargin.toFixed(1)}%</p>
        </div>
      </div>

      <div className="glass p-6 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Busca</label>
          <input type="text" placeholder="Produto ou Cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white outline-none" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Origem</label>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value as any)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white outline-none">
            <option value="ALL">Todas as Origens</option>
            <option value={SaleSource.CATALOG}>Catálogo</option>
            <option value={SaleSource.MARKETPLACE_ML}>Mercado Livre</option>
            <option value={SaleSource.MARKETPLACE_SHOPEE}>Shopee</option>
            <option value={SaleSource.MARKETPLACE_AMAZON}>Amazon</option>
          </select>
        </div>
        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">De:</label><input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white color-scheme-dark" /></div>
        <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase">Até:</label><input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white color-scheme-dark" /></div>
      </div>

      <div className="glass rounded-[2rem] border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-500 text-[10px] uppercase font-black">
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Produto</th>
                <th className="px-8 py-5">Origem</th>
                <th className="px-8 py-5">Valor</th>
                <th className="px-8 py-5">Lucro</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-800/30">
                  <td className="px-8 py-6 text-xs text-slate-400">{new Date(sale.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-6 font-bold text-white text-xs">{sale.productName}</td>
                  <td className="px-8 py-6 text-[10px] uppercase font-black text-slate-500">{sale.source}</td>
                  <td className="px-8 py-6 font-bold text-xs">R$ {Number(sale.totalPrice).toFixed(2)}</td>
                  <td className="px-8 py-6 font-black text-xs text-emerald-400">R$ {Number(sale.profitR).toFixed(2)}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => handleDeleteSale(sale.id)} className="p-2 text-slate-600 hover:text-rose-400"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistorySales;
