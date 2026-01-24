
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowLeft, 
  ChevronRight,
  Home,
  MessageCircle,
  Instagram
} from 'lucide-react';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  // Simulated cart data based on provided screenshots
  const [items, setItems] = useState([
    {
      id: '1',
      name: 'Vibrador Ponto G Golfinho Liso – Estimulador Feminino Compacto e Potente',
      price: 14.90,
      quantity: 1,
      image: 'https://images.tcdn.com.br/img/img_prod/1126939/vibrador_ponto_g_golfinho_liso_estimulador_feminino_1249_1_20201015152845.jpg',
      variation: 'Roxo'
    }
  ]);

  const updateQty = (id: string, delta: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Header (Matching storefront style but simplified) */}
      <header className="bg-white border-b border-slate-100 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full vibe-gradient flex items-center justify-center text-white font-bold text-2xl">V</div>
             <h1 className="text-2xl font-black text-[#1e293b]">Vibe Sensual.</h1>
          </div>
          <div className="flex-1 max-w-xl w-full relative">
            <input 
              type="text" 
              placeholder="Digite sua busca..."
              className="w-full bg-[#f1f5f9] border-none rounded-md py-3 pl-4 pr-12 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minha sacola</p>
              <p className="text-sm font-bold text-slate-800">R$ {subtotal.toFixed(2)}</p>
            </div>
            <div className="relative p-2 bg-slate-900 rounded-lg text-white">
              <ShoppingBag size={24} />
              <span className="absolute -top-2 -right-2 bg-purple-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">{items.length}</span>
            </div>
          </div>
        </div>
        
        {/* Sub-nav */}
        <div className="max-w-7xl mx-auto mt-6 flex justify-between items-center px-4">
           <nav className="flex items-center gap-6 text-sm font-bold text-slate-700">
              <Link to="/catalogo" className="px-4 py-2 bg-slate-100 rounded-md">Início</Link>
              <span className="hover:text-purple-600 cursor-pointer">Categorias</span>
              <span className="hover:text-purple-600 cursor-pointer">Ofertas</span>
              <span className="hover:text-purple-600 cursor-pointer">Fale conosco</span>
           </nav>
           <div className="flex gap-4 text-slate-400">
              <MessageCircle size={20} className="hover:text-[#25d366] cursor-pointer" />
              <Instagram size={20} className="hover:text-[#e1306c] cursor-pointer" />
           </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-4 mb-12">
           <h2 className="text-3xl font-black text-slate-800">Fechar Pedido</h2>
           <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
              <Home size={14} /> / <span className="text-slate-600">Minha sacola</span>
           </nav>
        </div>

        {/* Table Head */}
        <div className="hidden md:grid grid-cols-12 gap-4 border-b border-slate-100 pb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-6">
           <div className="col-span-5">Nome</div>
           <div className="col-span-2 text-center">Qntd</div>
           <div className="col-span-2 text-center">Valor</div>
           <div className="col-span-2 text-center">Detalhes</div>
           <div className="col-span-1"></div>
        </div>

        {/* Cart Items */}
        <div className="divide-y divide-slate-100 border-b border-slate-100">
           {items.length > 0 ? items.map((item) => (
             <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8 px-6 group">
                <div className="col-span-12 md:col-span-5 flex items-center gap-6">
                   <div className="w-24 h-24 bg-white border border-slate-100 rounded-2xl overflow-hidden p-2">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                   </div>
                   <h3 className="text-sm font-bold text-slate-700 max-w-xs">{item.name}</h3>
                </div>

                <div className="col-span-6 md:col-span-2 flex justify-center">
                   <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-1.5">
                      <button onClick={() => updateQty(item.id, -1)} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-colors"><Minus size={16} /></button>
                      <span className="font-bold text-slate-700 w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-2 hover:bg-white rounded-lg text-slate-400 transition-colors"><Plus size={16} /></button>
                   </div>
                </div>

                <div className="col-span-6 md:col-span-2 text-center">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor:</p>
                   <p className="text-sm font-black text-slate-800">R$ {item.price.toFixed(2)}</p>
                </div>

                <div className="col-span-12 md:col-span-2 text-center">
                   <div className="inline-block bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-[11px] text-slate-500 font-bold">
                      <span className="text-slate-900">Cor:</span> {item.variation}.
                   </div>
                </div>

                <div className="col-span-12 md:col-span-1 text-right md:text-center">
                   <button onClick={() => removeItem(item.id)} className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} /> <span className="md:hidden">Excluir</span>
                   </button>
                </div>
             </div>
           )) : (
             <div className="py-20 text-center space-y-4">
                <ShoppingBag size={48} className="mx-auto text-slate-200" />
                <p className="text-slate-500 font-bold">Sua sacola está vazia.</p>
                <Link to="/catalogo" className="inline-block px-8 py-3 vibe-gradient text-white rounded-full font-bold">Voltar às compras</Link>
             </div>
           )}
        </div>

        {/* Footer actions */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-2xl font-black text-slate-800">
             Subtotal: <span className="vibe-text-gradient">R$ {subtotal.toFixed(2)}</span>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link to="/catalogo" className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-600 font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                 <ShoppingBag size={18} /> Continuar comprando
              </Link>
              <button 
                onClick={() => navigate('/catalogo/pedido')}
                disabled={items.length === 0}
                className="px-10 py-4 bg-[#2e344e] hover:bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
              >
                 <ShoppingBag size={18} /> Fechar compra
              </button>
           </div>
        </div>
      </main>

      <footer className="mt-24 bg-[#1e293b] text-white py-12">
         <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
            <div className="flex gap-6">
               <Instagram className="hover:text-purple-400 cursor-pointer" />
               <MessageCircle className="hover:text-[#25d366] cursor-pointer" />
            </div>
            <div className="flex gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
               <span>Termos e condições</span>
               <span>Política de privacidade</span>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Criado com ♥ por Vibe Sensual</p>
         </div>
      </footer>
    </div>
  );
};

export default Cart;
