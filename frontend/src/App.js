import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PromoPopup from './components/PromoPopup';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import Favorites from './pages/Favorites';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import Contact from './pages/Contact';
import PromoBundle from './pages/PromoBundle';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Generate or get session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('avo_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('avo_session_id', sessionId);
  }
  return sessionId;
};

// Analytics tracker component
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        await fetch(`${API_URL}/api/analytics/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: location.pathname,
            referrer: document.referrer,
            session_id: getSessionId()
          })
        });
      } catch (err) {
        // Silent fail for analytics
      }
    };
    trackVisit();
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <FavoritesProvider>
          <Router>
            <AnalyticsTracker />
            <div className="App">
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
                  <Route path="/contact" element={<Contact />} />
                </Routes>
              </main>
              <Footer />
              <Toaster />
            </div>
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </CurrencyProvider>
  );
}

export default App;
