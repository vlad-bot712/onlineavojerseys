import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';

export default function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (product) => {
    addToCart(product, 'M'); // Default size
    toast.success('Produs adăugat în coș!');
  };

  if (favorites.length === 0) {
    return (
      <div data-testid="favorites-empty" className="pt-24 pb-16 min-h-screen flex flex-col items-center justify-center">
        <Heart className="w-20 h-20 text-neutral-300 mb-4" />
        <h1 className="text-4xl font-bold mb-4">NICIUN PRODUS FAVORIT</h1>
        <p className="text-neutral-600 mb-8">Adaugă produse la favorite pentru a le găsi mai ușor</p>
        <Link 
          to="/products"
          className="bg-black text-white px-8 py-3 font-bold uppercase hover:bg-neutral-800 transition-colors"
        >
          Vezi Produsele
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="favorites-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="w-10 h-10 text-[#CCFF00]" />
          <h1 className="text-4xl sm:text-5xl font-bold">PRODUSE FAVORITE</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map(product => (
            <div
              key={product.id}
              data-testid={`favorite-card-${product.id}`}
              className="group bg-white border border-neutral-100 hover:border-black hover:shadow-xl transition-all relative"
            >
              {/* Remove Heart */}
              <button
                onClick={() => {
                  removeFromFavorites(product.id);
                  toast.success('Șters din favorite');
                }}
                data-testid={`remove-favorite-${product.id}`}
                className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group/heart"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover/heart:fill-white group-hover/heart:text-white" />
              </button>

              <Link to={`/products/${product.id}`}>
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.images[0] || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=400'} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-bold text-lg mb-2 line-clamp-1 hover:text-[#CCFF00]">{product.name}</h3>
                  <p className="text-sm text-neutral-500 mb-2">{product.team} • {product.year}</p>
                  <p className="text-xl font-bold mb-3">{formatPrice(product.price_ron)}</p>
                </Link>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-black text-white py-2 px-4 font-bold uppercase text-sm hover:bg-[#CCFF00] hover:text-black transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Adaugă în Coș</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
