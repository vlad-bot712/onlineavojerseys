import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, Shield, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { toast } from 'sonner';
import ReviewsSection from '../components/ReviewsSection';
import CountdownModal from '../components/CountdownModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HERO_IMAGES = [
  'https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/p4urc78a_champions-league-stadium-wallpaper-preview%20%282%29.jpg',
  'https://images.unsplash.com/photo-1604068769565-2c51b6c19830?w=2400&q=85',
  'https://images.unsplash.com/photo-1573559055341-51c1ced2b864?w=2400&q=85',
  'https://images.unsplash.com/photo-1767916732786-a83902ffc25c?w=2400&q=85',
];

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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [checkScroll]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.55;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          data-testid="carousel-arrow-left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center -ml-1 shadow-lg hover:bg-[#CCFF00] hover:text-black transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth px-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {POPULAR_TEAMS.map(team => (
          <button
            key={team.name}
            data-testid={`popular-team-${team.name}`}
            onClick={() => navigate(`/products?category=echipe-club&team=${encodeURIComponent(team.name)}`)}
            className="group flex-shrink-0 flex flex-col items-center"
          >
            <div className="w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] bg-white rounded-2xl border border-neutral-200 flex items-center justify-center p-3 sm:p-4 transition-all duration-300 group-hover:border-[#CCFF00] group-hover:shadow-[0_0_16px_rgba(204,255,0,0.25)]">
              <img
                src={team.logo}
                alt={team.name}
                draggable={false}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="mt-2.5 text-[11px] sm:text-xs font-semibold text-neutral-600 group-hover:text-black transition-colors text-center leading-tight max-w-[80px]">
              {team.name}
            </span>
          </button>
        ))}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          data-testid="carousel-arrow-right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center -mr-1 shadow-lg hover:bg-[#CCFF00] hover:text-black transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
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
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    axios.get(`${API_URL}/api/categories`)
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
    axios.get(`${API_URL}/api/products`)
      .then(res => setFeaturedProducts(res.data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div data-testid="home-page">
      {/* ═══ HERO SECTION ═══ */}
      <section
        data-testid="hero-section"
        className="relative h-[90vh] flex items-center justify-center overflow-hidden mt-20"
      >
        {/* Slideshow backgrounds */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === heroIdx ? 1 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        {/* Slideshow indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              data-testid={`hero-dot-${i}`}
              onClick={() => setHeroIdx(i)}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                i === heroIdx ? 'w-8 bg-[#CCFF00]' : 'w-4 bg-white/30'
              }`}
            />
          ))}
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#CCFF00] text-black px-5 py-2 mb-8 text-sm font-bold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-black rounded-full" />
            BUNDLE 1+1 GRATIS — DOAR 250 RON
          </div>

          <h1
            className="mb-6 leading-[1.1]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="block text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              TRICOURI DE
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-[#CCFF00] mt-1">
              FOTBAL
            </span>
            <span className="block text-lg sm:text-xl lg:text-2xl font-medium mt-4 text-white/70 tracking-wide">
              PENTRU ADEVĂRAȚII FANI
            </span>
          </h1>

          <p className="text-base text-white/50 mb-10 max-w-xl mx-auto tracking-wide">
            Colecție premium &middot; Echipe de top &middot; Design autentic &middot; Livrare rapidă
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              data-testid="hero-cta"
              className="inline-flex items-center gap-3 bg-[#CCFF00] text-black px-8 py-4 font-bold uppercase tracking-wider hover:bg-white transition-colors"
            >
              Vezi Colecția
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setShowCountdown(true)}
              className="inline-flex items-center gap-3 border border-white/30 text-white px-8 py-4 font-bold uppercase tracking-wider hover:border-white hover:bg-white/5 transition-all"
            >
              Drop Casual
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-14 flex justify-center gap-12 text-white/60">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#CCFF00]">250+</div>
              <div className="text-xs uppercase tracking-widest mt-1">Modele</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#CCFF00]">24h</div>
              <div className="text-xs uppercase tracking-widest mt-1">Procesare</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-[#CCFF00]">100%</div>
              <div className="text-xs uppercase tracking-widest mt-1">Calitate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ LIME DIVIDER ═══ */}
      <div className="flex justify-center py-8">
        <div className="w-12 h-[2px] bg-[#CCFF00]" />
      </div>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-12 md:py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-2">Colecții</p>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CATEGORII
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Echipe de Club */}
          <Link
            to="/products?category=echipe-club"
            data-testid="category-echipe-club"
            className="group relative h-72 overflow-hidden"
          >
            <img
              src="https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/1yk9re80_c6nfDmk7nEFkdMpAQYzEK4-1000-80.jpg"
              alt="Echipe de Club"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Echipe de Club
              </h3>
              <div className="mt-2 h-[2px] w-0 bg-[#CCFF00] group-hover:w-12 transition-all duration-500" />
            </div>
          </Link>

          {/* Naționale */}
          <Link
            to="/products?category=nationale"
            data-testid="category-nationale"
            className="group relative h-72 overflow-hidden"
          >
            <img
              src="https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/z1r6jhop_UNL_Press-release_150-dpi_Logo.avif"
              alt="Naționale"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Naționale
              </h3>
              <div className="mt-2 h-[2px] w-0 bg-[#CCFF00] group-hover:w-12 transition-all duration-500" />
            </div>
          </Link>

          {/* Retro */}
          <Link
            to="/products?category=retro"
            data-testid="category-retro"
            className="group relative h-72 overflow-hidden"
          >
            <img
              src="https://customer-assets.emergentagent.com/job_change-maker-18/artifacts/izlhyft1_black-white-horizontal-photo-soccer-600nw-2489059367.webp"
              alt="Retro"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Retro
              </h3>
              <div className="mt-2 h-[2px] w-0 bg-[#CCFF00] group-hover:w-12 transition-all duration-500" />
            </div>
          </Link>
        </div>
      </section>

      {/* ═══ POPULAR TEAMS ═══ */}
      <section className="py-12 md:py-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-2">Echipe</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ECHIPE POPULARE
            </h2>
          </div>
          <Link
            to="/products?category=echipe-club"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-black transition-colors"
          >
            Vezi toate
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <TeamsCarousel navigate={navigate} />
      </section>

      {/* ═══ LIME DIVIDER ═══ */}
      <div className="flex justify-center py-6">
        <div className="w-12 h-[2px] bg-[#CCFF00]" />
      </div>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-2">Trending</p>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                PRODUSE POPULARE
              </h2>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-black transition-colors"
            >
              Vezi toate
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map(product => {
              const productImage = product.variants?.[0]?.images?.[0]
                || product.images?.[0]
                || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=400';

              return (
                <div
                  key={product.id}
                  data-testid={`product-${product.id}`}
                  className="group bg-white border border-neutral-100 hover:border-neutral-300 transition-all relative"
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(product);
                      toast.success(isFavorite(product.id) ? 'Șters din favorite' : 'Adăugat la favorite');
                    }}
                    className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-[#CCFF00]"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
                  </button>

                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-neutral-50">
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-neutral-400 mb-3">{product.team} &middot; {product.year}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">{formatPrice(product.price_ron)}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">In Stock</span>
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

      {/* ═══ BENEFITS ═══ */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-[0.2em] mb-2">De ce noi</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              SERVICII PREMIUM
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div data-testid="benefit-shipping" className="text-center">
              <div className="w-14 h-14 border border-[#CCFF00]/30 flex items-center justify-center mx-auto mb-5">
                <Truck className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider mb-2">Livrare Rapidă</h3>
              <p className="text-sm text-white/40">Livrare în 1-2 săpt, în toată țara</p>
            </div>
            <div data-testid="benefit-payment" className="text-center">
              <div className="w-14 h-14 border border-[#CCFF00]/30 flex items-center justify-center mx-auto mb-5">
                <CreditCard className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider mb-2">Plată Securizată</h3>
              <p className="text-sm text-white/40">Tranzacții 100% sigure</p>
            </div>
            <div data-testid="benefit-quality" className="text-center">
              <div className="w-14 h-14 border border-[#CCFF00]/30 flex items-center justify-center mx-auto mb-5">
                <Shield className="w-6 h-6 text-[#CCFF00]" />
              </div>
              <h3 className="text-base font-bold uppercase tracking-wider mb-2">Produse Premium</h3>
              <p className="text-sm text-white/40">Calitate garantată</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS ═══ */}
      <ReviewsSection />

      {/* Countdown Modal */}
      <CountdownModal isOpen={showCountdown} onClose={() => setShowCountdown(false)} />
    </div>
  );
}
