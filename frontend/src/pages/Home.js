import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Truck, CreditCard, Shield, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { toast } from 'sonner';
import ReviewsSection from '../components/ReviewsSection';
import CountdownModal from '../components/CountdownModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const POPULAR_TEAMS = [
  { name: 'Real Madrid', logo: '/images/logos/real-madrid.png' },
  { name: 'Barcelona', logo: '/images/logos/barcelona.png' },
  { name: 'Manchester United', logo: '/images/logos/manchester-united.png' },
  { name: 'Liverpool', logo: '/images/logos/liverpool.png' },
  { name: 'PSG', logo: '/images/logos/psg.png' },
  { name: 'Bayern Munich', logo: '/images/logos/bayern-munich.png' },
  { name: 'Juventus', logo: '/images/logos/juventus.png' },
  { name: 'AC Milan', logo: '/images/logos/ac-milan.png' },
  { name: 'Arsenal', logo: '/images/logos/arsenal.png' },
  { name: 'Chelsea', logo: '/images/logos/chelsea.png' },
  { name: 'Manchester City', logo: '/images/logos/manchester-city.png' },
  { name: 'Inter Milan', logo: '/images/logos/inter-milan.png' },
  { name: 'Atletico Madrid', logo: '/images/logos/atletico-madrid.png' },
  { name: 'Borussia Dortmund', logo: '/images/logos/borussia-dortmund.png' },
];

function TeamsCarousel({ navigate }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative group/carousel">
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-[#CCFF00] text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center -ml-2 shadow-lg transition-all opacity-0 group-hover/carousel:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {POPULAR_TEAMS.map(team => (
          <button
            key={team.name}
            data-testid={`popular-team-${team.name}`}
            onClick={() => navigate(`/products?category=echipe-club&team=${encodeURIComponent(team.name)}`)}
            className="group flex-shrink-0 flex flex-col items-center w-24 sm:w-28"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-2 border-neutral-200 group-hover:border-[#CCFF00] group-hover:shadow-[0_0_24px_rgba(204,255,0,0.4)] transition-all duration-300 flex items-center justify-center p-3 overflow-hidden">
              <img
                src={team.logo}
                alt={team.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <p className="mt-2 text-xs font-bold text-center group-hover:text-[#CCFF00] transition-colors whitespace-nowrap">{team.name}</p>
          </button>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-[#CCFF00] text-white hover:text-black w-10 h-10 rounded-full flex items-center justify-center -mr-2 shadow-lg transition-all opacity-0 group-hover/carousel:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function Home() {
  const { formatPrice } = useCurrency();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    // Load categories
    axios.get(`${API_URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    // Load featured products
    axios.get(`${API_URL}/api/products`)
      .then(res => setFeaturedProducts(res.data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section 
        data-testid="hero-section"
        className="relative h-[90vh] flex items-center justify-center overflow-hidden mt-20"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/p4urc78a_champions-league-stadium-wallpaper-preview%20%282%29.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        
        {/* Animated particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-[#CCFF00] rounded-full animate-ping"></div>
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-[#CCFF00] rounded-full animate-ping"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          {/* Price Banner with glow effect */}
          <div className="bg-[#CCFF00] text-black px-8 py-3 inline-block mb-6 font-bold text-lg tracking-wider shadow-lg animate-pulse">
            BUNDLE 1+1 GRATIS — DOAR 250 RON
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black mb-6 tracking-tighter leading-none">
            <span className="block">TRICOURI DE</span>
            <span className="block text-[#CCFF00]">FOTBAL</span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold mt-2 text-neutral-300">PENTRU ADEVĂRAȚII FANI</span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 text-neutral-300 max-w-2xl mx-auto">
            Colecție premium • Echipe de top • Design autentic • Livrare rapidă
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/products"
              data-testid="hero-cta"
              className="inline-flex items-center space-x-2 bg-[#CCFF00] text-black px-8 py-4 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span>Vezi Colecția</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            {/* Coming Soon Button */}
            <button 
              onClick={() => setShowCountdown(true)}
              className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all"
            >
              <span>Drop Casual</span>
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-neutral-300">
            <div className="text-center">
              <div className="text-3xl font-black text-[#CCFF00]">250+</div>
              <div className="text-sm">Modele</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#CCFF00]">24h</div>
              <div className="text-sm">Procesare</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-[#CCFF00]">100%</div>
              <div className="text-sm">Calitate</div>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator - hidden on mobile to avoid overlap with stats */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto relative">
        {/* Decorative lime line */}
        <div className="absolute left-1/2 top-0 w-px h-12 bg-gradient-to-b from-transparent via-[#CCFF00] to-transparent -translate-x-1/2"></div>
        
        <div className="text-center mb-12">
          <span className="inline-block bg-[#CCFF00] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">COLECȚII</span>
          <h2 className="text-4xl sm:text-5xl font-bold">CATEGORII</h2>
          <p className="text-neutral-500 mt-3">Alege stilul tău preferat</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Echipe de Club - UCL Logo */}
          <Link
            to="/products?category=echipe-club"
            data-testid="category-echipe-club"
            className="group relative h-80 overflow-hidden border-2 border-neutral-200 hover:border-[#CCFF00] transition-all rounded-xl"
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/1yk9re80_c6nfDmk7nEFkdMpAQYzEK4-1000-80.jpg" 
              alt="Echipe de Club"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
              <h3 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">
                Echipe de Club
              </h3>
              <span className="text-[#CCFF00] text-sm font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                VEZI COLECȚIA →
              </span>
            </div>
          </Link>

          {/* Naționale - UNL Logo */}
          <Link
            to="/products?category=nationale"
            data-testid="category-nationale"
            className="group relative h-80 overflow-hidden border-2 border-neutral-200 hover:border-[#CCFF00] transition-all rounded-xl"
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/z1r6jhop_UNL_Press-release_150-dpi_Logo.avif" 
              alt="Naționale"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
              <h3 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">
                Naționale
              </h3>
              <span className="text-[#CCFF00] text-sm font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                VEZI COLECȚIA →
              </span>
            </div>
          </Link>

          {/* Retro - Black & White */}
          <Link
            to="/products?category=retro"
            data-testid="category-retro"
            className="group relative h-80 overflow-hidden border-2 border-neutral-200 hover:border-[#CCFF00] transition-all rounded-xl"
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/izlhyft1_black-white-horizontal-photo-soccer-600nw-2489059367.webp" 
              alt="Retro"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
              <h3 className="text-3xl font-bold text-white uppercase tracking-tighter mb-2">
                Retro
              </h3>
              <span className="text-[#CCFF00] text-sm font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                VEZI COLECȚIA →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Echipe Populare */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block bg-[#CCFF00] text-white text-xs font-bold px-4 py-1 rounded-full mb-4">ECHIPE</span>
          <h2 className="text-3xl sm:text-4xl font-bold">ECHIPE POPULARE</h2>
          <p className="text-neutral-500 mt-2">Click pe echipa preferata pentru a vedea toate tricourile</p>
        </div>
        <TeamsCarousel navigate={navigate} />
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">PRODUSE POPULARE</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => {
              // Get first image from first variant or fallback
              const productImage = product.variants && product.variants.length > 0 && product.variants[0].images && product.variants[0].images.length > 0
                ? product.variants[0].images[0]
                : (product.images && product.images.length > 0 
                  ? product.images[0] 
                  : 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=400');
              
              return (
                <div
                  key={product.id}
                  data-testid={`product-${product.id}`}
                  className="group bg-white border border-neutral-100 hover:border-black hover:shadow-xl transition-all relative"
                >
                  {/* Favorite Heart */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(product);
                      toast.success(isFavorite(product.id) ? 'Șters din favorite' : 'Adăugat la favorite');
                    }}
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
                      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                      <p className="text-sm text-neutral-500 mb-2">{product.team} • {product.year}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold">{formatPrice(product.price_ron)}</p>
                        {/* In Stock indicator */}
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                          </span>
                          <span className="text-xs font-medium text-green-600">In Stock</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 bg-neutral-50 relative overflow-hidden">
        {/* Decorative lime elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#CCFF00]/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#CCFF00]/10 rounded-full translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-[#CCFF00] rounded-full"></div>
        <div className="absolute top-20 left-1/4 w-1 h-1 bg-[#CCFF00] rounded-full"></div>
        
        <div className="max-w-7xl mx-auto relative">
          {/* Section header with lime accent */}
          <div className="text-center mb-12">
            <span className="inline-block bg-[#CCFF00] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">DE CE NOI</span>
            <h2 className="text-3xl md:text-4xl font-bold">Servicii Premium</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div data-testid="benefit-shipping" className="text-center group">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4 rounded-2xl group-hover:bg-[#CCFF00] group-hover:text-black transition-all duration-300">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">LIVRARE RAPIDĂ</h3>
              <p className="text-neutral-600">Livrare în 1-2 săpt, în toată țara</p>
            </div>
            <div data-testid="benefit-payment" className="text-center group">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4 rounded-2xl group-hover:bg-[#CCFF00] group-hover:text-black transition-all duration-300">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">PLATĂ SECURIZATĂ</h3>
              <p className="text-neutral-600">Tranzacții 100% sigure</p>
            </div>
            <div data-testid="benefit-quality" className="text-center group">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4 rounded-2xl group-hover:bg-[#CCFF00] group-hover:text-black transition-all duration-300">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">PRODUSE PREMIUM</h3>
              <p className="text-neutral-600">Calitate garantată</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />
      
      {/* Countdown Modal */}
      <CountdownModal isOpen={showCountdown} onClose={() => setShowCountdown(false)} />
    </div>
  );
}
