import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Check, Heart, Shirt, Award } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductDetail() {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0); // Index of selected kit
  
  // Customization state
  const [customization, setCustomization] = useState({
    enabled: false,
    name: '',
    number: '',
    patches: []
  });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(res.data);
      if (res.data.sizes && res.data.sizes.length > 0) {
        setSelectedSize(res.data.sizes[0]);
      }
      // Reset selected image when variant changes
      setSelectedImage(0);
    } catch (err) {
      console.error(err);
      toast.error('Produsul nu a putut fi încărcat');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantChange = (variantIndex) => {
    setSelectedVariant(variantIndex);
    setSelectedImage(0); // Reset to first image of new variant
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Selectează o mărime');
      return;
    }
    
    // Create product with customization
    const productWithCustomization = {
      ...product,
      customization: customization.enabled ? {
        name: customization.name,
        number: customization.number,
        patches: customization.patches
      } : null
    };
    
    addToCart(productWithCustomization, selectedSize);
    toast.success('Produs adăugat în coș!');
  };

  const getAvailablePatches = () => {
    if (!product) return [];
    
    const patches = [];
    
    // League patch based on country
    if (product.league) {
      patches.push({ id: 'league', name: `Patch ${product.league}`, icon: '🏆' });
    }
    
    // UCL patch if team plays in Champions League
    if (product.plays_ucl) {
      patches.push({ id: 'ucl', name: 'Patch UEFA Champions League', icon: '⭐' });
    }
    
    return patches;
  };

  const togglePatch = (patchId) => {
    setCustomization(prev => ({
      ...prev,
      patches: prev.patches.includes(patchId)
        ? prev.patches.filter(p => p !== patchId)
        : [...prev.patches, patchId]
    }));
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p>Produsul nu a fost găsit.</p>
      </div>
    );
  }

  const images = product.variants && product.variants.length > 0
    ? product.variants[selectedVariant].images || ['https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=800']
    : (product.images && product.images.length > 0 
      ? product.images 
      : ['https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=800']);

  const availablePatches = getAvailablePatches();
  const currentVariant = product.variants && product.variants[selectedVariant];

  return (
    <div data-testid="product-detail-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-100 overflow-hidden border-2 border-neutral-200">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square border-2 overflow-hidden ${
                      selectedImage === idx ? 'border-black' : 'border-neutral-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-neutral-600 mb-6">{product.team} • {product.year}</p>
            <p className="text-4xl font-bold mb-8">{formatPrice(product.price_ron)}</p>

            {/* Size Selector */}
            <div className="mb-8">
              <h3 className="font-bold mb-3">SELECTEAZĂ MĂRIMEA</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    data-testid={`size-${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border-2 font-bold transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Customization Section */}
            <div className="mb-8 border-2 border-neutral-200 p-6 bg-neutral-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shirt className="w-6 h-6" />
                  <h3 className="font-bold text-xl">CUSTOMIZARE</h3>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customization.enabled}
                    onChange={(e) => setCustomization({...customization, enabled: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <span className="font-bold text-sm">Activează</span>
                </label>
              </div>

              {customization.enabled && (
                <div className="space-y-4 pt-4 border-t-2 border-neutral-200">
                  {/* Name */}
                  <div>
                    <label className="block font-bold mb-2 text-sm">NUME PE TRICOU</label>
                    <input
                      type="text"
                      value={customization.name}
                      onChange={(e) => setCustomization({...customization, name: e.target.value.toUpperCase()})}
                      placeholder="Ex: POPESCU"
                      maxLength={12}
                      className="w-full border-2 border-neutral-200 px-4 py-2 focus:outline-none focus:border-black uppercase"
                    />
                  </div>

                  {/* Number */}
                  <div>
                    <label className="block font-bold mb-2 text-sm">NUMĂR</label>
                    <input
                      type="number"
                      value={customization.number}
                      onChange={(e) => setCustomization({...customization, number: e.target.value})}
                      placeholder="Ex: 10"
                      min="0"
                      max="99"
                      className="w-full border-2 border-neutral-200 px-4 py-2 focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Patches */}
                  {availablePatches.length > 0 && (
                    <div>
                      <label className="block font-bold mb-3 text-sm">PATCH-URI DISPONIBILE</label>
                      <div className="space-y-2">
                        {availablePatches.map(patch => (
                          <label
                            key={patch.id}
                            className={`flex items-center space-x-3 p-3 border-2 cursor-pointer transition-all ${
                              customization.patches.includes(patch.id)
                                ? 'border-black bg-[#CCFF00]'
                                : 'border-neutral-200 hover:border-black'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={customization.patches.includes(patch.id)}
                              onChange={() => togglePatch(patch.id)}
                              className="w-5 h-5"
                            />
                            <span className="text-2xl">{patch.icon}</span>
                            <span className="font-bold text-sm">{patch.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white border-2 border-black p-3">
                    <p className="text-xs font-bold">ℹ️ NOTĂ: Prețul rămâne {formatPrice(product.price_ron)} indiferent de customizare</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                data-testid="add-to-cart-btn"
                className="w-full bg-black text-white py-4 px-8 font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Adaugă în Coș</span>
              </button>

              <button
                onClick={() => {
                  toggleFavorite(product);
                  toast.success(isFavorite(product.id) ? 'Șters din favorite' : 'Adăugat la favorite');
                }}
                data-testid="add-to-favorites-btn"
                className={`w-full py-4 px-8 font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 border-2 ${
                  isFavorite(product.id)
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    : 'bg-white text-black border-black hover:bg-[#CCFF00] hover:border-[#CCFF00]'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-white' : ''}`} />
                <span>{isFavorite(product.id) ? 'Șters din Favorite' : 'Adaugă la Favorite'}</span>
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 border-t-2 border-neutral-200 pt-8">
                <h3 className="font-bold mb-3">DESCRIERE</h3>
                <p className="text-neutral-600">{product.description}</p>
              </div>
            )}

            {/* Features */}
            <div className="mt-8 border-t-2 border-neutral-200 pt-8">
              <h3 className="font-bold mb-3">CARACTERISTICI</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#CCFF00]" />
                  <span className="text-neutral-600">Material premium</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#CCFF00]" />
                  <span className="text-neutral-600">Design autentic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#CCFF00]" />
                  <span className="text-neutral-600">Confort garantat</span>
                </li>
                {product.league && (
                  <li className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-[#CCFF00]" />
                    <span className="text-neutral-600">Ligă: {product.league}</span>
                  </li>
                )}
                {product.plays_ucl && (
                  <li className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-[#CCFF00]" />
                    <span className="text-neutral-600">Echipă UEFA Champions League</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
