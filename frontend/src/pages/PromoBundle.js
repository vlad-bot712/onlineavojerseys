import React, { useState, useEffect } from 'react';
import { X, Gift, ChevronLeft, ChevronRight, ShoppingCart, AlertCircle, Users, Star } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PromoBundle() {
  const { addToCart } = useCart();
  const [currentImage, setCurrentImage] = useState(0);
  const [products, setProducts] = useState([]);
  const [nationals, setNationals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 11) + 2);
  
  // Main product selection
  const [mainProduct, setMainProduct] = useState(null);
  const [mainSize, setMainSize] = useState('');
  const [mainKit, setMainKit] = useState(0);
  
  // Free product selection
  const [freeNational, setFreeNational] = useState('');
  const [freeSize, setFreeSize] = useState('');

  const promoImages = ['/images/promo-bundle.jpg', '/images/promo-1plus1.jpg'];
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    loadProducts();
    // Update viewer count every 10 minutes
    const interval = setInterval(() => {
      setViewerCount(Math.floor(Math.random() * 11) + 2);
    }, 600000);
    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    try {
      const [clubRes, nationalsRes] = await Promise.all([
        axios.get(`${API_URL}/api/products?category=echipe-club`),
        axios.get(`${API_URL}/api/products?category=nationale`)
      ]);
      setProducts(clubRes.data);
      setNationals(nationalsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!mainProduct) {
      toast.error('Selectează un tricou principal!');
      return;
    }
    if (!mainSize) {
      toast.error('Selectează mărimea pentru tricoul principal!');
      return;
    }
    if (!freeNational) {
      toast.error('Selectează națională pentru tricoul gratuit!');
      return;
    }
    if (!freeSize) {
      toast.error('Selectează mărimea pentru tricoul gratuit!');
      return;
    }

    const freeProduct = nationals.find(n => n.team === freeNational);
    const mainVariant = mainProduct.variants?.[mainKit];

    // Create bundle product for cart
    const bundleItem = {
      ...mainProduct,
      isBundle: true,
      bundlePrice: 200,
      selectedKit: mainVariant?.kit || 'first',
      selectedKitName: mainVariant?.name || 'First Kit',
      selectedVariantImage: mainVariant?.images?.[0] || mainProduct.images?.[0],
      freeProduct: {
        name: freeProduct?.name || `Tricou ${freeNational}`,
        team: freeNational,
        size: freeSize,
        image: freeProduct?.variants?.[0]?.images?.[0] || '/images/products/placeholder.jpg'
      }
    };

    addToCart(bundleItem, mainSize);
    toast.success('Bundle adăugat în coș!');
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % promoImages.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + promoImages.length) % promoImages.length);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-neutral-100 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block bg-red-500 text-white px-4 py-1 text-sm font-bold mb-4 animate-pulse">
            🔥 PROMOȚIE LIMITATĂ
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">BUNDLE 1+1 GRATIS</h1>
          <p className="text-neutral-600">Cumperi un tricou de club, primești unul de națională GRATIS!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left - Images */}
          <div className="space-y-4">
            {/* Main Image with Navigation */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <img 
                src={promoImages[currentImage]} 
                alt="Promo Bundle" 
                className="w-full h-auto object-cover"
              />
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {promoImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentImage === idx ? 'bg-[#CCFF00] scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="flex space-x-4">
              {promoImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`flex-1 border-4 rounded overflow-hidden transition-all ${
                    currentImage === idx ? 'border-[#CCFF00]' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Promo ${idx + 1}`} className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>

            {/* Social Proof */}
            <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg flex items-center space-x-3">
              <Users className="w-6 h-6 text-orange-500 animate-pulse" />
              <span className="font-bold text-orange-700">
                +{viewerCount} persoane vizualizează acest produs acum
              </span>
            </div>
          </div>

          {/* Right - Configurator */}
          <div className="space-y-6">
            
            {/* Price Section */}
            <div className="bg-gradient-to-r from-black to-neutral-800 text-white p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 line-through text-xl">300 RON</p>
                  <p className="text-5xl font-bold text-[#CCFF00]">200 RON</p>
                </div>
                <div className="text-right">
                  <div className="bg-[#CCFF00] text-black px-4 py-2 rounded font-bold">
                    <Star className="w-5 h-5 inline mr-1" />
                    ECONOMISEȘTI 100 RON
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-700 text-center">
                <span className="text-[#CCFF00] font-bold">⭐ OFERTA RECOMANDATĂ ⭐</span>
              </div>
            </div>

            {/* Main Product Selection */}
            <div className="bg-white border-2 border-black p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                TRICOU PRINCIPAL (la alegere)
              </h2>

              {/* Product Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Alege tricoul de club</label>
                <select
                  value={mainProduct?.id || ''}
                  onChange={(e) => {
                    const prod = products.find(p => p.id === e.target.value);
                    setMainProduct(prod);
                    setMainKit(0);
                  }}
                  className="w-full border-2 border-neutral-200 p-3 font-bold focus:outline-none focus:border-black"
                >
                  <option value="">-- Selectează echipa --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Kit Selection */}
              {mainProduct && mainProduct.variants && mainProduct.variants.length > 1 && (
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Alege kit-ul</label>
                  <div className="flex space-x-2">
                    {mainProduct.variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setMainKit(idx)}
                        className={`flex-1 py-2 px-4 border-2 font-bold transition-all ${
                          mainKit === idx 
                            ? 'border-black bg-black text-white' 
                            : 'border-neutral-200 hover:border-black'
                        }`}
                      >
                        {v.name || `Kit ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Mărime tricou principal</label>
                <div className="flex space-x-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setMainSize(size)}
                      className={`flex-1 py-3 border-2 font-bold transition-all ${
                        mainSize === size 
                          ? 'border-black bg-black text-white' 
                          : 'border-neutral-200 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Reminder */}
              <div className="bg-yellow-50 border-2 border-yellow-300 p-3 rounded flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Verifică tabelul de mărimi</strong> – Fan și Player Version au sizing diferit!
                </p>
              </div>
            </div>

            {/* Free Product Selection */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center text-green-700">
                <Gift className="w-8 h-8 mr-3 text-green-500" />
                🎁 PRODUS GRATIS INCLUS
              </h2>

              {/* National Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2 text-green-800">Alege națională</label>
                <select
                  value={freeNational}
                  onChange={(e) => setFreeNational(e.target.value)}
                  className="w-full border-2 border-green-300 p-3 font-bold focus:outline-none focus:border-green-500 bg-white"
                >
                  <option value="">-- Selectează națională --</option>
                  {[...new Set(nationals.map(n => n.team))].map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>

              {/* Kit Info */}
              <div className="mb-4 bg-white/50 p-3 rounded">
                <p className="text-sm text-green-700">
                  <strong>Kit:</strong> First Kit (presetat)
                </p>
                <p className="text-sm text-green-700">
                  <strong>Personalizare:</strong> Nu este disponibilă pentru produsul gratuit
                </p>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-bold mb-2 text-green-800">Mărime tricou gratuit</label>
                <div className="flex space-x-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setFreeSize(size)}
                      className={`flex-1 py-3 border-2 font-bold transition-all ${
                        freeSize === size 
                          ? 'border-green-500 bg-green-500 text-white' 
                          : 'border-green-300 bg-white hover:border-green-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#CCFF00] text-black py-5 font-bold text-xl uppercase flex items-center justify-center space-x-3 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              <ShoppingCart className="w-7 h-7" />
              <span>ADAUGĂ ÎN COȘ - 200 RON</span>
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-neutral-100 p-3 rounded">
                <p className="font-bold">🚚 Livrare rapidă</p>
                <p className="text-neutral-600">2-4 zile</p>
              </div>
              <div className="bg-neutral-100 p-3 rounded">
                <p className="font-bold">✅ Calitate premium</p>
                <p className="text-neutral-600">Garantat</p>
              </div>
              <div className="bg-neutral-100 p-3 rounded">
                <p className="font-bold">🔄 Retur gratuit</p>
                <p className="text-neutral-600">14 zile</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
