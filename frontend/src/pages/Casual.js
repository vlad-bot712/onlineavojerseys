import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Ruler, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import SizeHelper from '../components/SizeHelper';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_LABELS = {
  'pantaloni-scurti': 'Pantaloni Scurți',
  'pantaloni-lungi': 'Pantaloni Lungi',
  'vesta': 'Vestă',
  'tricouri': 'Tricouri',
};

const CATEGORIES = ['pantaloni-scurti', 'pantaloni-lungi', 'vesta', 'tricouri'];

function resolveImage(imagePath) {
  // Try jpg first, fallback to svg placeholder
  return imagePath + '.jpg';
}

function ProductCard({ product }) {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeHelper, setShowSizeHelper] = useState(false);
  const [imgError, setImgError] = useState(false);

  const currentColor = product.colors[selectedColor];
  const imgSrc = imgError
    ? currentColor.image + '.svg'
    : resolveImage(currentColor.image);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Selectează o mărime!');
      return;
    }
    addToCart({
      product_id: product.id,
      product_name: product.name,
      product_image: resolveImage(currentColor.image),
      size: selectedSize,
      quantity: 1,
      price_ron: product.price_ron,
      customization: { color: currentColor.name },
    });
    toast.success('Adăugat în coș!');
  };

  return (
    <div data-testid={`casual-product-${product.slug}`} className="group bg-white border border-neutral-100 hover:border-neutral-300 transition-all">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-neutral-50 relative">
        <img
          src={imgSrc}
          alt={`${product.name} - ${currentColor.name}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 text-sm font-bold">
          {formatPrice(product.price_ron)}
        </div>
      </div>

      <div className="p-4">
        {/* Name */}
        <h3 className="font-bold text-base mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-neutral-400 mb-3 line-clamp-2">{product.description}</p>

        {/* Colors */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">Culoare</p>
          <div className="flex flex-wrap gap-1.5">
            {product.colors.map((c, i) => (
              <button
                key={c.slug}
                data-testid={`color-${product.slug}-${c.slug}`}
                onClick={() => { setSelectedColor(i); setImgError(false); }}
                title={c.name}
                className={`px-2.5 py-1 text-[11px] font-medium border-2 transition-all ${
                  i === selectedColor
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 hover:border-neutral-400 text-neutral-600'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Mărime</p>
            <button
              data-testid={`size-help-${product.slug}`}
              onClick={() => setShowSizeHelper(true)}
              className="flex items-center gap-1 text-[10px] font-bold text-[#CCFF00] bg-black px-2 py-0.5 hover:bg-[#CCFF00] hover:text-black transition-all"
            >
              <Ruler className="w-3 h-3" />
              AJUTOR MĂRIMI
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map(s => (
              <button
                key={s}
                data-testid={`size-${product.slug}-${s}`}
                onClick={() => setSelectedSize(s)}
                className={`w-10 h-10 text-xs font-bold border-2 transition-all ${
                  s === selectedSize
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Add to cart */}
        <button
          data-testid={`add-cart-${product.slug}`}
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          Adaugă în Coș
        </button>
      </div>

      <SizeHelper
        isOpen={showSizeHelper}
        onClose={() => setShowSizeHelper(false)}
        preselectedType={product.garment_type}
      />
    </div>
  );
}

export default function Casual() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const [settingsRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/api/settings/casual`),
          axios.get(`${API_URL}/api/casual-products?force=true`),
        ]);
        setVisible(settingsRes.data.casual_visible);
        setProducts(productsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Coming soon state
  if (!visible) {
    return (
      <div data-testid="casual-coming-soon" className="pt-24 pb-16 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 text-center py-32">
          <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-3">Coming Soon</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            DROP CASUAL
          </h1>
          <p className="text-neutral-400 mb-8">
            Colecția noastră de haine casual se lansează pe 15 Martie 2026. Revino curând!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 font-bold text-sm uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black transition-all"
          >
            Înapoi Acasă
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="casual-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-2">Colecție Casual</p>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CASUAL
          </h1>
          <p className="text-neutral-400 text-sm mt-1">{products.length} produse disponibile</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            data-testid="casual-filter-all"
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
              activeCategory === 'all'
                ? 'border-black bg-black text-white'
                : 'border-neutral-200 hover:border-black'
            }`}
          >
            Toate ({products.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = products.filter(p => p.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                data-testid={`casual-filter-${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                  activeCategory === cat
                    ? 'border-black bg-black text-white'
                    : 'border-neutral-200 hover:border-black'
                }`}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Lime divider */}
        <div className="w-12 h-[2px] bg-[#CCFF00] mb-8" />

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-lg font-semibold">Niciun produs în această categorie</p>
          </div>
        )}
      </div>
    </div>
  );
}
