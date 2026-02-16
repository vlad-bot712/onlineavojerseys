import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Euro, User, Heart, Package } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

export default function Navbar() {
  const { currency, toggleCurrency } = useCurrency();
  const { getCartCount } = useCart();
  const { favorites } = useFavorites();
  const cartCount = getCartCount();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav data-testid="main-navbar" className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" data-testid="logo-link" className="flex items-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_jersey-hub-31/artifacts/momr6z3s_IMG_9227.png" 
              alt="AVO JERSEYS" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" data-testid="nav-home" className="text-sm font-medium hover:text-[#CCFF00] transition-colors">
              ACASĂ
            </Link>
            <Link to="/products" data-testid="nav-products" className="text-sm font-medium hover:text-[#CCFF00] transition-colors">
              PRODUSE
            </Link>
            <Link to="/contact" data-testid="nav-contact" className="text-sm font-medium hover:text-[#CCFF00] transition-colors">
              CONTACT
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Currency Toggle */}
            <button
              onClick={toggleCurrency}
              data-testid="currency-toggle"
              className="flex items-center space-x-1 px-3 py-2 border-2 border-black hover:bg-black hover:text-white transition-all"
            >
              {currency === 'RON' ? (
                <>
                  <span className="text-sm font-bold">RON</span>
                </>
              ) : (
                <>
                  <Euro className="w-4 h-4" />
                  <span className="text-sm font-bold">EUR</span>
                </>
              )}
            </button>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                data-testid="profile-button"
                className="flex items-center justify-center w-10 h-10 bg-black text-white hover:bg-[#CCFF00] hover:text-black transition-all"
              >
                <User className="w-5 h-5" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black shadow-lg">
                  <Link
                    to="/track-order"
                    data-testid="menu-track-order"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-[#CCFF00] transition-colors border-b border-neutral-200"
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-bold text-sm">Urmărește Comandă</span>
                  </Link>
                  <Link
                    to="/favorites"
                    data-testid="menu-favorites"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-[#CCFF00] transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-bold text-sm">Produse Favorite</span>
                      {favorites.length > 0 && (
                        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                          {favorites.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link 
              to="/cart" 
              data-testid="cart-button"
              className="relative flex items-center justify-center w-10 h-10 bg-black text-white hover:bg-[#CCFF00] hover:text-black transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span data-testid="cart-count" className="absolute -top-2 -right-2 bg-[#CCFF00] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
