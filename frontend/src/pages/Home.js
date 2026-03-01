import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CreditCard, Shield, Heart } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { toast } from 'sonner';
import ReviewsSection from '../components/ReviewsSection';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Home() {
  const { formatPrice } = useCurrency();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

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
          backgroundImage: 'url(https://images.unsplash.com/photo-1657957746418-6a38df9e1ea7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHBsYXllciUyMGFjdGlvbiUyMHN0YWRpdW18ZW58MHx8fHwxNzcxMTg2MTQxfDA&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4">
          {/* Price Banner */}
          <div className="bg-[#CCFF00] text-black px-8 py-3 inline-block mb-6 font-bold text-lg tracking-wider shadow-lg">
            ⚡ NICIUN PRODUS NU DEPĂȘEȘTE 200 RON ⚡
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tighter">
            TRICOURI DE FOTBAL<br />
            PENTRU ADEVĂRAȚII FANI
          </h1>
          <p className="text-lg md:text-xl mb-8 text-neutral-200">
            Colecție premium • Echipe de top • Design autentic
          </p>
          <Link 
            to="/products"
            data-testid="hero-cta"
            className="inline-flex items-center space-x-2 bg-[#CCFF00] text-black px-8 py-4 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <span>Vezi Colecția</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-12">CATEGORII</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              data-testid={`category-${category.slug}`}
              className="group relative h-80 overflow-hidden border border-neutral-200 hover:border-black transition-all"
            >
              <img 
                src={category.image_url} 
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
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
                      <p className="text-xl font-bold">{formatPrice(product.price_ron)}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Benefits */}
      <section className="py-16 md:py-24 px-4 md:px-8 lg:px-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div data-testid="benefit-shipping" className="text-center">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">LIVRARE RAPIDĂ</h3>
              <p className="text-neutral-600">Livrare în 1-2sapt, în toată țara</p>
            </div>
            <div data-testid="benefit-payment" className="text-center">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">PLATĂ SECURIZATĂ</h3>
              <p className="text-neutral-600">Tranzacții 100% sigure</p>
            </div>
            <div data-testid="benefit-quality" className="text-center">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-4">
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
    </div>
  );
}
