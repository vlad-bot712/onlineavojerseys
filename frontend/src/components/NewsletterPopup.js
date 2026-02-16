import React, { useState } from 'react';
import { X, Gift } from 'lucide-react';

export default function NewsletterPopup({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    
    // Salvează email în localStorage
    localStorage.setItem('newsletter_subscribed', 'true');
    localStorage.setItem('newsletter_email', email);
    
    setSubscribed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('AVO10LEI');
    alert('Cod copiat în clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white max-w-md w-full mx-4 border-4 border-black shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black text-white hover:bg-red-500 transition-all flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {!subscribed ? (
          <div className="p-8">
            <div className="w-16 h-16 bg-[#CCFF00] flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-3">PRIMEȘTE 10 LEI REDUCERE!</h2>
            <p className="text-center text-neutral-600 mb-6">
              Abonează-te la newsletter și primești un cod de reducere instant!
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introdu emailul tău"
                required
                className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
              />
              <button
                type="submit"
                className="w-full bg-[#CCFF00] text-black py-4 px-8 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Abonează-te Acum
              </button>
            </form>

            <p className="text-xs text-neutral-500 text-center mt-4">
              * Vei primi oferte exclusive și noutăți
            </p>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500 text-white flex items-center justify-center rounded-full mx-auto mb-4">
              <Gift className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold mb-3">FELICITĂRI!</h2>
            <p className="text-neutral-600 mb-6">Codul tău de reducere este:</p>
            
            <div className="bg-[#CCFF00] border-4 border-black p-6 mb-6">
              <p className="text-sm font-bold mb-2">CODUL TĂU:</p>
              <p className="text-4xl font-bold tracking-wider">AVO10LEI</p>
            </div>

            <button
              onClick={handleCopyCode}
              className="bg-black text-white py-3 px-8 font-bold uppercase mb-4 hover:bg-neutral-800 transition-all"
            >
              Copiază Codul
            </button>

            <p className="text-sm text-neutral-600">
              Folosește acest cod la checkout pentru 10 LEI reducere!
            </p>

            <button
              onClick={onClose}
              className="mt-6 text-sm underline hover:text-[#CCFF00]"
            >
              Închide
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
