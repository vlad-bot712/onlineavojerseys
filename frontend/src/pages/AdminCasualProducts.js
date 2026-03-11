import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Save, X, Upload, Image as ImageIcon, 
  Package, ChevronLeft, Check, AlertTriangle, Eye, EyeOff, Tag
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { id: 'tricouri', name: 'Tricouri', icon: '👕' },
  { id: 'pantaloni-scurti', name: 'Pantaloni Scurți', icon: '🩳' },
  { id: 'pantaloni-lungi', name: 'Pantaloni Lungi', icon: '👖' },
  { id: 'vesta', name: 'Vestă', icon: '🦺' },
  { id: 'geaca', name: 'Geacă', icon: '🧥' },
  { id: 'hanorac', name: 'Hanorac', icon: '🧤' },
  { id: 'papuci', name: 'Papuci', icon: '👟' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

const defaultProduct = {
  name: '',
  category: 'tricouri',
  description: '',
  price_ron: 160,
  sale_price_ron: null,
  has_sale: false,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: [],
  in_stock: true,
};

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function ProductForm({ product, onSave, onCancel, isEdit }) {
  const [form, setForm] = useState(() => {
    const initial = product || defaultProduct;
    return {
      ...initial,
      has_sale: initial.sale_price_ron ? true : false,
    };
  });
  const [newColor, setNewColor] = useState({ name: '', slug: '', images: [], imagePreviews: [] });
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const multiFileInputRef = useRef(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSizeToggle = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  // Toggle sale price
  const handleToggleSale = () => {
    setForm(prev => ({
      ...prev,
      has_sale: !prev.has_sale,
      sale_price_ron: !prev.has_sale ? prev.sale_price_ron : null,
    }));
  };

  // Handle multiple images upload for a color
  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    const newPreviews = [];

    for (const file of files) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (event) => {
          newImages.push(event.target.result);
          newPreviews.push(event.target.result);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setNewColor(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
      imagePreviews: [...prev.imagePreviews, ...newPreviews],
    }));
  };

  // Add additional image to existing color
  const handleAddImageToColor = async (colorIndex, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [];
    for (const file of files) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = (event) => {
          newImages.push(event.target.result);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    const updatedColors = [...form.colors];
    const currentImages = updatedColors[colorIndex].images || [updatedColors[colorIndex].image];
    const currentPreviews = updatedColors[colorIndex].imagePreviews || [updatedColors[colorIndex].imagePreview || updatedColors[colorIndex].image];
    
    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: [...currentImages, ...newImages],
      imagePreviews: [...currentPreviews, ...newImages],
    };
    setForm(prev => ({ ...prev, colors: updatedColors }));
  };

  // Remove specific image from color
  const handleRemoveImageFromColor = (colorIndex, imageIndex) => {
    const updatedColors = [...form.colors];
    const currentImages = updatedColors[colorIndex].images || [updatedColors[colorIndex].image];
    const currentPreviews = updatedColors[colorIndex].imagePreviews || [];
    
    if (currentImages.length <= 1) {
      toast.error('Fiecare culoare trebuie să aibă cel puțin o imagine');
      return;
    }

    updatedColors[colorIndex] = {
      ...updatedColors[colorIndex],
      images: currentImages.filter((_, i) => i !== imageIndex),
      imagePreviews: currentPreviews.filter((_, i) => i !== imageIndex),
      // Update main image if first one was removed
      image: imageIndex === 0 ? currentImages[1] : currentImages[0],
      imagePreview: imageIndex === 0 ? (currentPreviews[1] || currentImages[1]) : (currentPreviews[0] || currentImages[0]),
    };
    setForm(prev => ({ ...prev, colors: updatedColors }));
  };

  // Remove image from new color being added
  const handleRemoveNewColorImage = (imageIndex) => {
    setNewColor(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== imageIndex),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== imageIndex),
    }));
  };

  const handleAddColor = () => {
    if (!newColor.name) {
      toast.error('Introdu numele culorii');
      return;
    }
    if (newColor.images.length === 0) {
      toast.error('Încarcă cel puțin o imagine pentru culoare');
      return;
    }

    const colorSlug = newColor.slug || generateSlug(newColor.name);
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, { 
        name: newColor.name, 
        slug: colorSlug, 
        image: newColor.images[0], // Main image is the first one
        images: newColor.images,
        imagePreview: newColor.imagePreviews[0],
        imagePreviews: newColor.imagePreviews,
      }]
    }));
    setNewColor({ name: '', slug: '', images: [], imagePreviews: [] });
  };

  const handleRemoveColor = (index) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error('Introdu numele produsului');
      return;
    }
    if (form.colors.length === 0) {
      toast.error('Adaugă cel puțin o culoare cu imagine');
      return;
    }
    if (form.sizes.length === 0) {
      toast.error('Selectează cel puțin o mărime');
      return;
    }

    setSaving(true);
    try {
      const slug = generateSlug(form.name);
      
      // Upload images and get URLs
      const uploadedColors = await Promise.all(
        form.colors.map(async (color, colorIdx) => {
          const colorSlug = color.slug || generateSlug(color.name);
          const colorImages = color.images || [color.image];
          
          // Upload all images for this color
          const uploadedImages = await Promise.all(
            colorImages.map(async (img, imgIdx) => {
              if (img && img.startsWith('data:')) {
                try {
                  const uploadRes = await axios.post(`${API_URL}/api/upload/casual-image`, {
                    image: img,
                    product_slug: slug,
                    color_slug: imgIdx === 0 ? colorSlug : `${colorSlug}-${imgIdx + 1}`,
                  });
                  return uploadRes.data.image_url;
                } catch (err) {
                  console.error('Upload error:', err);
                  toast.error(`Eroare la încărcare imagine pentru ${color.name}`);
                  throw err;
                }
              }
              // Already uploaded, clean the URL
              return img.replace('.jpg', '').replace('.png', '');
            })
          );

          return {
            name: color.name,
            slug: colorSlug,
            image: uploadedImages[0], // Main image
            images: uploadedImages, // All images
          };
        })
      );

      const productData = {
        name: form.name,
        slug: slug,
        category: form.category,
        description: form.description,
        price_ron: parseFloat(form.price_ron),
        sale_price_ron: form.has_sale && form.sale_price_ron ? parseFloat(form.sale_price_ron) : null,
        sizes: form.sizes,
        colors: uploadedColors,
        in_stock: form.in_stock,
      };

      await onSave(productData);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-neutral-200 p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {isEdit ? 'EDITEAZĂ PRODUS' : 'PRODUS NOU'}
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-neutral-100 rounded">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block font-bold mb-2">Nume Produs *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Nike Dri-FIT T-Shirt"
            className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block font-bold mb-2">Categorie *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleChange('category', cat.id)}
                className={`p-3 text-sm font-bold border-2 transition-all ${
                  form.category === cat.id
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 hover:border-black'
                }`}
              >
                <span className="mr-1">{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block font-bold mb-2">Descriere</label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descrierea produsului..."
            rows={3}
            className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black resize-none"
          />
        </div>

        {/* Prices with Sale Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="font-bold">Preț & Reducere</label>
            <button
              type="button"
              onClick={handleToggleSale}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 transition-all ${
                form.has_sale
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-neutral-200 hover:border-red-500 text-neutral-600'
              }`}
            >
              <Tag className="w-4 h-4" />
              {form.has_sale ? 'REDUCERE ACTIVĂ' : 'ADAUGĂ REDUCERE'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-600 mb-1">Preț Normal (RON) *</label>
              <input
                type="number"
                value={form.price_ron}
                onChange={(e) => handleChange('price_ron', e.target.value)}
                placeholder="160"
                className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
              />
            </div>
            {form.has_sale && (
              <div>
                <label className="block text-sm text-red-500 mb-1">Preț Reducere (RON) *</label>
                <input
                  type="number"
                  value={form.sale_price_ron || ''}
                  onChange={(e) => handleChange('sale_price_ron', e.target.value)}
                  placeholder="Ex: 120"
                  className="w-full border-2 border-red-200 px-4 py-3 focus:outline-none focus:border-red-500 bg-red-50"
                />
                {form.sale_price_ron && form.price_ron && (
                  <p className="text-xs text-red-500 mt-1">
                    Reducere: {Math.round(100 - (form.sale_price_ron / form.price_ron * 100))}%
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block font-bold mb-2">Mărimi Disponibile *</label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => handleSizeToggle(size)}
                className={`w-12 h-10 text-sm font-bold border-2 transition-all ${
                  form.sizes.includes(size)
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Colors with Multiple Images */}
        <div>
          <label className="block font-bold mb-2">Culori & Imagini * <span className="text-neutral-400 font-normal text-sm">(poți adăuga mai multe poze per culoare)</span></label>
          
          {/* Existing colors */}
          {form.colors.length > 0 && (
            <div className="space-y-4 mb-4">
              {form.colors.map((color, colorIdx) => {
                const colorImages = color.images || [color.image];
                const colorPreviews = color.imagePreviews || colorImages;
                
                return (
                  <div key={colorIdx} className="border-2 border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-lg">{color.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(colorIdx)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Images grid */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {colorPreviews.map((img, imgIdx) => (
                        <div key={imgIdx} className="relative w-20 h-20 border border-neutral-200 overflow-hidden group">
                          <img 
                            src={img.startsWith('/') ? img + '.jpg' : img} 
                            alt={`${color.name} ${imgIdx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { if (img.startsWith('/')) e.target.src = img + '.svg'; }}
                          />
                          {imgIdx === 0 && (
                            <span className="absolute top-0 left-0 bg-[#CCFF00] text-black text-[10px] font-bold px-1">MAIN</span>
                          )}
                          {colorImages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImageFromColor(colorIdx, imgIdx)}
                              className="absolute top-0 right-0 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {/* Add more images button */}
                      <label className="w-20 h-20 border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer hover:border-black transition-all">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleAddImageToColor(colorIdx, e)}
                          className="hidden"
                        />
                        <Plus className="w-6 h-6 text-neutral-400" />
                      </label>
                    </div>
                    <p className="text-xs text-neutral-400">{colorImages.length} {colorImages.length === 1 ? 'imagine' : 'imagini'}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new color */}
          <div className="border-2 border-dashed border-neutral-300 p-4">
            <p className="text-sm font-bold mb-3 text-neutral-600">Adaugă Culoare Nouă</p>
            
            <div className="space-y-3">
              <input
                type="text"
                value={newColor.name}
                onChange={(e) => setNewColor(prev => ({ 
                  ...prev, 
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="Nume culoare (ex: Negru, Alb, Roșu)"
                className="w-full border-2 border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
              />
              
              {/* Images for new color */}
              <div className="flex flex-wrap gap-2">
                {newColor.imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative w-16 h-16 border border-neutral-200 overflow-hidden group">
                    <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-0 left-0 bg-[#CCFF00] text-black text-[10px] font-bold px-1">MAIN</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveNewColorImage(idx)}
                      className="absolute top-0 right-0 p-0.5 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <label className="w-16 h-16 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:border-black transition-all">
                  <input
                    type="file"
                    ref={multiFileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-5 h-5 text-neutral-400" />
                  <span className="text-[10px] text-neutral-400">Adaugă</span>
                </label>
              </div>
              
              {newColor.images.length > 0 && (
                <p className="text-xs text-green-600">{newColor.images.length} {newColor.images.length === 1 ? 'imagine selectată' : 'imagini selectate'}</p>
              )}
              
              <button
                type="button"
                onClick={handleAddColor}
                disabled={!newColor.name || newColor.images.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#CCFF00] text-black px-4 py-3 font-bold hover:bg-black hover:text-[#CCFF00] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Adaugă Culoarea
              </button>
            </div>
          </div>
        </div>

        {/* In Stock */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleChange('in_stock', !form.in_stock)}
            className={`w-12 h-6 rounded-full transition-all ${
              form.in_stock ? 'bg-green-500' : 'bg-neutral-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
              form.in_stock ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
          <span className="font-bold">{form.in_stock ? 'În Stoc' : 'Stoc Epuizat'}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border-2 border-neutral-200 font-bold hover:border-black transition-all"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 bg-[#CCFF00] text-black font-bold flex items-center justify-center gap-2 hover:bg-black hover:text-[#CCFF00] transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'Salvează' : 'Creează Produs'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCasualProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [casualVisible, setCasualVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadProducts = async () => {
    try {
      const [productsRes, settingsRes] = await Promise.all([
        axios.get(`${API_URL}/api/casual-products?force=true`),
        axios.get(`${API_URL}/api/settings/casual`),
      ]);
      setProducts(productsRes.data);
      setCasualVisible(settingsRes.data.casual_visible);
    } catch (err) {
      console.error(err);
      toast.error('Eroare la încărcare produse');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleToggleCasual = async () => {
    try {
      const res = await axios.patch(`${API_URL}/api/settings/casual`);
      setCasualVisible(res.data.casual_visible);
      toast.success(res.data.casual_visible ? 'Secțiunea Casual este acum vizibilă!' : 'Secțiunea Casual este ascunsă');
    } catch (err) {
      toast.error('Eroare la schimbare setare');
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      await axios.post(`${API_URL}/api/admin/casual-products`, productData);
      toast.success('Produs creat cu succes!');
      setShowForm(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error('Eroare la creare produs');
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await axios.put(`${API_URL}/api/admin/casual-products/${editProduct.id}`, productData);
      toast.success('Produs actualizat!');
      setEditProduct(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error('Eroare la actualizare produs');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/admin/casual-products/${productId}`);
      toast.success('Produs șters!');
      setDeleteConfirm(null);
      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error('Eroare la ștergere produs');
    }
  };

  const getCategoryLabel = (categoryId) => {
    const cat = CATEGORIES.find(c => c.id === categoryId);
    return cat ? `${cat.icon} ${cat.name}` : categoryId;
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/orders" className="p-2 hover:bg-white rounded border border-neutral-200">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ADMIN - PRODUSE CASUAL
            </h1>
            <p className="text-neutral-500">{products.length} produse</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#CCFF00] text-black px-6 py-3 font-bold hover:bg-black hover:text-[#CCFF00] transition-all"
          >
            <Plus className="w-5 h-5" />
            PRODUS NOU
          </button>
        </div>

        {/* Casual Visibility Toggle */}
        <div className="bg-white border-2 border-neutral-200 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {casualVisible ? (
              <Eye className="w-6 h-6 text-green-500" />
            ) : (
              <EyeOff className="w-6 h-6 text-neutral-400" />
            )}
            <div>
              <p className="font-bold">Vizibilitate Secțiune Casual</p>
              <p className="text-sm text-neutral-500">
                {casualVisible ? 'Utilizatorii pot vedea și cumpăra produse casual' : 'Secțiunea Casual este ascunsă (Coming Soon)'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleCasual}
            className={`px-6 py-2 font-bold transition-all ${
              casualVisible
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
            }`}
          >
            {casualVisible ? 'ACTIV' : 'INACTIV'}
          </button>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-neutral-300 p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">Niciun produs casual</h2>
            <p className="text-neutral-500 mb-6">Creează primul tău produs casual</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-6 py-3 font-bold hover:bg-black hover:text-[#CCFF00] transition-all"
            >
              <Plus className="w-5 h-5" />
              CREEAZĂ PRODUS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map(product => {
              const imageCount = product.colors?.reduce((sum, c) => sum + (c.images?.length || 1), 0) || product.colors?.length || 0;
              
              return (
                <div key={product.id} className="bg-white border-2 border-neutral-200 overflow-hidden group">
                  <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                    {product.colors && product.colors[0] && (
                      <img
                        src={product.colors[0].image + '.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = product.colors[0].image + '.svg'; }}
                      />
                    )}
                    {/* Price badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {product.sale_price_ron ? (
                        <>
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1">
                            {product.sale_price_ron} RON
                          </span>
                          <span className="bg-neutral-500 text-white text-xs px-2 py-1 line-through">
                            {product.price_ron} RON
                          </span>
                        </>
                      ) : (
                        <span className="bg-black text-white text-xs font-bold px-2 py-1">
                          {product.price_ron} RON
                        </span>
                      )}
                    </div>
                    {/* Stock badge */}
                    {!product.in_stock && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1">
                        STOC EPUIZAT
                      </div>
                    )}
                    {/* Image count badge */}
                    {imageCount > 1 && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {imageCount}
                      </div>
                    )}
                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                      <button
                        onClick={() => setEditProduct(product)}
                        className="p-3 bg-white text-black rounded-full hover:bg-[#CCFF00] transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="p-3 bg-white text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#CCFF00] bg-black inline-block px-2 py-0.5 mb-2">
                      {getCategoryLabel(product.category)}
                    </p>
                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-neutral-500">
                      {product.colors?.length || 0} culori · {product.sizes?.length || 0} mărimi · {imageCount} poze
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showForm || editProduct) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <ProductForm
                product={editProduct || defaultProduct}
                onSave={editProduct ? handleUpdateProduct : handleCreateProduct}
                onCancel={() => {
                  setShowForm(false);
                  setEditProduct(null);
                }}
                isEdit={!!editProduct}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-2 border-neutral-200 p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <h2 className="text-xl font-bold">Șterge Produs?</h2>
              </div>
              <p className="text-neutral-600 mb-6">
                Ești sigur că vrei să ștergi <strong>"{deleteConfirm.name}"</strong>? 
                Această acțiune nu poate fi anulată.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 border-2 border-neutral-200 font-bold hover:border-black transition-all"
                >
                  Anulează
                </button>
                <button
                  onClick={() => handleDeleteProduct(deleteConfirm.id)}
                  className="flex-1 py-3 bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                >
                  Șterge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
