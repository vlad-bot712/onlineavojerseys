import React, { useState, useEffect } from 'react';
import { X, Sparkles, Bell, Instagram, Mail } from 'lucide-react';

export default function CountdownModal({ isOpen, onClose }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Target date: April 1, 2026
  const targetDate = new Date('2026-04-01T00:00:00').getTime();

  useEffect(() => {
    if (!isOpen) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isOpen, targetDate]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-black border-2 border-[#CCFF00]/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Sparkle decoration */}
        <div className="absolute top-4 left-4">
          <Sparkles className="w-6 h-6 text-[#CCFF00] animate-pulse" />
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="inline-block bg-[#CCFF00] text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
            COMING SOON
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
            DROP <span className="text-[#CCFF00]">CASUAL</span>
          </h2>
          
          <p className="text-neutral-400 mb-8">
            Haine streetwear pentru fanii adevărați
          </p>

          {/* Countdown */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-3">
              <div className="text-3xl sm:text-4xl font-black text-[#CCFF00]">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Zile</div>
            </div>
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-3">
              <div className="text-3xl sm:text-4xl font-black text-[#CCFF00]">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Ore</div>
            </div>
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-3">
              <div className="text-3xl sm:text-4xl font-black text-[#CCFF00]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Min</div>
            </div>
            <div className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-3">
              <div className="text-3xl sm:text-4xl font-black text-[#CCFF00]">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider">Sec</div>
            </div>
          </div>

          {/* Launch Date */}
          <p className="text-neutral-500 text-sm mb-6">
            📅 Lansare: <span className="text-white font-bold">1 Aprilie 2026</span>
          </p>

          {/* Email Subscribe */}
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email pentru notificare..."
                className="flex-1 bg-neutral-800 border border-neutral-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#CCFF00] placeholder-neutral-500"
                required
              />
              <button
                type="submit"
                className="bg-[#CCFF00] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#d4ff33] transition-colors flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifică-mă</span>
              </button>
            </form>
          ) : (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              ✅ Te vom anunța când lansăm!
            </div>
          )}

          {/* Social Links */}
          <div className="flex justify-center gap-4 mt-6">
            <a 
              href="https://instagram.com/avojerseys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-[#CCFF00] transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href="mailto:avojerseys@gmail.com"
              className="text-neutral-500 hover:text-[#CCFF00] transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
