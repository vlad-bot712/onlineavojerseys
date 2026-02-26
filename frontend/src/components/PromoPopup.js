import React, { useState, useEffect } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if popup was shown in this session
    const shown = sessionStorage.getItem('promo_popup_shown');
    if (!shown) {
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem('promo_popup_shown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleGoToPromo = () => {
    setShow(false);
    navigate('/promotii');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setShow(false)}
      />
      
      {/* Popup */}
      <div className="relative bg-white w-full max-w-lg overflow-hidden animate-[scale-in_0.3s_ease-out] rounded-lg shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative">
          <img 
            src="/images/promo-1plus1.jpg" 
            alt="Promoție 1+1" 
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4 animate-pulse">
            <Gift className="w-4 h-4" />
            <span>PROMOȚIE SPECIALĂ</span>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">BUNDLE 1+1 GRATIS</h2>
          <p className="text-neutral-600 mb-6">
            Cumperi un tricou de club la alegere și primești unul de națională <strong>COMPLET GRATUIT!</strong>
          </p>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-center">
              <p className="text-neutral-400 line-through">300 RON</p>
              <p className="text-3xl font-bold text-[#CCFF00] bg-black px-4 py-2 rounded">200 RON</p>
            </div>
            <div className="text-left">
              <p className="text-green-600 font-bold">✓ 2 tricouri</p>
              <p className="text-green-600 font-bold">✓ Livrare rapidă</p>
              <p className="text-green-600 font-bold">✓ Economisești 100 RON</p>
            </div>
          </div>

          <button
            onClick={handleGoToPromo}
            className="w-full bg-[#CCFF00] text-black py-4 font-bold text-lg uppercase flex items-center justify-center space-x-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <span>VEZI OFERTA</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShow(false)}
            className="mt-3 text-sm text-neutral-500 hover:text-black transition-colors"
          >
            Nu mă interesează acum
          </button>
        </div>
      </div>
    </div>
  );
}
