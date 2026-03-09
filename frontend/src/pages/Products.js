import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Filter, Heart, Shirt, Ruler, Gift, ArrowRight } from 'lucide-react';
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
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showFanVsPlayer, setShowFanVsPlayer] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    team: '',
    year: ''
  });

  const isPromo = filters.category === 'promotie-1-1';

  useEffect(() => {
    if (!isPromo) loadProducts();
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">PRODUSE</h1>
          <p className="text-neutral-500">{products.length} tricouri disponibile</p>
        </div>

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
            <div className="bg-white border border-neutral-200 p-5 sticky top-24">
              {/* Filters Header */}
              <div className="flex items-center space-x-2 mb-5 pb-3 border-b border-neutral-200">
                <Filter className="w-4 h-4" />
                <h2 className="font-bold">FILTRE</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-sm text-neutral-500 uppercase tracking-wider">Categorie</h3>
                <div className="space-y-1">
                  {['', 'echipe-club', 'nationale', 'retro', 'limited-edition', 'promotie-1-1'].map(cat => (
                    <label 
                      key={cat} 
                      className={`flex items-center space-x-3 cursor-pointer p-2.5 rounded-lg transition-all ${
                        filters.category === cat 
                          ? 'bg-black text-white' 
                          : 'hover:bg-neutral-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => setFilters({ ...filters, category: cat })}
                        className="hidden"
                      />
                      <span className={`text-sm font-medium ${
                        cat === 'limited-edition' && filters.category !== cat ? 'text-orange-600' : 
                        cat === 'promotie-1-1' && filters.category !== cat ? 'text-green-600' : ''
                      }`}>
                        {cat === '' ? 'Toate' : 
                         cat === 'echipe-club' ? 'Echipe de Club' : 
                         cat === 'nationale' ? 'Naționale' : 
                         cat === 'retro' ? 'Retro' : 
                         cat === 'limited-edition' ? 'Limited Edition' :
                         'Promoție 1+1'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-sm text-neutral-500 uppercase tracking-wider">Sezon</h3>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full border-2 border-neutral-200 px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#CCFF00] transition-colors"
                >
                  <option value="">Toate Sezoanele</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}/{(year+1).toString().slice(-2)}</option>
                  ))}
                </select>
              </div>

              {/* Team Filter */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-sm text-neutral-500 uppercase tracking-wider">Echipă</h3>
                <input
                  type="text"
                  placeholder="🔍 Caută echipă..."
                  value={filters.team}
                  onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                  className="w-full border-2 border-neutral-200 px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#CCFF00] transition-colors"
                />
              </div>

              <button
                onClick={() => setFilters({ category: '', team: '', year: '' })}
                className="w-full bg-neutral-100 text-neutral-700 py-2.5 rounded-lg font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                RESETEAZĂ FILTRELE
              </button>

              {/* Size Chart Button */}
              <button
                onClick={() => setShowSizeChart(true)}
                className="w-full mt-4 bg-[#CCFF00] text-black py-3 font-bold hover:bg-[#b8e600] transition-colors flex items-center justify-center space-x-2 border-2 border-black"
              >
                <Ruler className="w-5 h-5" />
                <span>TABEL MĂRIMI</span>
              </button>

              {/* Fan vs Player Button */}
              <button
                onClick={() => setShowFanVsPlayer(true)}
                data-testid="fan-vs-player-btn"
                className="w-full mt-3 bg-white text-black py-3 font-bold hover:bg-neutral-100 transition-colors flex items-center justify-center space-x-2 border-2 border-black"
              >
                <Shirt className="w-5 h-5" />
                <span>FAN VS PLAYER VERSION</span>
              </button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {isPromo ? (
              /* Promo Bundle Section */
              <div data-testid="promo-filter-section" className="space-y-6">
                <div className="text-center mb-2">
                  <h2 className="text-3xl sm:text-4xl font-bold">BUNDLE 1+1 GRATIS</h2>
                  <p className="text-neutral-500 mt-1">Cumperi un tricou de club, primesti unul de nationala GRATIS!</p>
                  <div className="inline-block bg-[#CCFF00] text-black px-4 py-1 font-bold text-lg mt-3 border-2 border-black">200 RON</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="overflow-hidden rounded-lg border-2 border-black shadow-lg">
                    <img src="/images/promo-bundle-clubs.jpeg" alt="Bundle Clubs" className="w-full aspect-square object-cover" />
                  </div>
                  <div className="overflow-hidden rounded-lg border-2 border-black shadow-lg">
                    <img src="/images/promo-bundle-nationals.jpeg" alt="Bundle Nationals" className="w-full aspect-square object-cover" />
                  </div>
                </div>
                <button
                  data-testid="promo-filter-cta"
                  onClick={() => navigate('/promotii')}
                  className="w-full bg-[#CCFF00] text-black py-4 font-bold text-lg uppercase flex items-center justify-center gap-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                >
                  <Gift className="w-6 h-6" />
                  CONFIGUREAZA BUNDLE-UL TAU
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ) : loading ? (
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

      {/* Size Chart Modal */}
      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />

      {/* Fan vs Player Modal */}
      {showFanVsPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowFanVsPlayer(false)} />
          <div className="relative bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowFanVsPlayer(false)}
              className="absolute top-3 right-3 z-10 bg-black/10 hover:bg-black/20 p-2 rounded-full"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
            <img src="/images/fan-vs-player.jpg" alt="Fan vs Player" className="w-full rounded-t-lg" />
            <div className="p-5">
              <h3 className="font-bold text-xl mb-4">FAN VS PLAYER VERSION</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold mb-2">FAN VERSION</p>
                  <ul className="space-y-1.5 text-neutral-600">
                    <li>- Material standard, confortabil</li>
                    <li>- Croiala mai larga</li>
                    <li>- Embleme imprimate (serigrafie)</li>
                    <li>- Ideal pentru uzul zilnic</li>
                  </ul>
                </div>
                <div>
                  <p className="font-bold mb-2">PLAYER VERSION</p>
                  <ul className="space-y-1.5 text-neutral-600">
                    <li>- Material tehnic Dri-FIT ADV</li>
                    <li>- Croiala slim, atletica</li>
                    <li>- Embleme cusute/termoadezive</li>
                    <li>- Identic cu cel de pe teren</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
