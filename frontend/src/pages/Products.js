import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Filter, Heart, Shirt, Ruler, Gift, ArrowRight, RotateCcw, ChevronDown, Check } from 'lucide-react';
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
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showFanVsPlayer, setShowFanVsPlayer] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    team: '',
    year: ''
  });

  // Preview 360 state
  const [preview360, setPreview360] = useState({
    expanded: true,
    selectedTeam: '',
    selectedYear: '',
    selectedKit: 0,
    customName: '',
    customNumber: ''
  });

  const isPromo = filters.category === 'promotie-1-1';

  useEffect(() => {
    if (!isPromo) loadProducts();
    loadAllProducts();
  }, [filters]);

  // Load all products for preview 360
  const loadAllProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products?category=echipe-club`);
      setAllProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  // Preview 360 computed values
  const previewTeams = useMemo(() => {
    const teams = [...new Set(allProducts.map(p => p.team))].sort();
    return teams;
  }, [allProducts]);

  const previewYears = useMemo(() => {
    if (!preview360.selectedTeam) return [];
    const years = [...new Set(
      allProducts
        .filter(p => p.team === preview360.selectedTeam)
        .map(p => p.year)
    )].sort();
    return years;
  }, [allProducts, preview360.selectedTeam]);

  const previewProduct = useMemo(() => {
    if (!preview360.selectedTeam || !preview360.selectedYear) return null;
    return allProducts.find(
      p => p.team === preview360.selectedTeam && p.year === parseInt(preview360.selectedYear)
    );
  }, [allProducts, preview360.selectedTeam, preview360.selectedYear]);

  const previewImage = useMemo(() => {
    if (!previewProduct) return null;
    const variant = previewProduct.variants?.[preview360.selectedKit];
    return variant?.images?.[0] || null;
  }, [previewProduct, preview360.selectedKit]);

  const previewLeague = previewProduct?.league || '';

  const handlePreviewTeamChange = (team) => {
    setPreview360(prev => ({
      ...prev,
      selectedTeam: team,
      selectedYear: '',
      selectedKit: 0
    }));
  };

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

        {/* Preview 360° Section */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-neutral-700 rounded-xl p-6 mb-8 shadow-2xl">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setPreview360(prev => ({ ...prev, expanded: !prev.expanded }))}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#CCFF00] rounded-full flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">PREVIEW 360°</h2>
                <p className="text-neutral-400 text-sm">Personalizează și vizualizează tricoul tău</p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-[#CCFF00] transition-transform ${preview360.expanded ? 'rotate-180' : ''}`} />
          </div>

          {preview360.expanded && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Controls */}
              <div className="space-y-4">
                {/* Team Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#CCFF00] mb-2">ECHIPA</label>
                  <select
                    value={preview360.selectedTeam}
                    onChange={(e) => handlePreviewTeamChange(e.target.value)}
                    className="w-full bg-neutral-800 border-2 border-neutral-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#CCFF00] text-base"
                  >
                    <option value="">Selectează echipa...</option>
                    {previewTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>

                {/* Year Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#CCFF00] mb-2">SEZON</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2024, 2025, 2026].map(year => {
                      const available = previewYears.includes(year);
                      const selected = preview360.selectedYear === String(year);
                      return (
                        <button
                          key={year}
                          disabled={!available}
                          onClick={() => setPreview360(prev => ({ ...prev, selectedYear: String(year), selectedKit: 0 }))}
                          className={`py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${
                            selected
                              ? 'border-[#CCFF00] bg-[#CCFF00] text-black'
                              : available 
                                ? 'border-neutral-600 text-white hover:border-neutral-400' 
                                : 'border-neutral-700 text-neutral-600 cursor-not-allowed'
                          }`}
                        >
                          {year}/{String(year + 1).slice(-2)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kit Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#CCFF00] mb-2">KIT</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['First Kit', 'Second Kit', 'Third Kit'].map((kit, idx) => {
                      const available = previewProduct?.variants?.[idx];
                      const selected = preview360.selectedKit === idx;
                      return (
                        <button
                          key={kit}
                          disabled={!available}
                          onClick={() => setPreview360(prev => ({ ...prev, selectedKit: idx }))}
                          className={`py-2.5 rounded-lg border-2 font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                            selected
                              ? 'border-[#CCFF00] bg-[#CCFF00] text-black'
                              : available 
                                ? 'border-neutral-600 text-white hover:border-neutral-400' 
                                : 'border-neutral-700 text-neutral-600 cursor-not-allowed'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3" />}
                          {kit}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customization */}
                <div>
                  <label className="block text-xs font-bold text-[#CCFF00] mb-2">PERSONALIZARE</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={preview360.customName}
                      onChange={(e) => setPreview360(prev => ({ ...prev, customName: e.target.value.toUpperCase() }))}
                      placeholder="NUME (ex: POPESCU)"
                      maxLength={12}
                      className="bg-neutral-800 border-2 border-neutral-600 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#CCFF00] uppercase text-sm"
                    />
                    <input
                      type="number"
                      value={preview360.customNumber}
                      onChange={(e) => setPreview360(prev => ({ ...prev, customNumber: e.target.value }))}
                      placeholder="NR (ex: 10)"
                      min="0"
                      max="99"
                      className="bg-neutral-800 border-2 border-neutral-600 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#CCFF00] text-sm"
                    />
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 mt-4">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-[#CCFF00] font-bold">ℹ️ NOTĂ:</span> Fontul afișat nu este cel oficial, dar pe tricou va fi 
                    <span className="text-white font-medium"> fontul original</span> specific ligii alese. 
                    De exemplu, fontul La Liga diferă de cel UEFA Champions League. 
                    Aceasta este o <span className="text-white font-medium">simulare</span> pentru a vedea plasarea numelui și numărului.
                  </p>
                </div>
              </div>

              {/* Preview Display */}
              <div className="flex flex-col items-center justify-center">
                {previewImage ? (
                  <div className="relative w-full max-w-sm">
                    {/* Jersey Image */}
                    <div className="relative bg-neutral-800 rounded-xl overflow-hidden border-2 border-neutral-700">
                      <img 
                        src={previewImage} 
                        alt={`${preview360.selectedTeam} Preview`}
                        className="w-full aspect-[3/4] object-contain"
                      />
                      
                      {/* Name overlay on back */}
                      {preview360.customName && (
                        <div className="absolute top-[18%] left-1/2 transform -translate-x-1/2 text-center">
                          <span 
                            className="text-white font-black tracking-wider drop-shadow-lg"
                            style={{ 
                              fontSize: preview360.customName.length > 8 ? '1.2rem' : '1.5rem',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.5)',
                              letterSpacing: '0.15em'
                            }}
                          >
                            {preview360.customName}
                          </span>
                        </div>
                      )}
                      
                      {/* Number overlay */}
                      {preview360.customNumber && (
                        <div className="absolute top-[28%] left-1/2 transform -translate-x-1/2 text-center">
                          <span 
                            className="text-white font-black drop-shadow-lg"
                            style={{ 
                              fontSize: '4rem',
                              textShadow: '3px 3px 6px rgba(0,0,0,0.8), -2px -2px 4px rgba(0,0,0,0.5)',
                              lineHeight: 1
                            }}
                          >
                            {preview360.customNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info badge */}
                    <div className="mt-4 text-center">
                      <p className="text-white font-bold text-lg">{preview360.selectedTeam}</p>
                      <p className="text-neutral-400 text-sm">
                        {preview360.selectedYear}/{parseInt(preview360.selectedYear) + 1} • {previewProduct?.variants?.[preview360.selectedKit]?.name}
                      </p>
                      {previewLeague && (
                        <span className="inline-block mt-2 bg-neutral-700 text-[#CCFF00] text-xs font-bold px-3 py-1 rounded-full">
                          {previewLeague}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-sm aspect-[3/4] bg-neutral-800 rounded-xl border-2 border-dashed border-neutral-600 flex flex-col items-center justify-center text-neutral-500">
                    <Shirt className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-sm">Selectează echipa și sezonul</p>
                    <p className="text-xs mt-1">pentru a vedea preview-ul</p>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  {['', 'echipe-club', 'nationale', 'retro', 'limited-edition', 'promotie-1-1'].map(cat => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === cat}
                        onChange={() => setFilters({ ...filters, category: cat })}
                        className="w-4 h-4"
                      />
                      <span className={`text-sm ${
                        cat === 'limited-edition' ? 'font-bold text-orange-600' : 
                        cat === 'promotie-1-1' ? 'font-bold text-green-600' : ''
                      }`}>
                        {cat === '' ? 'Toate' : 
                         cat === 'echipe-club' ? 'Echipe de Club' : 
                         cat === 'nationale' ? 'Naționale' : 
                         cat === 'retro' ? 'Retro' : 
                         cat === 'limited-edition' ? 'Limited Edition' :
                         'PROMOTIE 1+1 GRATIS'}
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
