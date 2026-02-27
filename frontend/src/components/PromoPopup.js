import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PromoPopup() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const shown = sessionStorage.getItem('promo_popup_shown');
    if (!shown) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem('promo_popup_shown', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => setShow(false)}
      />

      {/* Popup - bottom sheet on mobile, centered on desktop */}
      <div className="relative bg-black text-white w-full sm:max-w-sm sm:rounded-lg overflow-hidden rounded-t-2xl sm:rounded-b-lg">
        {/* Close */}
        <button
          onClick={() => setShow(false)}
          data-testid="promo-popup-close"
          className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/40 p-1.5 rounded-full transition-all"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Compact content */}
        <div className="p-5 pt-6 text-center">
          <p className="text-[#CCFF00] text-xs font-bold tracking-widest mb-1">PROMOTIE SPECIALA</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">BUNDLE 1+1 GRATIS</h2>
          <p className="text-neutral-400 text-sm mb-4">
            Tricou club + tricou nationala <span className="text-[#CCFF00] font-bold">GRATUIT</span>
          </p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-neutral-500 line-through text-lg">300 RON</span>
            <span className="text-3xl font-bold text-[#CCFF00]">200 RON</span>
          </div>

          <button
            onClick={() => { setShow(false); navigate('/promotii'); }}
            data-testid="promo-popup-cta"
            className="w-full bg-[#CCFF00] text-black py-3.5 font-bold text-base uppercase flex items-center justify-center gap-2 rounded-md active:scale-95 transition-transform"
          >
            <span>VEZI OFERTA</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShow(false)}
            className="mt-3 text-xs text-neutral-500 active:text-white transition-colors"
          >
            Nu ma intereseaza
          </button>
        </div>
      </div>
    </div>
  );
}
