
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  TrendingUp, 
  ShoppingCart, 
  Settings as SettingsIcon, 
  LogOut,
  Menu,
  X,
  PackageCheck,
  Truck,
  Eye,
  History
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import ProductManagementView from './views/ProductManagement';
import CategoryManagement from './components/CategoryManagement';
import InventoryManagement from './components/InventoryManagement';
import PricingRules from './components/PricingRules';
import SalesRegistrationView from './views/SalesRegistration';
import HistorySales from './components/HistorySales';
import StockInflow from './components/StockInflow';
import Settings from './components/Settings';
import Catalog from './components/Catalog';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Login from './components/Login';

const SidebarItem: React.FC<{ to: string, icon: React.ReactNode, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'vibe-gradient text-white shadow-lg shadow-purple-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}>
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/produtos", icon: <Package size={18} />, label: "Produtos" },
    { to: "/categorias", icon: <Layers size={18} />, label: "Categorias" },
    { to: "/estoque", icon: <PackageCheck size={18} />, label: "Estoque" },
    { to: "/entradas", icon: <Truck size={18} />, label: "Novas Entradas" },
    { to: "/regras-preco", icon: <TrendingUp size={18} />, label: "Regras de Preço" },
    { to: "/vendas", icon: <ShoppingCart size={18} />, label: "Registrar Venda" },
    { to: "/historico-vendas", icon: <History size={18} />, label: "Histórico de Vendas" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-700 rounded-lg">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-slate-800 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 px-4 mb-8">
            <div className="w-10 h-10 rounded-full vibe-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/40">V</div>
            <h1 className="text-xl font-bold vibe-text-gradient italic">Vibe Sensual</h1>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            {menuItems.map((item) => (
              <SidebarItem key={item.to} {...item} active={location.pathname === item.to} />
            ))}
            <Link to="/catalogo" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 mt-4 border border-emerald-500/20">
              <Eye size={18} />
              <span className="font-medium text-sm">Ver Catálogo</span>
            </Link>
          </nav>
          <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
            <SidebarItem to="/configuracoes" icon={<SettingsIcon size={18} />} label="Configurações" active={location.pathname === "/configuracoes"} />
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm">
              <LogOut size={18} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/catalogo/produto/:id" element={<ProductDetail />} />
        <Route path="/catalogo/sacola" element={<Cart />} />
        <Route path="/catalogo/pedido" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/produtos" element={<AdminLayout><ProductManagementView /></AdminLayout>} />
        <Route path="/categorias" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
        <Route path="/estoque" element={<AdminLayout><InventoryManagement /></AdminLayout>} />
        <Route path="/entradas" element={<AdminLayout><StockInflow /></AdminLayout>} />
        <Route path="/regras-preco" element={<AdminLayout><PricingRules /></AdminLayout>} />
        <Route path="/vendas" element={<AdminLayout><SalesRegistrationView /></AdminLayout>} />
        <Route path="/historico-vendas" element={<AdminLayout><HistorySales /></AdminLayout>} />
        <Route path="/configuracoes" element={<AdminLayout><Settings /></AdminLayout>} />
      </Routes>
    </Router>
  );
};

export default App;
