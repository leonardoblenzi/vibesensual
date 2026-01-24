
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ShoppingBag, 
  ChevronDown, 
  Instagram, 
  MessageCircle, 
  ArrowRight, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle,
  Heart,
  Menu
} from 'lucide-react';

const Catalog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    {
      name: 'Vibradores de Luxo',
      products: [
        { id: '1', name: 'Vibrador Ponto G Golfinho Liso – Estimulador Feminino', price: 19.90, promoPrice: 14.90, images: ['https://images.tcdn.com.br/img/img_prod/1126939/vibrador_ponto_g_golfinho_liso_estimulador_feminino_1249_1_20201015152845.jpg'] },
        { id: '6', name: 'Mini Vibrador Varinha Mágica 2 Vibrações', price: 59.90, promoPrice: 49.90, images: ['https://images.tcdn.com.br/img/img_prod/1126939/mini_vibrador_varinha_magica_2_vibracoes_1251_1_20201015152847.jpg'] },
        { id: '7', name: 'Vibrador Cápsula Bullet Multivelocidades', price: 19.90, promoPrice: 14.90, images: ['https://images.tcdn.com.br/img/img_prod/1126939/vibrador_capsula_bullet_multivelocidades_1253_1_20201015152849.jpg'] },
      ]
    },
    {
      name: 'Cosméticos Eróticos',
      products: [
        { id: '2', name: 'Gel Funcional Hot Ice e Vibra Xana Loka 15g Hot Flowers', price: 26.90, promoPrice: 21.90, images: ['https://images.tcdn.com.br/img/img_prod/1126939/gel_funcional_hot_ice_e_vibra_xana_loka_15g_hot_flowers_1241_1_472b528c3080709b02a2080353c7c8c3.jpg'] },
        { id: '3', name: 'Gel Funcional Anal Kuloko 15g Hot Flowers', price: 26.90, promoPrice: 21.90, images: ['https://images.tcdn.com.br/img/img_prod/1126939/gel_funcional_anal_kuloko_15g_hot_flowers_1243_1_182b8e390c50a049e7b415a953d10036.jpg'] },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-purple-500/30">
      <div className="vibe-gradient text-white py-1 px-4 text-[10px] md:text-xs font-bold flex justify-center items-center gap-6 overflow-hidden">
        <span className="flex items-center gap-1 shrink-0"><ShieldCheck size={14} /> ENTREGA DISCRETA EM TODO BRASIL</span>
        <span className="hidden md:flex items-center gap-1 shrink-0"><CheckCircle size={14} /> PAGAMENTO SEGURO</span>
        <span className="flex items-center gap-1 shrink-0"><Heart size={14} /> SUA SATISFAÇÃO É NOSSO PRAZER</span>
      </div>

      <header className="sticky top-0 z-50 glass border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link to="/catalogo" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl vibe-gradient flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-purple-500/40 group-hover:scale-110 transition-transform">V</div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tighter leading-none">VIBE</h1>
                <h1 className="text-xl font-light tracking-[0.2em] text-purple-400 leading-none">SENSUAL</h1>
              </div>
            </Link>
          </div>

          <div className="flex-1 max-w-md relative hidden md:block">
            <input 
              type="text" 
              placeholder="Encontre seu próximo prazer..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-2.5 pl-4 pr-12 focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm backdrop-blur-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          </div>

          <div className="flex items-center gap-4">
             <Link to="/login" className="p-2.5 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white">
                <UserIcon size={22} />
             </Link>
             <button onClick={() => window.location.hash = '/catalogo/sacola'} className="relative p-2.5 bg-purple-600/10 hover:bg-purple-600/20 rounded-2xl text-purple-400 transition-all group">
                <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 bg-white text-purple-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-lg">0</span>
             </button>
             <button className="lg:hidden p-2.5 hover:bg-white/5 rounded-2xl transition-colors"><Menu size={22} /></button>
          </div>
        </div>
      </header>

      <section className="relative h-[40vh] md:h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 w-full">
           <div className="max-w-2xl space-y-6">
              <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-[0.2em] rounded-full border border-purple-500/30">Lançamentos de Luxo</span>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight italic">
                Sinta cada <br />
                <span className="vibe-text-gradient">momento.</span>
              </h2>
              <button className="vibe-gradient px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform flex items-center gap-2">
                Explorar <ArrowRight size={18} />
              </button>
           </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12 space-y-24">
        {categories.map((category) => (
          <section key={category.name} className="space-y-10">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black tracking-tight">{category.name}</h2>
              <button className="text-sm font-bold text-purple-400 hover:text-white flex items-center gap-2 transition-all group">
                Ver Coleção <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {category.products.map((product) => {
                const hasPromo = product.promoPrice && product.promoPrice < product.price;
                const displayPrice = hasPromo ? product.promoPrice : product.price;

                return (
                  <Link to={`/catalogo/produto/${product.id}`} key={product.id} className="group flex flex-col h-full bg-slate-900/20 rounded-[2.5rem] border border-white/5 hover:border-purple-500/50 transition-all duration-500 overflow-hidden hover:shadow-[0_20px_50px_-12px_rgba(109,40,217,0.3)]">
                    <div className="relative aspect-[4/5] bg-white transition-all duration-500">
                      <img 
                        src={product.images[0] || 'https://via.placeholder.com/300'} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700" 
                      />
                      {hasPromo && (
                        <div className="absolute top-6 right-6">
                          <div className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg">OFERTA</div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90"></div>
                      <div className="absolute inset-x-0 bottom-0 p-6 space-y-2">
                         <h3 className="text-white text-sm md:text-base font-black leading-tight line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
                         <div className="flex items-center gap-3">
                           {hasPromo && <span className="text-xs text-rose-500 line-through font-bold">R$ {product.price.toFixed(2)}</span>}
                           <span className="text-xl font-black text-white">R$ {displayPrice!.toFixed(2)}</span>
                         </div>
                      </div>
                    </div>
                    <div className="p-6 bg-[#0f172a]/50 backdrop-blur-xl border-t border-white/5">
                      <button className="w-full bg-white hover:bg-purple-500 hover:text-white text-black font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
                        <ShoppingBag size={16} /> Ver Detalhes
                      </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="bg-slate-950 border-t border-white/5 mt-20 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
          <div className="space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl vibe-gradient flex items-center justify-center text-white font-bold text-xl">V</div>
              <h3 className="font-black text-xl tracking-tighter uppercase">Vibe Sensual</h3>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Sua boutique de prazer e sofisticação.</p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Social</h4>
            <div className="flex justify-center md:justify-start gap-4 text-slate-400">
               <Instagram className="hover:text-white cursor-pointer" />
               <MessageCircle className="hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="text-center">
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">© 2024 Vibe Sensual Store.</p>
        </div>
      </footer>
    </div>
  );
};

export default Catalog;
