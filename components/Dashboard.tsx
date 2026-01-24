
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';

const data = [
  { name: 'Seg', vendas: 4000 },
  { name: 'Ter', vendas: 3000 },
  { name: 'Qua', vendas: 2000 },
  { name: 'Qui', vendas: 2780 },
  { name: 'Sex', vendas: 1890 },
  { name: 'Sáb', vendas: 2390 },
  { name: 'Dom', vendas: 3490 },
];

const StatCard: React.FC<{ title: string, value: string, trend: string, icon: React.ReactNode, positive?: boolean }> = ({ title, value, trend, icon, positive = true }) => (
  <div className="glass p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-purple-600/20 transition-colors">
        {icon}
      </div>
      <span className={`text-sm font-medium ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trend}
      </span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-3xl font-bold vibe-text-gradient">Visão Geral</h2>
        <p className="text-slate-400 mt-2">Bem-vindo de volta ao painel de controle Vibe Sensual.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Vendas Totais" value="R$ 12.450,00" trend="+12.5%" icon={<DollarSign className="text-emerald-400" size={24} />} />
        <StatCard title="Pedidos" value="156" trend="+5.2%" icon={<TrendingUp className="text-purple-400" size={24} />} />
        <StatCard title="Produtos Ativos" value="48" trend="0%" icon={<Package className="text-blue-400" size={24} />} />
        <StatCard title="Novos Clientes" value="24" trend="-2.1%" icon={<Users className="text-pink-400" size={24} />} positive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6 text-white">Desempenho Semanal</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold mb-6 text-white">Vendas por Canal</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Catálogo', v: 4000 },
                { name: 'M. Livre', v: 3000 },
                { name: 'Shopee', v: 2000 },
                { name: 'Amazon', v: 1500 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
                <Bar dataKey="v" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
