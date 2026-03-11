import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp, Edit2, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { value: 'pantaloni-scurti', label: 'Pantaloni Scurți', garment: 'pantaloni-scurti' },
  { value: 'pantaloni-lungi', label: 'Pantaloni Lungi', garment: 'pantaloni-lungi' },
  { value: 'vesta', label: 'Vestă', garment: 'vesta' },
  { value: 'tricouri', label: 'Tricouri', garment: 'tricou' },
];

const ALL_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  category: 'tricouri',
  garment_type: 'tricou',
  price_ron: 160,
  description: '',
  colors: [{ name: '', slug: '', image: '' }],
  sizes: ['S', 'M', 'L', 'XL', '2XL'],
};

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function ProductForm({ product, onSave, onCancel, isNew }) {
  const [form, setForm] = useState(product);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const updateColor = (idx, key, val) => {
    const colors = [...form.colors];
    colors[idx] = { ...colors[idx], [key]: val };
    if (key === 'name') {
      colors[idx].slug = slugify(val);
      if (!colors[idx].image || colors[idx].image === `/images/casual/${form.slug}/`) {
        colors[idx].image = `/images/casual/${form.slug}/${slugify(val)}`;
      }
    }
    setForm(prev => ({ ...prev, colors }));
  };

  const addColor = () => setForm(prev => ({
    ...prev,
    colors: [...prev.colors, { name: '', slug: '', image: '' }]
  }));

  const removeColor = (idx) => setForm(prev => ({
    ...prev,
    colors: prev.colors.filter((_, i) => i !== idx)
  }));

  const toggleSize = (s) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(s) ? prev.sizes.filter(x => x !== s) : [...prev.sizes, s]
    }));
  };

  const handleCategoryChange = (cat) => {
    const c = CATEGORIES.find(x => x.value === cat);
    update('category', cat);
    update('garment_type', c?.garment || cat);
  };

  const handleNameChange = (name) => {
    update('name', name);
    if (isNew) {
      const s = slugify(name);
      update('slug', s);
      // Update color image paths
      const colors = form.colors.map(c => ({
        ...c,
        image: `/images/casual/${s}/${c.slug}`
      }));
      setForm(prev => ({ ...prev, name, slug: s, colors }));
    }
  };

  const handleSave = () => {
    if (!form.name || !form.slug || form.colors.length === 0 || form.sizes.length === 0) {
      toast.error('Completează toate câmpurile obligatorii!');
      return;
    }
    onSave(form);
  };

  return (
    <div className="bg-white border-2 border-black p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Nume produs *</label>
          <input
            data-testid="form-name"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="ex: Nike Running Shorts"
            className="w-full border-2 border-neutral-200 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
          />
        </div>
        {/* Slug */}
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Slug (auto)</label>
          <input
            data-testid="form-slug"
            value={form.slug}
            onChange={e => update('slug', e.target.value)}
            className="w-full border-2 border-neutral-200 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-black bg-neutral-50"
          />
        </div>
        {/* Category */}
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Categorie *</label>
          <select
            data-testid="form-category"
            value={form.category}
            onChange={e => handleCategoryChange(e.target.value)}
            className="w-full border-2 border-neutral-200 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
          >
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        {/* Price */}
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Preț (RON) *</label>
          <input
            data-testid="form-price"
            type="number"
            value={form.price_ron}
            onChange={e => update('price_ron', parseInt(e.target.value) || 0)}
            className="w-full border-2 border-neutral-200 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Descriere</label>
        <textarea
          data-testid="form-description"
          value={form.description}
          onChange={e => update('description', e.target.value)}
          rows={2}
          placeholder="Material confortabil, design sport modern..."
          className="w-full border-2 border-neutral-200 px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-black resize-none"
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">Mărimi *</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={`w-12 h-10 text-xs font-bold border-2 transition-all ${
                form.sizes.includes(s) ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Culori *</label>
          <button
            type="button"
            onClick={addColor}
            className="text-xs font-bold flex items-center gap-1 text-[#CCFF00] bg-black px-3 py-1 hover:bg-[#CCFF00] hover:text-black transition-all"
          >
            <Plus className="w-3 h-3" /> Adaugă culoare
          </button>
        </div>
        <div className="space-y-2">
          {form.colors.map((c, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                value={c.name}
                onChange={e => updateColor(i, 'name', e.target.value)}
                placeholder="Nume culoare (ex: Negru)"
                className="flex-1 border-2 border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
              <input
                value={c.image}
                onChange={e => updateColor(i, 'image', e.target.value)}
                placeholder="/images/casual/slug/culoare"
                className="flex-[2] border-2 border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black font-mono text-xs"
              />
              {form.colors.length > 1 && (
                <button type="button" onClick={() => removeColor(i)} className="p-2 text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-neutral-400 mt-1">
          Calea imaginii: /images/casual/{'{slug}'}/{'{culoare}'} (fără extensie — se adaugă automat .jpg)
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          data-testid="form-save"
          onClick={handleSave}
          className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold text-sm uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black transition-all"
        >
          <Save className="w-4 h-4" /> {isNew ? 'Creează Produs' : 'Salvează'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 border-2 border-neutral-200 px-6 py-3 font-bold text-sm hover:border-black transition-all"
        >
          <X className="w-4 h-4" /> Anulează
        </button>
      </div>
    </div>
  );
}

export default function AdminCasual() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/casual-products?force=true`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaveNew = async (data) => {
    try {
      await axios.post(`${API_URL}/api/casual-products`, data);
      toast.success('Produs creat!');
      setShowNew(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare la creare');
    }
  };

  const handleUpdate = async (data) => {
    try {
      await axios.put(`${API_URL}/api/casual-products/${editingId}`, data);
      toast.success('Produs actualizat!');
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Eroare la salvare');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Ștergi "${name}"?`)) return;
    try {
      await axios.delete(`${API_URL}/api/casual-products/${id}`);
      toast.success('Produs șters!');
      load();
    } catch (err) {
      toast.error('Eroare la ștergere');
    }
  };

  const cats = {};
  products.forEach(p => {
    cats[p.category] = (cats[p.category] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="admin-casual-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-1">Admin</p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              PRODUSE CASUAL
            </h1>
            <p className="text-neutral-400 text-sm mt-1">
              {products.length} produse &middot; {Object.entries(cats).map(([k, v]) => `${k}: ${v}`).join(' · ')}
            </p>
          </div>
          {!showNew && (
            <button
              data-testid="add-product-btn"
              onClick={() => { setShowNew(true); setEditingId(null); }}
              className="flex items-center gap-2 bg-[#CCFF00] text-black px-5 py-3 font-bold text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Plus className="w-4 h-4" /> Produs Nou
            </button>
          )}
        </div>

        {/* New product form */}
        {showNew && (
          <div className="mb-6">
            <p className="text-sm font-bold mb-2">Produs Nou</p>
            <ProductForm
              product={EMPTY_PRODUCT}
              onSave={handleSaveNew}
              onCancel={() => setShowNew(false)}
              isNew={true}
            />
          </div>
        )}

        {/* Product list */}
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="border-2 border-neutral-200 hover:border-neutral-400 transition-all">
              {editingId === p.id ? (
                <div className="p-1">
                  <ProductForm
                    product={p}
                    onSave={handleUpdate}
                    onCancel={() => setEditingId(null)}
                    isNew={false}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-neutral-100 flex-shrink-0 overflow-hidden">
                    <img
                      src={p.colors[0]?.image + '.jpg'}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = p.colors[0]?.image + '.svg'; }}
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{p.name}</h3>
                    <p className="text-xs text-neutral-400">
                      {p.category} &middot; {p.colors.length} culori &middot; {p.sizes.join(', ')} &middot; {p.price_ron} RON
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      data-testid={`edit-${p.slug}`}
                      onClick={() => { setEditingId(p.id); setShowNew(false); }}
                      className="p-2 border-2 border-neutral-200 hover:border-black hover:bg-black hover:text-white transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      data-testid={`delete-${p.slug}`}
                      onClick={() => handleDelete(p.id, p.name)}
                      className="p-2 border-2 border-neutral-200 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
