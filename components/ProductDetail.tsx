
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  MessageCircle, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle,
  ArrowLeft,
  Share2,
  Minus,
  Plus,
  Package,
  Instagram,
  Heart
} from 'lucide-react';
import { Product } from '../types';

// Simulando dados de produtos (em um app real viria de um estado global ou API)
const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Vibrador Ponto G Golfinho Liso – Estimulador Feminino Compacto e Potente', 
    description: 'Descubra novas formas de prazer e autoconhecimento com o Vibrador Ponto G Golfinho Liso. Seu design anatômico e discreto foi criado para estimular o Ponto G e o clitóris, proporcionando sensações intensas e orgasmos marcantes. Com vibração potente e tamanho compacto, é ideal para uso individual ou a dois, tornando qualquer momento mais excitante. Fabricado em TPE e ABS, materiais seguros e fáceis de higienizar.',
    categoryId: 'cat2', 
    price: 19.90, 
    promoPrice: 14.90, 
    costPrice: 5.00, 
    stock: 21, 
    minStock: 5, 
    sku: '#REF-40543', 
    images: ['https://images.tcdn.com.br/img/img_prod/1126939/vibrador_ponto_g_golfinho_liso_estimulador_feminino_1249_1_20201015152845.jpg'],
    variations: [
      {
        id: 'v1',
        name: 'Cor',
        options: [
          { id: 'o1', name: 'Rosa Claro', priceDelta: 0, stock: 0, isAvailable: false },
          { id: 'o2', name: 'Pink', priceDelta: 0, stock: 11, isAvailable: true },
          { id: 'o3', name: 'Roxo', priceDelta: 0, stock: 5, isAvailable: true },
          { id: 'o4', name: 'Preto', priceDelta: 0, stock: 5, isAvailable: true },
        ]
      }
    ]
  },
  { 
    id: '5', 
    name: 'Vibrador Cápsula Bullet Multivelocidades', 
    description: 'Compacto, potente e silencioso.',
    categoryId: 'cat2', 
    price: 19.90, 
    promoPrice: 14.90, 
    costPrice: 5.00, 
    stock: 10, 
    minStock: 2, 
    sku: '#REF-1253', 
    images: ['https://images.tcdn.com.br/img/img_prod/1126939/vibrador_capsula_bullet_multivelocidades_1253_1_20201015152849.jpg'],
    variations: []
  },
  { 
    id: '6', 
    name: 'Mini Vibrador Varinha Mágica 2 Vibrações', 
    description: 'A clássica varinha mágica agora em versão portátil.',
    categoryId: 'cat2', 
    price: 59.90, 
    promoPrice: 49.90, 
    costPrice: 15.00, 
    stock: 5, 
    minStock: 1, 
    sku: '#REF-1251', 
    images: ['https://images.tcdn.com.br/img/img_prod/1126939/mini_vibrador_varinha_magica_2_vibracoes_1251_1_20201015152847.jpg'],
    variations: []
  },
];

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [observations, setObservations] = useState('');

  const handleOptionSelect = (groupId: string, optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [groupId]: optionId }));
  };

  const getSelectedPriceDelta = () => {
    let delta = 0;
    product.variations.forEach(v => {
      const selectedOptId = selectedOptions[v.id];
      const opt = v.options.find(o => o.id === selectedOptId);
      if (opt) delta += opt.priceDelta;
    });
    return delta;
  };

  const basePrice = product.promoPrice || product.price;
  const totalPrice = (basePrice + getSelectedPriceDelta()) * quantity;

  const handleAddToCart = () => {
    // In a real app we'd save to global state or local storage
    navigate('/catalogo/sacola');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans pb-20">
      {/* Header (Simplified for Detail) */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 py-4 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/catalogo" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> <span className="text-sm font-bold uppercase tracking-widest hidden sm:inline">Voltar ao Catálogo</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl vibe-gradient flex items-center justify-center text-white font-bold text-xl">V</div>
            <h1 className="text-sm font-black tracking-tighter leading-none hidden sm:block">VIBE <span className="font-light text-purple-400">SENSUAL</span></h1>
          </div>
          <button onClick={() => navigate('/catalogo/sacola')} className="relative p-2.5 bg-purple-600/10 rounded-2xl text-purple-400">
            <ShoppingBag size={22} />
            <span className="absolute -top-1 -right-1 bg-white text-purple-600 text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black">0</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 uppercase tracking-widest mb-8 overflow-hidden whitespace-nowrap">
          <Link to="/catalogo" className="hover:text-purple-400">Início</Link>
          <ChevronRight size={12} />
          <span>Categorias</span>
          <ChevronRight size={12} />
          <span>Vibrador</span>
          <ChevronRight size={12} />
          <span className="text-slate-300 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-white/5 flex items-center justify-center p-8 group relative">
              <img src={product.images[activeImg] || ''} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={product.name} />
              {product.promoPrice && (
                <div className="absolute top-8 left-8 bg-rose-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl">OFERTA</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`aspect-square rounded-xl bg-white p-2 border-2 transition-all ${activeImg === i ? 'border-purple-500' : 'border-transparent opacity-50 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">{product.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-[0.2em]">
                <span className="text-slate-500">REF: <span className="text-slate-200">{product.sku}</span></span>
                <button className="flex items-center gap-1 text-[#25d366] hover:brightness-110 transition-all bg-[#25d366]/10 px-3 py-1.5 rounded-full border border-[#25d366]/20">
                  <Share2 size={14} /> Compartilhar no WhatsApp
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-slate-400 text-sm leading-relaxed space-y-4">
                 <p className="font-bold text-white uppercase tracking-widest text-xs">Detalhes:</p>
                 <p>{product.description}</p>
              </div>
              
              <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5 space-y-6">
                <div className="flex flex-col">
                  {product.promoPrice && (
                    <p className="text-xs text-rose-500 line-through font-bold">De: R$ {product.price.toFixed(2)} por</p>
                  )}
                  <p className="text-4xl font-black text-white">R$ {basePrice.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-bold">
                    <CheckCircle size={14} className="text-emerald-500" /> {product.stock} unidades em estoque
                  </p>
                </div>

                {/* Variations */}
                {product.variations.map((group) => (
                  <div key={group.id} className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">{group.name}</span>
                       <span className="text-slate-500">Mínimo: 1 e Máximo: 1</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {group.options.map((opt) => (
                        <button 
                          key={opt.id} 
                          disabled={!opt.isAvailable}
                          onClick={() => handleOptionSelect(group.id, opt.id)}
                          className={`flex flex-col items-start p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                            selectedOptions[group.id] === opt.id 
                            ? 'bg-purple-600/10 border-purple-500 text-white' 
                            : !opt.isAvailable 
                              ? 'bg-slate-900/20 border-white/5 text-slate-600 cursor-not-allowed opacity-50' 
                              : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xs font-bold">{opt.name} (+ R$ {opt.priceDelta.toFixed(2)})</span>
                          <span className="text-[10px] opacity-70">{opt.isAvailable ? `Estoque: ${opt.stock}` : 'Indisponível'}</span>
                          {selectedOptions[group.id] === opt.id && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>}
                        </button>
                      ))}
                    </div>
                    {group.options.length > 0 && !selectedOptions[group.id] && (
                      <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest animate-pulse">Você deve escolher ao menos 1</p>
                    )}
                  </div>
                ))}

                {/* Quantity */}
                <div className="space-y-3">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quantidade:</p>
                   <div className="flex items-center gap-4 bg-slate-900 border border-white/5 w-fit rounded-2xl p-2">
                      <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><Minus size={18} /></button>
                      <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                      <button onClick={() => setQuantity(q => q + 1)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400"><Plus size={18} /></button>
                   </div>
                </div>

                {/* Observations */}
                <div className="space-y-3">
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Observações:</p>
                   <textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Algo que deseja informar sobre o pedido?" className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs text-white outline-none focus:border-purple-500/50 min-h-[100px] resize-none"></textarea>
                </div>

                {/* Total & Action */}
                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="text-center sm:text-left">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Total do Pedido</p>
                      <p className="text-3xl font-black vibe-text-gradient">R$ {totalPrice.toFixed(2)}</p>
                   </div>
                   <button onClick={handleAddToCart} className="w-full sm:w-auto px-10 py-5 vibe-gradient rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform flex items-center justify-center gap-3 active:scale-95">
                      <ShoppingBag size={20} /> Adicionar a Sacola
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Veja Também */}
        <section className="mt-32 space-y-12">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-2xl font-black uppercase tracking-tight">Veja também</h2>
              <button className="text-xs font-bold text-slate-500 flex items-center gap-2 hover:text-purple-400 transition-colors uppercase tracking-[0.2em]">Ver tudo <ChevronRight size={14} /></button>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {MOCK_PRODUCTS.filter(p => p.id !== id).map(p => (
                <Link to={`/catalogo/produto/${p.id}`} key={p.id} className="group flex flex-col bg-slate-900/20 rounded-[2rem] border border-white/5 hover:border-purple-500/50 transition-all overflow-hidden p-4 text-center">
                  <div className="aspect-square bg-white rounded-2xl mb-4 p-4">
                     <img src={p.images[0]} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                  </div>
                  <h3 className="text-[11px] font-black line-clamp-2 min-h-[2.5rem] mb-2">{p.name}</h3>
                  <div className="mt-auto">
                    <p className="text-xs font-black text-purple-400">R$ {(p.promoPrice || p.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
           </div>
        </section>
      </main>

      {/* Footer Minimal */}
      <footer className="mt-20 py-12 text-center space-y-6">
         <div className="flex justify-center gap-4 text-slate-500">
            <MessageCircle size={24} className="hover:text-[#25d366] cursor-pointer" />
            <Instagram size={24} className="hover:text-[#e1306c] cursor-pointer" />
         </div>
         <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <button className="hover:text-purple-400">Termos e Condições</button>
            <button className="hover:text-purple-400">Política de Privacidade</button>
         </div>
         <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            CRIADO COM <Heart size={12} className="text-rose-500 fill-rose-500" /> POR VIBE SENSUAL
         </p>
      </footer>
    </div>
  );
};

export default ProductDetail;
