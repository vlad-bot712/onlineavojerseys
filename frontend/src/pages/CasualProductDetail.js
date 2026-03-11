import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Ruler, ChevronLeft, Check } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import SizeHelper from '../components/SizeHelper';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function resolveImage(imagePath) {
  return imagePath + '.jpg';
}

export default function CasualProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeHelper, setShowSizeHelper] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/casual-products/${id}`)
      .then(res => { setProduct(res.data); setLoading(false); })
      .catch(() => { setLoading(false); navigate('/casual'); });
  }, [id, navigate]);

  // Reset image index when color changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setImgError(false);
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const currentColor = product.colors[selectedColor];
  const colorImages = currentColor.images || [currentColor.image];
  const currentImage = colorImages[selectedImageIndex] || colorImages[0];
  const imgSrc = imgError ? currentImage + '.svg' : resolveImage(currentImage);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Selectează o mărime!');
      return;
    }
    // Use sale price if available
    const finalPrice = product.sale_price_ron && product.sale_price_ron < product.price_ron 
      ? product.sale_price_ron 
      : product.price_ron;
    
    // Build product object in the format CartContext expects
    const cartProduct = {
      id: product.id,
      name: product.name,
      price_ron: finalPrice,
      original_price_ron: product.price_ron,
      images: [resolveImage(currentColor.image)],
      selectedVariantImage: resolveImage(currentColor.image),
      customization: { color: currentColor.name },
      isCasual: true, // Mark as casual product
      category: product.category,
    };
    addToCart(cartProduct, selectedSize);
    setAdded(true);
    toast.success('Adăugat în coș!');
    setTimeout(() => setAdded(false), 2000);
  };

  const CATEGORY_LABELS = {
    'pantaloni-scurti': 'Pantaloni Scurți',
    'pantaloni-lungi': 'Pantaloni Lungi',
    'vesta': 'Vestă',
    'tricouri': 'Tricouri',
    'geaca': 'Geacă',
    'hanorac': 'Hanorac',
    'papuci': 'Papuci',
    'papuci-fotbal': 'Papuci de Fotbal',
  };

  const hasDiscount = product.sale_price_ron && product.sale_price_ron < product.price_ron;

  return (
    <div data-testid="casual-product-detail" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-8">
          <Link to="/casual" className="hover:text-black transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Casual
          </Link>
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left - Image Gallery */}
          <div>
            <div className="aspect-square bg-neutral-50 overflow-hidden relative">
              <img
                src={imgSrc}
                alt={`${product.name} - ${currentColor.name}`}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
            
            {/* Gallery thumbnails - all images for current color */}
            {(() => {
              const hasMultipleImages = colorImages.length > 1 || product.colors.length > 1;
              
              if (!hasMultipleImages) return null;
              
              return (
                <div className="flex flex-wrap gap-2 mt-3">
                  {/* Show all images for current color */}
                  {colorImages.map((img, imgIdx) => {
                    const thumbSrc = (img.startsWith('/') ? img : img) + '.jpg';
                    const isActive = imgIdx === selectedImageIndex;
                    return (
                      <button
                        key={`${currentColor.slug}-${imgIdx}`}
                        onClick={() => {
                          setSelectedImageIndex(imgIdx);
                          setImgError(false);
                        }}
                        className={`w-16 h-16 overflow-hidden border-2 transition-all ${
                          isActive ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <img 
                          src={thumbSrc} 
                          alt={`${currentColor.name} ${imgIdx + 1}`} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.src = img + '.svg'; }} 
                        />
                      </button>
                    );
                  })}
                  
                  {/* Color separator if multiple colors */}
                  {product.colors.length > 1 && colorImages.length > 1 && (
                    <div className="w-px h-16 bg-neutral-200 mx-1" />
                  )}
                  
                  {/* Other colors */}
                  {product.colors.length > 1 && product.colors.map((c, i) => {
                    if (i === selectedColor) return null;
                    const thumbSrc = c.image + '.jpg';
                    return (
                      <button
                        key={c.slug}
                        data-testid={`detail-thumb-${c.slug}`}
                        onClick={() => { setSelectedColor(i); setImgError(false); }}
                        className="w-16 h-16 overflow-hidden border-2 border-neutral-200 hover:border-neutral-400 transition-all opacity-60 hover:opacity-100"
                      >
                        <img src={thumbSrc} alt={c.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = c.image + '.svg'; }} />
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Right - Details */}
          <div>
            <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-1">
              {CATEGORY_LABELS[product.category] || product.category}
            </p>
            <h1
              data-testid="detail-product-name"
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {product.name}
            </h1>
            <p className="text-neutral-500 text-sm mb-6">{product.description}</p>

            {/* Price */}
            <div data-testid="detail-price" className="mb-8">
              {hasDiscount ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-red-500">
                    {formatPrice(product.sale_price_ron)}
                  </span>
                  <span className="text-xl text-neutral-400 line-through">
                    {formatPrice(product.price_ron)}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 text-sm font-bold">
                    -{Math.round(100 - (product.sale_price_ron / product.price_ron * 100))}%
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold">
                  {formatPrice(product.price_ron)}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="w-8 h-[2px] bg-[#CCFF00] mb-6" />

            {/* Color */}
            <div className="mb-6">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Culoare — <span className="text-black">{currentColor.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c, i) => (
                  <button
                    key={c.slug}
                    data-testid={`detail-color-${c.slug}`}
                    onClick={() => { setSelectedColor(i); setImgError(false); }}
                    className={`px-4 py-2 text-sm font-semibold border-2 transition-all ${
                      i === selectedColor
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-black text-neutral-600'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Mărime {selectedSize && <span className="text-black">— {selectedSize}</span>}
                </p>
                <button
                  data-testid="detail-size-help"
                  onClick={() => setShowSizeHelper(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#CCFF00] bg-black px-3 py-1.5 hover:bg-[#CCFF00] hover:text-black transition-all"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  AJUTOR MĂRIMI
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    data-testid={`detail-size-${s}`}
                    onClick={() => setSelectedSize(s)}
                    className={`w-14 h-12 text-sm font-bold border-2 transition-all ${
                      s === selectedSize
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart */}
            <button
              data-testid="detail-add-cart"
              onClick={handleAddToCart}
              className={`w-full flex items-center justify-center gap-2 py-4 font-bold text-base uppercase tracking-wider transition-all ${
                added
                  ? 'bg-[#CCFF00] text-black'
                  : 'bg-black text-white hover:bg-[#CCFF00] hover:text-black'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Adăugat!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Adaugă în Coș
                </>
              )}
            </button>

            {/* Info */}
            <div className="mt-6 space-y-2 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#CCFF00] rounded-full" />
                Livrare în 1-2 săptămâni
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#CCFF00] rounded-full" />
                Material premium, confortabil
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-[#CCFF00] rounded-full" />
                Plată la livrare sau online
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeHelper
        isOpen={showSizeHelper}
        onClose={() => setShowSizeHelper(false)}
        preselectedType={product.garment_type}
      />
    </div>
  );
}
