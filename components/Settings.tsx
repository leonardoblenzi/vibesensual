
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  ChevronRight, 
  Save, 
  Globe, 
  CreditCard, 
  Truck, 
  MessageSquare, 
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [success, setSuccess] = useState(false);

  const tabs = [
    { id: 1, label: '1. Geral', icon: <Globe size={16} /> },
    { id: 3, label: '3. Pagamento', icon: <CreditCard size={16} /> },
    { id: 4, label: '4. Entrega', icon: <Truck size={16} /> },
    { id: 5, label: '5. Contato', icon: <MessageSquare size={16} /> },
    { id: 6, label: '6. Usuário', icon: <UserIcon size={16} /> },
  ];

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const InputField = ({ label, placeholder, type = "text", info }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
      />
      {info && <p className="text-[10px] text-slate-500 italic">{info}</p>}
    </div>
  );

  const SelectField = ({ label, options }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none">
        {options.map((opt: string) => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const RadioGroup = ({ label, info }: any) => (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
      <div className="space-y-1">
        <label className="text-sm font-bold text-slate-200 flex items-center gap-1">
          {label} {info && <span className="text-slate-500 cursor-help" title={info}>(?)</span>}
        </label>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="radio" name={label} className="w-4 h-4 accent-purple-500" defaultChecked />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Sim</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input type="radio" name={label} className="w-4 h-4 accent-purple-500" />
          <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Não</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800 rounded-xl text-purple-400">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold vibe-text-gradient">Configurações</h2>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Globe size={12} /> / Configurações
            </div>
          </div>
        </div>
      </header>

      {success && (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
          <Save size={20} />
          <span className="font-bold">Configurações salvas com sucesso!</span>
        </div>
      )}

      <div className="glass rounded-3xl border border-slate-800 overflow-hidden">
        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-900/30 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-6 py-4 text-sm font-bold transition-all border-b-2 flex items-center justify-center gap-2 ${
                activeTab === tab.id 
                ? 'border-purple-500 text-purple-400 bg-purple-500/5' 
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
                <Globe size={20} className="text-purple-400" /> Dados gerais
              </div>
              <div className="grid grid-cols-1 gap-6">
                <InputField label="Nome:" placeholder="Vibe Sensual" />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição:</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
                    placeholder="Oferecemos vibradores, lingeries, cosméticos íntimos e muito mais..."
                  ></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SelectField label="Segmento:" options={['SexyShop', 'Beleza', 'Moda']} />
                  <SelectField label="Estado:" options={['Paraná', 'São Paulo', 'Santa Catarina']} />
                  <SelectField label="Cidade:" options={['Arapongas', 'Londrina', 'Curitiba']} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">URL:</label>
                  <p className="text-[10px] text-slate-500 font-medium">A URL que seus clientes usarão para acessar o estabelecimento. Não são permitidos acentos, cedilha, pontos e caracteres especiais.</p>
                  <div className="flex items-center gap-2">
                    <input className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-3 text-white outline-none" placeholder="vibesensual" />
                    <span className="text-slate-500 font-bold">.kicatalogo.com</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
                <CreditCard size={20} className="text-purple-400" /> Pagamento
              </div>
              <div className="grid grid-cols-1 gap-4">
                <InputField label="Qual valor de pedido mínimo?:" placeholder="10,00" />
                <RadioGroup label="O estabelecimento aceita dinheiro?" />
                <RadioGroup label="O estabelecimento aceita cartão de débito?" />
                <InputField label="Quais bandeiras de cartão de débito aceitas?:" placeholder="Visa, Mastercard e Elo" />
                <RadioGroup label="O estabelecimento aceita cartão de crédito?" />
                <InputField label="Quais bandeiras de cartão de crédito aceitas?:" placeholder="Visa, Mastercard e Elo" />
                <RadioGroup label="Desativar formas de pagamento?" />
                <RadioGroup label="O estabelecimento aceita pagamento Pix?" />
                
                <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Configuração de Pix</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField label="Tipo de Chave:" options={['CNPJ', 'CPF', 'E-mail', 'Celular', 'Chave Aleatória']} />
                    <InputField label="Chave PIX:" placeholder="63388012000155" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
                <Truck size={20} className="text-purple-400" /> Entrega
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="CEP" placeholder="86708-543" />
                <InputField label="Nº" placeholder="247" />
                <InputField label="Bairro" placeholder="Jardim Imperial" />
                <InputField label="Rua" placeholder="Rua Aracuã-pequeno" />
                <InputField label="Complemento" placeholder="Ex: Apto 101" />
                <InputField label="Ponto de referência" placeholder="Próximo ao mercado" />
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Horário de funcionamento:</label>
                  <textarea className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none" placeholder="Seg-Sex: 08:00 as 18:00"></textarea>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RadioGroup label="O estabelecimento recebe pedidos?" info="Ativa/desativa carrinho" />
                <RadioGroup label="Desativar campos de entrega?" />
                <RadioGroup label="Desativar endereço da loja?" />
                <RadioGroup label="Modo entrar em contato?" />
                <RadioGroup label="O estabelecimento permite retirada no local?" />
                <RadioGroup label="Calcular frete com Correios?" />
              </div>
            </div>
          )}

          {activeTab === 5 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
                <MessageSquare size={20} className="text-purple-400" /> Contato
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Whatsapp" placeholder="(44) 99984-6262" info="Será o número no qual você receberá os pedidos" />
                <InputField label="E-mail de contato" placeholder="vibesensual.store@gmail.com" />
                <InputField label="Instagram" placeholder="https://instagram.com/vibesensual..." />
                <InputField label="Youtube" placeholder="Seu Canal do Youtube" />
                <InputField label="Facebook" placeholder="Facebook" />
                <InputField label="Link do Google Maps" placeholder="Link do botão como chegar" />
              </div>
              
              <div className="pt-6 border-t border-slate-800">
                <h3 className="text-white font-bold flex items-center gap-2 mb-6">
                  <Globe size={18} className="text-purple-400" /> Estatísticas & Apps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="ID Google Analytics" placeholder="UA-XXXXXXXXX" />
                  <InputField label="ID Facebook Pixel" placeholder="XXXXXXXXXXXX" />
                  <InputField label="ID Sacolinha Instagram" placeholder="ID Catálogo do Meta" />
                  <InputField label="ID Microsoft Clarity" placeholder="ID Clarity" />
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">CSS Adicional:</label>
                    <textarea className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white font-mono text-xs focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 6 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <h3 className="text-white font-bold flex items-center gap-2 border-b border-slate-800 pb-2">
                  <UserIcon size={20} className="text-purple-400" /> Responsável
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InputField label="Nome completo:" placeholder="Leonardo Batista Lenzi" />
                  </div>
                  <InputField label="Data de nascimento:" placeholder="21/05/2000" />
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Tipo de documento:" options={['CPF', 'CNPJ', 'RG']} />
                    <InputField label="Nº do documento:" placeholder="06861819999" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-800">
                <h3 className="text-white font-bold flex items-center gap-2">
                   Login
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <InputField label="E-mail" placeholder="vibesensual.store@gmail.com" type="email" />
                  </div>
                  <InputField label="Senha" placeholder="••••••" type="password" />
                  <InputField label="Redigite" placeholder="••••••" type="password" />
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-800">
            <button 
              disabled={activeTab === 1}
              onClick={() => setActiveTab(prev => (prev === 3 ? 1 : prev - 1))}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white font-bold flex items-center gap-2 transition-all"
            >
              <ChevronLeft size={20} /> Anterior
            </button>
            <div className="flex gap-4">
              {activeTab < 6 && (
                <button 
                  onClick={() => setActiveTab(prev => (prev === 1 ? 3 : prev + 1))}
                  className="px-8 py-3 bg-slate-900 border border-slate-700 hover:border-purple-500 rounded-xl text-white font-bold flex items-center gap-2 transition-all"
                >
                  Próximo <ChevronRight size={20} />
                </button>
              )}
              <button 
                onClick={handleSave}
                className="px-10 py-3 vibe-gradient rounded-xl text-white font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:scale-105 transition-all"
              >
                <Save size={20} /> Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
