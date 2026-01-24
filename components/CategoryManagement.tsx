
import React, { useState, useEffect } from 'react';
import { Plus, Folder, Edit2, Trash2, X } from 'lucide-react';
import { Category } from '../types';

const STORAGE_KEY = 'vibe_categories';
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Cosméticos' },
  { id: 'cat2', name: 'Acessórios' },
  { id: 'cat3', name: 'Lingeries' },
  { id: 'cat4', name: 'Fetiche' },
];

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      const initial = DEFAULT_CATEGORIES;
      setCategories(initial);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  }, []);

  const saveCategories = (updated: Category[]) => {
    setCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName
    };
    
    saveCategories([...categories, newCat]);
    setNewCatName('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir esta categoria? Produtos vinculados podem ficar sem categoria.')) {
      saveCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold vibe-text-gradient">Categorias</h2>
          <p className="text-slate-400 mt-1">Organize seus produtos por grupos lógicos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 vibe-gradient rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl">
                <Folder size={24} />
              </div>
              <div>
                <h3 className="text-white font-bold">{cat.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">ID: {cat.id.split('-')[1] || cat.id}</p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass w-full max-w-md rounded-3xl border border-slate-700 p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Nova Categoria</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Nome da Categoria</label>
                <input 
                  required 
                  autoFocus
                  type="text" 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500" 
                  placeholder="Ex: Lingeries Luxo"
                />
              </div>
              <button type="submit" className="w-full py-4 vibe-gradient rounded-xl font-bold text-white">
                Criar Categoria
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
