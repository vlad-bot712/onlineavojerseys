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
              <h3 className="font-bold text-xl mb-2">PRECOMANDĂ SPECIAL — ORICE TRICOU!</h3>
              <p className="text-sm mb-3">
                Nu găsești echipa sau sezonul dorit? Poți comanda <span className="font-bold">ORICE TRICOU</span> inclusiv ediții limitate (Limited Edition)!
              </p>
              <div className="bg-black text-white px-4 py-2 inline-block">
                <p className="text-sm font-bold">
                  Trimite o poză la: <a href="mailto:avojerseys@gmail.com" className="underline hover:text-[#CCFF00]">avojerseys@gmail.com</a>
                </p>
              </div>
              <p className="text-xs mt-2 text-neutral-700">
                Vei primi răspuns rapid cu disponibilitate și preț!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Modern Design */}
          <aside className="lg:col-span-1">
            <div className="bg-neutral-50 rounded-2xl p-6 sticky top-24 shadow-sm">
              {/* Filters Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Filtre</h2>
                  <p className="text-xs text-neutral-400">Rafinează căutarea</p>
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-xs text-neutral-400 uppercase tracking-widest">Categorie</h3>
                <div className="space-y-1.5">
                  {['', 'echipe-club', 'nationale', 'retro', 'limited-edition', 'promotie-1-1'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilters({ ...filters, category: cat })}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        filters.category === cat 
                          ? 'bg-black text-white shadow-lg' 
                          : 'bg-white hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {cat === '' ? 'Toate Produsele' : 
                         cat === 'echipe-club' ? 'Echipe de Club' : 
                         cat === 'nationale' ? 'Echipe Naționale' : 
                         cat === 'retro' ? 'Colecția Retro' : 
                         cat === 'limited-edition' ? 'Limited Edition' :
                         'Bundle 1+1'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Year Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-xs text-neutral-400 uppercase tracking-widest">Sezon</h3>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full bg-white border-0 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 transition-all text-sm font-medium appearance-none cursor-pointer"
                  style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px'}}
                >
                  <option value="">Toate Sezoanele</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}/{(year+1).toString().slice(-2)}</option>
                  ))}
                </select>
              </div>

              {/* Team Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-xs text-neutral-400 uppercase tracking-widest">Caută Echipă</h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Real Madrid..."
                    value={filters.team}
                    onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                    className="w-full bg-white border-0 pl-4 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 transition-all text-sm"
                  />
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-neutral-200 my-6"></div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowSizeChart(true)}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                >
                  <Ruler className="w-4 h-4" />
                  Tabel Mărimi
                </button>

                <button
                  onClick={() => setShowFanVsPlayer(true)}
                  data-testid="fan-vs-player-btn"
                  className="w-full bg-white text-black py-3.5 rounded-xl font-semibold text-sm hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 border border-neutral-200"
                >
                  <Shirt className="w-4 h-4" />
                  Fan vs Player
                </button>

                {(filters.category || filters.team || filters.year) && (
                  <button
                    onClick={() => setFilters({ category: '', team: '', year: '' })}
                    className="w-full text-neutral-500 py-2 text-sm font-medium hover:text-black transition-colors flex items-center justify-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Șterge filtrele
                  </button>
                )}
              </div>
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
                  <div className="inline-block bg-[#CCFF00] text-black px-4 py-1 font-bold text-lg mt-3 border-2 border-black">250 RON</div>
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
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold">{formatPrice(product.price_ron)}</p>
                            {/* In Stock indicator with pulse effect */}
                            <div className="flex items-center gap-1.5">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                              </span>
                              <span className="text-xs font-medium text-green-600">In Stock</span>
                            </div>
                          </div>
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
