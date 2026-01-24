
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Filter, X, Image as ImageIcon, Trash, Settings2, Hash, Layers } from 'lucide-react';
import { Product, VariationGroup, VariationOption, Category } from '../types';

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Vibrador Ponto G Golfinho Liso', 
    description: 'Descubra novas formas de prazer e autoconhecimento com o Vibrador Ponto G Golfinho Liso. Seu design anatômico foi criado para estimular o Ponto G e o clitóris.',
    categoryId: 'cat2', 
    price: 19.90, 
    promoPrice: 14.90, 
    costPrice: 5.00, 
    stock: 21, 
    minStock: 5, 
    sku: 'VB-40543', 
    images: ['https://images.tcdn.com.br/img/img_prod/1126939/vibrador_ponto_g_golfinho_liso_estimulador_feminino_1249_1_20201015152845.jpg'],
    variations: [
      {
        id: 'v1',
        name: 'Cor',
        options: [
          { id: 'o1', name: 'Rosa Claro', priceDelta: 0, stock: 0, isAvailable: false },
          { id: 'o2', name: 'Pink', priceDelta: 0, stock: 11, isAvailable: true, image: 'https://images.tcdn.com.br/img/img_prod/1126939/vibrador_ponto_g_golfinho_liso_estimulador_feminino_1249_1_20201015152845.jpg' },
          { id: 'o3', name: 'Roxo', priceDelta: 0, stock: 5, isAvailable: true },
          { id: 'o4', name: 'Preto', priceDelta: 0, stock: 5, isAvailable: true },
        ]
      }
    ]
  },
];

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
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
    promoPrice: undefined,
    costPrice: 0,
    categoryId: '',
    images: [''],
    variations: []
  });

  // Carrega categorias e produtos do localStorage/Initial
  useEffect(() => {
    const savedCats = localStorage.getItem('vibe_categories');
    if (savedCats) setCategories(JSON.parse(savedCats));

    const savedProds = localStorage.getItem('vibe_products');
    if (savedProds) setProducts(JSON.parse(savedProds));
  }, []);

  const saveProductsToStorage = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem('vibe_products', JSON.stringify(updated));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      alert('Selecione uma categoria para o produto.');
      return;
    }

    const cleanImages = (formData.images || []).filter(img => img.trim() !== '');
    
    let updatedProducts;
    if (editingProduct) {
      updatedProducts = products.map(p => p.id === editingProduct.id ? { ...p, ...formData, images: cleanImages } as Product : p);
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        images: cleanImages,
        variations: formData.variations || []
      } as Product;
      updatedProducts = [...products, newProduct];
    }
    
    saveProductsToStorage(updatedProducts);
    setIsModalOpen(false);
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Sem Categoria';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold vibe-text-gradient">Produtos</h2>
          <p className="text-slate-400 mt-1">Gerencie seu catálogo de itens e especificações.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', description: '', sku: '', stock: 0, minStock: 2, price: 0, promoPrice: undefined, costPrice: 0, categoryId: '', images: [''], variations: [] });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 vibe-gradient rounded-xl font-bold text-white shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
                      <img src={product.images[0] || ''} className="w-12 h-12 rounded-lg object-cover bg-slate-800" />
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="text-[10px] text-slate-500 font-bold">Custo: R$ {product.costPrice.toFixed(2)}</div>
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
                    <span className="text-purple-400 font-bold">R$ {(product.promoPrice || product.price).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingProduct(product); setFormData(product); setIsModalOpen(true); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"><Edit2 size={18} /></button>
                      <button onClick={() => { if(confirm('Excluir?')) saveProductsToStorage(products.filter(p => p.id !== product.id)); }} className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all"><Trash2 size={18} /></button>
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
          <div className="glass w-full max-w-4xl rounded-3xl border border-slate-700 p-8 space-y-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Nome do Produto</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Hash size={14} /> SKU / Referência
                  </label>
                  <input required type="text" placeholder="Ex: VB-12345" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Layers size={14} /> Categoria
                  </label>
                  <select 
                    required 
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500 appearance-none font-bold"
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Descrição (Para o Catálogo)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none h-32 resize-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Preço de Venda (R$)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase">Preço de Custo (R$)</label>
                  <input required type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: parseFloat(e.target.value)})} className="w-full bg-slate-900 border border-emerald-500/20 rounded-xl p-4 text-white outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>

              {/* Variações */}
              <div className="pt-6 border-t border-slate-800 space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="text-white font-bold flex items-center gap-2"><Settings2 size={18} className="text-purple-400" /> Gerenciar Variações</h4>
                  <button type="button" onClick={handleAddVariationGroup} className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:text-white transition-colors">
                    <Plus size={14} /> Adicionar Grupo
                  </button>
                </div>

                {formData.variations?.map((group) => (
                  <div key={group.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between gap-4">
                      <input 
                        value={group.name} 
                        onChange={(e) => {
                          const newV = formData.variations?.map(g => g.id === group.id ? { ...g, name: e.target.value } : g);
                          setFormData({ ...formData, variations: newV });
                        }} 
                        className="bg-transparent border-b border-slate-700 font-bold text-white outline-none focus:border-purple-500 pb-1 w-full"
                        placeholder="Nome do grupo (ex: Cor)"
                      />
                      <button type="button" onClick={() => setFormData({...formData, variations: formData.variations?.filter(g => g.id !== group.id)})} className="text-rose-500 hover:text-rose-400"><Trash size={18} /></button>
                    </div>

                    <div className="space-y-4">
                      {group.options.map((opt) => (
                        <div key={opt.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nome</label>
                            <input placeholder="Opção" value={opt.name} onChange={e => handleUpdateOption(group.id, opt.id, { name: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Estoque</label>
                            <input type="number" placeholder="0" value={opt.stock} onChange={e => handleUpdateOption(group.id, opt.id, { stock: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Preço +/-</label>
                            <input type="number" step="0.01" placeholder="0.00" value={opt.priceDelta} onChange={e => handleUpdateOption(group.id, opt.id, { priceDelta: parseFloat(e.target.value) })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">URL Imagem</label>
                            <div className="relative">
                              <ImageIcon size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
                              <input placeholder="URL..." value={opt.image || ''} onChange={e => handleUpdateOption(group.id, opt.id, { image: e.target.value })} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 pl-7 text-xs text-white outline-none" />
                            </div>
                          </div>
                          <div className="flex gap-2 items-center justify-end h-full">
                            {opt.image && <img src={opt.image} className="w-8 h-8 rounded bg-slate-800 object-cover border border-slate-700" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/32'} />}
                            <button type="button" onClick={() => handleRemoveOption(group.id, opt.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash size={16} /></button>
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleAddOption(group.id)} className="text-[10px] font-bold text-purple-400 hover:text-white uppercase tracking-widest flex items-center gap-1 transition-colors px-2">
                        <Plus size={12} /> Adicionar Opção
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="w-full py-4 vibe-gradient rounded-xl font-bold text-white shadow-xl shadow-purple-500/20 active:scale-[0.98] transition-all">
                Salvar Produto e Especificações
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
