
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de autenticação de 1.5s para UX premium
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo (Glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[140px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 blur-[140px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link 
            to="/catalogo" 
            className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.3em] group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Retornar à Loja
          </Link>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
            <div className="w-20 h-20 rounded-[2rem] vibe-gradient flex items-center justify-center text-white font-bold text-4xl shadow-2xl shadow-purple-500/40 relative border border-white/10">
              V
            </div>
          </div>
          
          <h1 className="text-3xl font-black tracking-tighter text-white">
            VIBE <span className="font-light text-purple-400">ADMIN</span>
          </h1>
          <p className="text-slate-500 text-[10px] mt-2 uppercase tracking-[0.4em] font-bold">Acesso Restrito</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 vibe-gradient opacity-50"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Administrativo</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@vibesensual.com"
                  className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm placeholder:text-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                <button type="button" className="text-[9px] font-bold text-purple-500 hover:text-purple-400 uppercase tracking-widest">Esqueci a senha</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm placeholder:text-slate-700 font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 vibe-gradient rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} /> Entrar no Painel
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] bg-slate-950/50 py-3 rounded-xl border border-white/5">
              <ShieldCheck size={14} className="text-purple-500" /> Sistema de Gestão Vibe Sensual v2.5
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] text-slate-600 font-medium italic opacity-50">
          Acesso monitorado. IP logado para segurança do catálogo.
        </p>
      </div>
    </div>
  );
};

export default Login;
