import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_LABELS = {
  'pantaloni-scurti': 'Pantaloni Scurți',
  'pantaloni-lungi': 'Pantaloni Lungi',
  'vesta': 'Vestă',
  'tricouri': 'Tricouri',
};

const CATEGORIES = ['pantaloni-scurti', 'pantaloni-lungi', 'vesta', 'tricouri'];

function ProductCard({ product }) {
  const { formatPrice } = useCurrency();
  const [imgError, setImgError] = useState(false);
  const firstColor = product.colors[0];
  const imgSrc = imgError ? firstColor.image + '.svg' : firstColor.image + '.jpg';
  const hasDiscount = product.sale_price_ron && product.sale_price_ron < product.price_ron;

  return (
    <Link
      to={`/casual/${product.id}`}
      data-testid={`casual-product-${product.slug}`}
      className="group bg-white border border-neutral-100 hover:border-neutral-300 transition-all block"
    >
      <div className="aspect-square overflow-hidden bg-neutral-50 relative">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {/* Price badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {hasDiscount ? (
            <>
              <span className="bg-red-500 text-white px-3 py-1 text-sm font-bold">
                {formatPrice(product.sale_price_ron)}
              </span>
              <span className="bg-neutral-600 text-white px-2 py-0.5 text-xs line-through">
                {formatPrice(product.price_ron)}
              </span>
            </>
          ) : (
            <span className="bg-black text-white px-3 py-1 text-sm font-bold">
              {formatPrice(product.price_ron)}
            </span>
          )}
        </div>
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-bold">
            -{Math.round(100 - (product.sale_price_ron / product.price_ron * 100))}%
          </div>
        )}
        {/* Out of stock */}
        {product.in_stock === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 font-bold">STOC EPUIZAT</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-neutral-400">
          {product.colors.length} {product.colors.length === 1 ? 'culoare' : 'culori'} &middot; {product.sizes.length} mărimi
        </p>
      </div>
    </Link>
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
        <div className="mb-8">
          <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-2">Colecție Casual</p>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CASUAL
          </h1>
          <p className="text-neutral-400 text-sm mt-1">{products.length} produse disponibile</p>
        </div>

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

        <div className="w-12 h-[2px] bg-[#CCFF00] mb-8" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
