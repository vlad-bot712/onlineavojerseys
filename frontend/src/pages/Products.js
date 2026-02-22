import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Filter, Heart, Shirt, Ruler } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { toast } from 'sonner';
import SizeChartModal from '../components/SizeChartModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Products() {
  const { formatPrice } = useCurrency();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    team: '',
    year: ''
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.team) params.team = filters.team;
      if (filters.year) params.year = filters.year;

      const res = await axios.get(`${API_URL}/api/products`, { params });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate year options based on category
  const getYearOptions = () => {
    if (filters.category === 'nationale') {
      // Naționale: 2023 onwards
      return [2023, 2024, 2025, 2026];
    } else if (filters.category === 'echipe-club') {
      // Cluburi: 2023 onwards
      return [2023, 2024, 2025, 2026];
    } else {
      // All years from 2023 onwards
      return [2023, 2024, 2025, 2026];
    }
  };

  const years = getYearOptions();

  return (
    <div data-testid="products-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">PRODUSE</h1>

        {/* Preorder Banner */}
        <div className="bg-[#CCFF00] border-2 border-black p-6 mb-8 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Shirt className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">🌟 PRECOMANDĂ SPECIAL - ORICE TRICOU!</h3>
              <p className="text-sm mb-3">
                Nu găsești echipa sau sezonul dorit? Poți comanda <span className="font-bold">ORICE TRICOU</span> inclusiv ediții limitate (Limited Edition)!
              </p>
              <div className="bg-black text-white px-4 py-2 inline-block">
                <p className="text-sm font-bold">
                  📧 Trimite o poză la: <a href="mailto:avojerseys@gmail.com" className="underline hover:text-[#CCFF00]">avojerseys@gmail.com</a>
                </p>
              </div>
              <p className="text-xs mt-2 text-neutral-700">
                ⚡ Vei primi răspuns rapid cu disponibilitate și preț!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="w-5 h-5" />
                <h2 className="text-xl font-bold">FILTRE</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">CATEGORIE</h3>
                <div className="space-y-2">
                  {['', 'echipe-club', 'nationale', 'retro'].map(cat => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => setFilters({ ...filters, category: cat })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {cat === '' ? 'Toate' : cat === 'echipe-club' ? 'Echipe de Club' : cat === 'nationale' ? 'Naționale' : 'Retro'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">AN</h3>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full border border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
                >
                  <option value="">Toate</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Team Filter */}
              <div>
                <h3 className="font-bold mb-3">ECHIPĂ</h3>
                <input
                  type="text"
                  placeholder="Caută echipă..."
                  value={filters.team}
                  onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                  className="w-full border border-neutral-200 px-3 py-2 focus:outline-none focus:border-black"
                />
              </div>

              <button
                onClick={() => setFilters({ category: '', team: '', year: '' })}
                className="w-full mt-6 bg-black text-white py-2 font-bold hover:bg-neutral-800 transition-colors"
              >
                RESETEAZĂ FILTRE
              </button>

              {/* Size Chart Button */}
              <button
                onClick={() => setShowSizeChart(true)}
                className="w-full mt-4 bg-[#CCFF00] text-black py-3 font-bold hover:bg-[#b8e600] transition-colors flex items-center justify-center space-x-2 border-2 border-black"
              >
                <Ruler className="w-5 h-5" />
                <span>TABEL MĂRIMI</span>
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">Se încarcă...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-neutral-500">Nu au fost găsite produse.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => {
                  // Get first image from first variant or fallback
                  const productImage = product.variants && product.variants.length > 0 && product.variants[0].images && product.variants[0].images.length > 0
                    ? product.variants[0].images[0]
                    : (product.images && product.images.length > 0 
                      ? product.images[0] 
                      : 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=400');
                  
                  return (
                    <div
                      key={product.id}
                      data-testid={`product-card-${product.id}`}
                      className="group bg-white border border-neutral-100 hover:border-black hover:shadow-xl transition-all relative"
                    >
                      {/* Favorite Heart */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(product);
                          toast.success(isFavorite(product.id) ? 'Șters din favorite' : 'Adăugat la favorite');
                        }}
                        data-testid={`favorite-btn-${product.id}`}
                        className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-[#CCFF00] transition-all"
                      >
                        <Heart 
                          className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`}
                        />
                      </button>

                      <Link to={`/products/${product.id}`}>
                        <div className="aspect-square overflow-hidden">
                          <img 
                            src={productImage} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-neutral-500 mb-2">{product.team} • {product.year}</p>
                          <p className="text-xl font-bold">{formatPrice(product.price_ron)}</p>
                          {product.variants && product.variants.length > 0 && (
                            <p className="text-xs text-neutral-500 mt-1">{product.variants.length} variante disponibile</p>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
