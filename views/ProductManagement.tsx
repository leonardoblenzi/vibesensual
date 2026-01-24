
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, Trash, Settings2, Hash, Layers, Tag, PlusCircle } from 'lucide-react';
import { Product, VariationGroup, VariationOption, Category } from '../types';
import { InventoryController } from '../controllers/InventoryController';

const ProductManagementView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    sku: '',
    stock: 0,
    minStock: 2,
    price: 0,
    promoPrice: 0,
    categoryId: '',
    images: [''],
    variations: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(InventoryController.getProducts());
    setCategories(InventoryController.getCategories());
  };

  const handleAddMainImage = () => {
    if ((formData.images?.length || 0) < 8) {
      setFormData({ ...formData, images: [...(formData.images || []), ''] });
    }
  };

  const handleUpdateMainImage = (index: number, url: string) => {
    const newImages = [...(formData.images || [])];
    newImages[index] = url;
    setFormData({ ...formData, images: newImages });
  };

  const handleRemoveMainImage = (index: number) => {
    const newImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages.length ? newImages : [''] });
  };

  const handleAddVariationGroup = () => {
    const newGroup: VariationGroup = {
      id: Date.now().toString(),
      name: 'Nova Variação',
      options: []
    };
    setFormData({ ...formData, variations: [...(formData.variations || []), newGroup] });
  };

  const handleAddOption = (groupId: string) => {
    const newVariations = (formData.variations || []).map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          options: [...g.options, { id: Date.now().toString(), name: '', priceDelta: 0, stock: 0, isAvailable: true, image: '' }]
        };
      }
      return g;
    });
    setFormData({ ...formData, variations: newVariations });
  };

  const handleUpdateOption = (groupId: string, optionId: string, updates: Partial<VariationOption>) => {
    const newVariations = (formData.variations || []).map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          options: g.options.map(o => o.id === optionId ? { ...o, ...updates } : o)
        };
      }
      return g;
    });
    setFormData({ ...formData, variations: newVariations });
  };

  const handleRemoveOption = (groupId: string, optionId: string) => {
    const newVariations = (formData.variations || []).map(g => {
      if (g.id === groupId) {
        return { ...g, options: g.options.filter(o => o.id !== optionId) };
      }
      return g;
    });
    setFormData({ ...formData, variations: newVariations });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      alert('Selecione uma categoria.');
      return;
    }

    const cleanImages = (formData.images || []).filter(img => img.trim() !== '');
    
    const productToSave: Product = {
      ...formData,
      id: editingProduct?.id || Date.now().toString(),
      images: cleanImages,
      variations: formData.variations || [],
      stock: editingProduct ? editingProduct.stock : (formData.stock || 0),
      costPrice: editingProduct?.costPrice || 0
    } as Product;
    
    InventoryController.saveProduct(productToSave);
    loadData();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este produto permanentemente?')) {
      InventoryController.deleteProduct(id);
      loadData();
    }
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Sem Categoria';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold vibe-text-gradient">Produtos</h2>
          <p className="text-slate-400 mt-1">Gerencie seu catálogo completo de especificações.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', description: '', sku: '', stock: 0, minStock: 2, price: 0, promoPrice: 0, categoryId: '', images: [''], variations: [] });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 vibe-gradient rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou SKU..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="glass rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold">
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">SKU / Categoria</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">Preço</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                        {product.images[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-600" size={20} />}
                      </div>
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        {product.promoPrice && product.promoPrice > 0 ? (
                           <div className="text-[10px] text-pink-400 font-bold uppercase flex items-center gap-1">
                             <Tag size={10} /> Em Promoção
                           </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-purple-400 font-bold">{product.sku}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{getCategoryName(product.categoryId)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${product.stock <= product.minStock ? 'text-rose-400' : 'text-slate-300'}`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-purple-400 font-bold">R$ {product.price.toFixed(2)}</span>
                      {product.promoPrice && product.promoPrice > 0 ? (
                        <span className="text-[10px] text-slate-500 line-through">R$ {product.promoPrice.toFixed(2)}</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingProduct(product); setFormData(product); setIsModalOpen(true); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass w-full max-w-4xl rounded-[2.5rem] border border-slate-700 p-8 space-y-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Comercial</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Hash size={14} /> SKU / Ref</label>
                  <input required type="text" placeholder="Ex: VB-100" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2"><Layers size={14} /> Categoria</label>
                  <select 
                    required 
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500 appearance-none font-bold"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descrição para Catálogo</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none h-32 resize-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="grid grid-cols-2 gap-4 col-span-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Preço de Venda (R$)</label>
                    <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-pink-500 uppercase tracking-widest ml-1">Preço Promocional (R$)</label>
                    <input type="number" step="0.01" placeholder="Opcional" value={formData.promoPrice || ''} onChange={e => setFormData({...formData, promoPrice: parseFloat(e.target.value)})} className="w-full bg-slate-950 border border-pink-500/20 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-pink-500 font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 col-span-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Estoque Mínimo (Alerta)</label>
                    <input required type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:ring-2 focus:ring-rose-500" />
                    <p className="text-[9px] text-slate-500 ml-1 uppercase font-bold">* O estoque inicial deve ser lançado na tela de "Novas Entradas".</p>
                  </div>
                </div>

                {/* Seção de Imagens Principais (Até 8) */}
                <div className="space-y-4 col-span-2 border-t border-slate-800 pt-6">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <ImageIcon size={14} /> Imagens do Produto (Máx 8)
                    </label>
                    <button 
                      type="button" 
                      onClick={handleAddMainImage}
                      disabled={(formData.images?.length || 0) >= 8}
                      className="text-[10px] font-black text-purple-400 hover:text-white disabled:opacity-30 flex items-center gap-1 uppercase tracking-widest"
                    >
                      <PlusCircle size={14} /> Adicionar URL
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {formData.images?.map((url, idx) => (
                      <div key={idx} className="flex gap-3 items-center group">
                        <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                          {url ? <img src={url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-800" size={18} />}
                        </div>
                        <input 
                          type="text" 
                          value={url} 
                          onChange={e => handleUpdateMainImage(idx, e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:ring-2 focus:ring-purple-500" 
                          placeholder={`URL da Imagem ${idx + 1}...`} 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveMainImage(idx)}
                          className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seção de Variações */}
              <div className="pt-6 border-t border-slate-800 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-bold flex items-center gap-2"><Settings2 size={18} className="text-purple-400" /> Variações e Grades</h4>
                  <button type="button" onClick={handleAddVariationGroup} className="text-[10px] font-black text-purple-400 flex items-center gap-1 hover:text-white transition-colors uppercase tracking-widest">
                    <Plus size={14} /> Adicionar Grade
                  </button>
                </div>

                {formData.variations?.map((group) => (
                  <div key={group.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-4">
                    <div className="flex justify-between gap-4">
                      <input 
                        value={group.name} 
                        onChange={(e) => {
                          const newV = formData.variations?.map(g => g.id === group.id ? { ...g, name: e.target.value } : g);
                          setFormData({ ...formData, variations: newV });
                        }} 
                        className="bg-transparent border-b border-slate-700 font-bold text-white outline-none focus:border-purple-500 pb-1 w-full"
                        placeholder="Ex: Cor ou Tamanho"
                      />
                      <button type="button" onClick={() => setFormData({...formData, variations: formData.variations?.filter(g => g.id !== group.id)})} className="text-rose-500 hover:text-rose-400 p-2"><Trash size={18} /></button>
                    </div>

                    <div className="space-y-4">
                      {group.options.map((opt) => (
                        <div key={opt.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50">
                          <div className="md:col-span-1">
                            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                              {opt.image ? <img src={opt.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-800" size={16} />}
                            </div>
                          </div>
                          
                          <div className="md:col-span-3 space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Nome Opção</label>
                            <input value={opt.name} onChange={e => handleUpdateOption(group.id, opt.id, { name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none" placeholder="Ex: Pink" />
                          </div>

                          <div className="md:col-span-4 space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">URL Imagem Variação</label>
                            <input value={opt.image || ''} onChange={e => handleUpdateOption(group.id, opt.id, { image: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none" placeholder="https://..." />
                          </div>

                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Estoque</label>
                            <input type="number" value={opt.stock} onChange={e => handleUpdateOption(group.id, opt.id, { stock: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none" />
                          </div>

                          <div className="md:col-span-1 space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase">Acréscimo</label>
                            <input type="number" step="0.01" value={opt.priceDelta} onChange={e => handleUpdateOption(group.id, opt.id, { priceDelta: parseFloat(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none" />
                          </div>

                          <div className="md:col-span-1 flex justify-end">
                            <button type="button" onClick={() => handleRemoveOption(group.id, opt.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl"><Trash size={16} /></button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddOption(group.id)} className="text-[9px] font-black text-purple-400 hover:text-white uppercase tracking-[0.2em] flex items-center gap-1 transition-colors px-2 py-1">
                        <Plus size={12} /> Adicionar Opção à Grade
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-5 vibe-gradient rounded-[2rem] font-black uppercase tracking-widest text-white shadow-xl shadow-purple-500/30 active:scale-[0.98] transition-all">
                Salvar Produto e Grades
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagementView;
