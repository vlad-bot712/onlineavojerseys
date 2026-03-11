import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Euro, User, Heart, Package, HelpCircle, Menu, X, Home, ShoppingBag, Mail, Shirt } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import NewsletterPopup from './NewsletterPopup';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Navbar() {
  const { currency, toggleCurrency } = useCurrency();
  const { getCartCount } = useCart();
  const { favorites } = useFavorites();
  const cartCount = getCartCount();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [casualVisible, setCasualVisible] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    fetch(`${API_URL}/api/settings/casual`)
      .then(r => r.json())
      .then(d => setCasualVisible(d.casual_visible))
      .catch(() => {});
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav data-testid="main-navbar" className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
              className="md:hidden flex items-center justify-center w-10 h-10 text-black hover:bg-neutral-100 rounded-lg transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" data-testid="logo-link" className="flex items-center">
              <div className="flex items-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                <span className="text-2xl md:text-3xl font-black text-black tracking-tighter">AVO</span>
                <span className="text-2xl md:text-3xl font-black text-[#CCFF00] ml-0.5 tracking-tighter">JERSEYS</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" data-testid="nav-home" className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-[#CCFF00]' : 'hover:text-[#CCFF00]'}`}>
                ACASĂ
              </Link>
              <Link to="/products" data-testid="nav-products" className={`text-sm font-medium transition-colors ${isActive('/products') ? 'text-[#CCFF00]' : 'hover:text-[#CCFF00]'}`}>
                PRODUSE
              </Link>
              {casualVisible && (
                <Link to="/casual" data-testid="nav-casual" className={`text-sm font-medium transition-colors ${isActive('/casual') ? 'text-[#CCFF00]' : 'hover:text-[#CCFF00]'}`}>
                  CASUAL
                </Link>
              )}
              <Link to="/contact" data-testid="nav-contact" className={`text-sm font-medium transition-colors ${isActive('/contact') ? 'text-[#CCFF00]' : 'hover:text-[#CCFF00]'}`}>
                CONTACT
              </Link>
            </div>

            {/* Actions - Simplified for mobile */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Discount Button - Hidden on mobile, accessible from menu */}
              <button
                onClick={() => setShowNewsletter(true)}
                data-testid="discount-button"
                className="hidden md:flex items-center justify-center w-10 h-10 bg-[#CCFF00] text-black hover:bg-black hover:text-[#CCFF00] transition-all relative group"
                title="Cod Reducere"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="absolute -bottom-8 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Cod Reducere
                </span>
              </button>

              {/* Currency Toggle - Smaller on mobile */}
              <button
                onClick={toggleCurrency}
                data-testid="currency-toggle"
                className="hidden sm:flex items-center space-x-1 px-2 md:px-3 py-1.5 md:py-2 border-2 border-black hover:bg-black hover:text-white transition-all"
              >
                {currency === 'RON' ? (
                  <span className="text-xs md:text-sm font-bold">RON</span>
                ) : (
                  <>
                    <Euro className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs md:text-sm font-bold">EUR</span>
                  </>
                )}
              </button>

              {/* Profile Dropdown - Hidden on mobile, accessible from menu */}
              <div ref={profileRef} className="relative hidden md:block">
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

              {/* Cart - Always visible */}
              <Link 
                to="/cart" 
                data-testid="cart-button"
                className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 bg-black text-white hover:bg-[#CCFF00] hover:text-black transition-all"
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                {cartCount > 0 && (
                  <span data-testid="cart-count" className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-[#CCFF00] text-black text-xs font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center text-[10px] md:text-xs">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Drawer */}
        <div 
          className={`absolute top-0 left-0 w-72 h-full bg-white shadow-2xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-black">
            <div className="flex items-center" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              <span className="text-2xl font-black text-white tracking-tighter">AVO</span>
              <span className="text-2xl font-black text-[#CCFF00] ml-0.5 tracking-tighter">JERSEYS</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-white hover:text-[#CCFF00] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="py-4">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-4 px-6 py-4 text-base font-bold transition-colors ${isActive('/') ? 'bg-[#CCFF00] text-black' : 'hover:bg-neutral-100'}`}
            >
              <Home className="w-5 h-5" />
              <span>ACASĂ</span>
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-4 px-6 py-4 text-base font-bold transition-colors ${isActive('/products') ? 'bg-[#CCFF00] text-black' : 'hover:bg-neutral-100'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>PRODUSE</span>
            </Link>
            {casualVisible && (
              <Link 
                to="/casual" 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-4 px-6 py-4 text-base font-bold transition-colors ${isActive('/casual') ? 'bg-[#CCFF00] text-black' : 'hover:bg-neutral-100'}`}
              >
                <Shirt className="w-5 h-5" />
                <span>CASUAL</span>
              </Link>
            )}
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-4 px-6 py-4 text-base font-bold transition-colors ${isActive('/contact') ? 'bg-[#CCFF00] text-black' : 'hover:bg-neutral-100'}`}
            >
              <Mail className="w-5 h-5" />
              <span>CONTACT</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-200 mx-4" />

          {/* Secondary Links */}
          <div className="py-4">
            <Link 
              to="/track-order" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-4 px-6 py-4 text-base font-medium hover:bg-neutral-100 transition-colors"
            >
              <Package className="w-5 h-5 text-neutral-600" />
              <span>Urmărește Comandă</span>
            </Link>
            <Link 
              to="/favorites" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-4 px-6 py-4 text-base font-medium hover:bg-neutral-100 transition-colors"
            >
              <Heart className="w-5 h-5 text-neutral-600" />
              <div className="flex-1 flex items-center justify-between">
                <span>Produse Favorite</span>
                {favorites.length > 0 && (
                  <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </div>
            </Link>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                setShowNewsletter(true);
              }}
              className="w-full flex items-center space-x-4 px-6 py-4 text-base font-medium hover:bg-neutral-100 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-neutral-600" />
              <span>Cod Reducere</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-200 mx-4" />

          {/* Currency Toggle in Mobile Menu */}
          <div className="p-4">
            <button
              onClick={() => {
                toggleCurrency();
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-black hover:bg-black hover:text-white transition-all font-bold"
            >
              {currency === 'RON' ? (
                <>
                  <span>Schimbă în EUR</span>
                  <Euro className="w-4 h-4" />
                </>
              ) : (
                <span>Schimbă în RON</span>
              )}
            </button>
          </div>

          {/* Promo Banner at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#CCFF00]">
            <Link 
              to="/promotii" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center space-x-2 text-black font-bold"
            >
              <span>🎁 BUNDLE 1+1 GRATIS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Popup */}
      <NewsletterPopup isOpen={showNewsletter} onClose={() => setShowNewsletter(false)} />
    </>
  );
}
