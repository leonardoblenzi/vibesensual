import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Truck, 
  CreditCard, 
  ChevronRight, 
  Home, 
  Ticket, 
  ArrowLeft,
  MessageCircle,
  Tag,
  Check
} from 'lucide-react';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    shipping: '',
    cep: '',
    num: '',
    street: '',
    complement: '',
    reference: '',
    payment: 'Dinheiro',
    change: '',
    coupon: ''
  });

  const cartTotal = 14.90; // Using mocked total for demonstration
  const today = new Date().toLocaleString('pt-BR');

  const handleSend = () => {
    // Formatting the WhatsApp message
    const message = `*PEDIDO - VIBE SENSUAL*\n
👤 *Dados do Cliente:*
Nome: ${formData.name}
WhatsApp: ${formData.whatsapp}\n
📦 *Entrega:*
Forma: ${formData.shipping}
Endereço: ${formData.street}, ${formData.num}
CEP: ${formData.cep}\n
💳 *Pagamento:*
Forma: ${formData.payment}
Troco: ${formData.change || 'Não necessário'}\n
🛒 *Produtos:*
1 x Vibrador Ponto G Golfinho Liso (REF-40543)
Cor: Roxo
Valor: R$ 14,90\n
💰 *Total: R$ ${cartTotal.toFixed(2)}*`;

    const encoded = encodeURIComponent(message);
    // Pegando o número das variáveis de ambiente ou usando o padrão se não existir
    const whatsappNumber = (process.env.WHATSAPP_NUMBER || "5544999846262").replace(/\+/g, ''); 
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  };

  const InputField = ({ label, icon: Icon, placeholder, name, type = "text" }: any) => (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon size={14} className="text-slate-400" />} {label}
      </label>
      <input 
        type={type}
        placeholder={placeholder}
        value={(formData as any)[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        className="w-full bg-[#f1f5f9] border border-transparent focus:bg-white focus:border-slate-200 rounded-lg p-3 text-xs text-slate-700 outline-none transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans pb-20">
      {/* Small Header */}
      <header className="bg-white border-b border-slate-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div className="flex items-center gap-6">
              <Link to="/catalogo/sacola" className="p-2 bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                <ArrowLeft size={18} />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg vibe-gradient flex items-center justify-center text-white font-bold text-lg">V</div>
                <h1 className="font-black text-slate-800">Vibe <span className="text-purple-600">Sensual.</span></h1>
              </div>
           </div>
           <nav className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="text-purple-600">Minha sacola</span>
              <ChevronRight size={12} />
              <span className="text-slate-700">Pedido</span>
           </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center space-y-4 mb-12">
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pedido</h2>
           <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
              <Home size={14} /> / <span>Minha sacola</span> / <span className="text-slate-600">Pedido</span>
           </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           {/* Form Section */}
           <div className="lg:col-span-8 space-y-12">
              {/* Cliente */}
              <section className="space-y-6">
                 <h3 className="text-base font-black flex items-center gap-3 border-b border-slate-200 pb-3">
                    <User size={20} className="text-slate-400" /> Dados do cliente
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nome completo:" name="name" placeholder="Nome:" />
                    <InputField label="Whatsapp:" name="whatsapp" placeholder="Whatsapp:" />
                 </div>
              </section>

              {/* Entrega */}
              <section className="space-y-6">
                 <h3 className="text-base font-black flex items-center gap-3 border-b border-slate-200 pb-3">
                    <Truck size={20} className="text-slate-400" /> Entrega
                 </h3>
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Forma de Envio:</label>
                       <select 
                         value={formData.shipping}
                         onChange={(e) => setFormData({ ...formData, shipping: e.target.value })}
                         className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-xs text-slate-500 outline-none appearance-none"
                       >
                          <option>Selecione...</option>
                          <option>Retirada no Local</option>
                          <option>Motoboy (Entregas locais)</option>
                          <option>Correios</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <InputField label="CEP" name="cep" placeholder="CEP" />
                       <InputField label="Nº" name="num" placeholder="Nº" />
                    </div>
                    <InputField label="Rua" name="street" placeholder="Rua" />
                    <InputField label="Complemento – BLOCO E APARTAMENTO" name="complement" placeholder="Complemento" />
                    <InputField label="Ponto de referência" name="reference" placeholder="Referência" />
                 </div>
              </section>

              {/* Pagamento */}
              <section className="space-y-6">
                 <h3 className="text-base font-black flex items-center gap-3 border-b border-slate-200 pb-3">
                    <CreditCard size={20} className="text-slate-400" /> Pagamento
                 </h3>
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Forma de pagamento:</label>
                       <select 
                        value={formData.payment}
                        onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                        className="w-full bg-[#f1f5f9] border-none rounded-lg p-3 text-xs text-slate-700 outline-none appearance-none"
                       >
                          <option>Dinheiro</option>
                          <option>Cartão de Débito</option>
                          <option>Cartão de Crédito</option>
                          <option>PIX</option>
                       </select>
                    </div>
                    <InputField label="Deseja troco para:" name="change" placeholder="Deixe em branco caso não precise" />
                    
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Tag size={14} /> Cupom de desconto:
                       </label>
                       <div className="flex gap-2">
                          <input 
                            placeholder="Código do cupom"
                            className="flex-1 bg-[#f1f5f9] border border-transparent rounded-lg p-3 text-xs text-slate-700 outline-none" 
                          />
                          <button className="bg-[#2e344e] text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            <Tag size={14} /> Aplicar
                          </button>
                       </div>
                    </div>
                 </div>
              </section>

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                 <button onClick={() => navigate('/catalogo/sacola')} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-slate-50">
                    <ArrowLeft size={18} /> Alterar
                 </button>
                 <button onClick={handleSend} className="flex-[2] py-4 bg-[#2e344e] text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-transform">
                    <MessageCircle size={18} /> Enviar pedido
                 </button>
              </div>
           </div>

           {/* Receipt Section */}
           <div className="lg:col-span-4 sticky top-24">
              <div className="space-y-6">
                 <h3 className="text-base font-black flex items-center gap-3">
                    <Ticket size={20} className="text-slate-400" /> Resumo do pedido
                 </h3>
                 
                 {/* The Ticket (Classic yellow parchment style) */}
                 <div className="bg-[#fff9e6] border border-slate-200 shadow-xl rounded-sm p-8 font-mono text-[11px] text-slate-700 leading-relaxed relative overflow-hidden">
                    {/* Punch holes effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-4 -translate-y-1/2">
                       {[...Array(8)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-[#f8f9fa]" />)}
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1">
                          <p className="font-bold">VIBE SENSUAL</p>
                          <p>{process.env.WHATSAPP_NUMBER || "(44) 99984-6262"}</p>
                       </div>
                       
                       <p>---------------------------------------</p>
                       
                       <div className="space-y-1">
                          <p className="font-bold">Pedido #</p>
                          <p>{today}</p>
                       </div>

                       <p>---------------------------------------</p>
                       
                       <div className="space-y-2">
                          <p className="font-bold">PRODUTOS</p>
                          <p className="text-[10px] text-slate-400">. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</p>
                          
                          <div className="space-y-1">
                             <p className="font-bold">1 x Vibrador Ponto G Golfinho Liso – Estimulador Feminino Compacto e Potente (REF-40543)</p>
                             <p>Cor: Roxo.</p>
                             <p>Valor: R$ 14,90</p>
                          </div>
                       </div>

                       <p>---------------------------------------</p>
                       
                       <div className="flex justify-between font-bold">
                          <span>Subtotal:</span>
                          <span>R$ 14,90</span>
                       </div>

                       <p>---------------------------------------</p>
                       
                       <div className="flex justify-between font-bold text-sm">
                          <span>Total:</span>
                          <span>R$ 14,90</span>
                       </div>

                       <p>---------------------------------------</p>
                       
                       <p className="text-center text-[10px] text-slate-400 break-all">https://vibesensual.kicatalogo.com</p>
                    </div>
                 </div>

                 <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-6">O seu pedido será enviado para o nosso Whatsapp</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;