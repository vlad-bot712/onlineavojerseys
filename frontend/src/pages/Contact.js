import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Clock, MessageCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending
    setTimeout(() => {
      toast.success('Mesajul tău a fost trimis! Îți vom răspunde în curând.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div data-testid="contact-page" className="pt-24 pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block bg-[#CCFF00] text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
            CONTACT
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
            HAI SĂ <span className="text-[#CCFF00] bg-black px-3">VORBIM</span>
          </h1>
          <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
            Ai întrebări despre comenzi, produse sau colaborări? Suntem aici să te ajutăm!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white border-2 border-neutral-200 rounded-xl p-4 text-center hover:border-[#CCFF00] transition-colors">
            <Clock className="w-6 h-6 mx-auto mb-2 text-[#CCFF00]" />
            <div className="text-2xl font-black">24h</div>
            <div className="text-xs text-neutral-500">Timp răspuns</div>
          </div>
          <div className="bg-white border-2 border-neutral-200 rounded-xl p-4 text-center hover:border-[#CCFF00] transition-colors">
            <MessageCircle className="w-6 h-6 mx-auto mb-2 text-[#CCFF00]" />
            <div className="text-2xl font-black">500+</div>
            <div className="text-xs text-neutral-500">Clienți mulțumiți</div>
          </div>
          <div className="bg-white border-2 border-neutral-200 rounded-xl p-4 text-center hover:border-[#CCFF00] transition-colors">
            <Zap className="w-6 h-6 mx-auto mb-2 text-[#CCFF00]" />
            <div className="text-2xl font-black">Fast</div>
            <div className="text-xs text-neutral-500">Suport activ</div>
          </div>
          <div className="bg-white border-2 border-neutral-200 rounded-xl p-4 text-center hover:border-[#CCFF00] transition-colors">
            <Instagram className="w-6 h-6 mx-auto mb-2 text-[#CCFF00]" />
            <div className="text-2xl font-black">DM</div>
            <div className="text-xs text-neutral-500">Instagram</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Email Card */}
            <a 
              href="mailto:avojerseys@gmail.com"
              className="block bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-neutral-700 rounded-xl p-6 hover:border-[#CCFF00] transition-all group"
            >
              <div className="w-12 h-12 bg-[#CCFF00] text-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-white mb-1">EMAIL</h3>
              <p className="text-[#CCFF00] font-medium">avojerseys@gmail.com</p>
              <p className="text-sm text-neutral-500 mt-2">Răspundem în max 24h</p>
            </a>

            {/* Phone Card */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-2 border-neutral-700 rounded-xl p-6 hover:border-[#CCFF00] transition-all group">
              <div className="w-12 h-12 bg-[#CCFF00] text-black rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-white mb-1">WHATSAPP</h3>
              <p className="text-[#CCFF00] font-medium">Scrie-ne pe WhatsApp</p>
              <p className="text-sm text-neutral-500 mt-2">Răspuns rapid</p>
            </div>

            {/* Instagram Card */}
            <a 
              href="https://instagram.com/avojerseys"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-br from-purple-900 to-pink-900 border-2 border-purple-700 rounded-xl p-6 hover:border-[#CCFF00] transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-white mb-1">INSTAGRAM</h3>
              <p className="text-pink-300 font-medium">@avojerseys</p>
              <p className="text-sm text-purple-300 mt-2">Urmărește-ne pentru noutăți</p>
            </a>

            {/* Location Card */}
            <div className="bg-white border-2 border-neutral-200 rounded-xl p-6 hover:border-[#CCFF00] transition-all">
              <div className="w-12 h-12 bg-black text-[#CCFF00] rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-1">LOCAȚIE</h3>
              <p className="text-neutral-600 font-medium">Sălaj, România</p>
              <p className="text-sm text-neutral-500 mt-2">Livrăm în toată țara 🇷🇴</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border-2 border-neutral-200 rounded-xl p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#CCFF00] rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black">TRIMITE UN MESAJ</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2 text-sm">NUME *</label>
                    <input
                      type="text"
                      name="name"
                      data-testid="contact-name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Numele tău"
                      className="w-full border-2 border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#CCFF00] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2 text-sm">EMAIL *</label>
                    <input
                      type="email"
                      name="email"
                      data-testid="contact-email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@exemplu.com"
                      className="w-full border-2 border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#CCFF00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">SUBIECT *</label>
                  <input
                    type="text"
                    name="subject"
                    data-testid="contact-subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Despre ce vrei să discutăm?"
                    className="w-full border-2 border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#CCFF00] transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2 text-sm">MESAJ *</label>
                  <textarea
                    name="message"
                    data-testid="contact-message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Scrie mesajul tău aici..."
                    className="w-full border-2 border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:border-[#CCFF00] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="send-message-btn"
                  disabled={sending}
                  className="w-full bg-[#CCFF00] text-black py-4 px-8 font-bold uppercase tracking-wider rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{sending ? 'SE TRIMITE...' : 'TRIMITE MESAJUL'}</span>
                </button>
              </div>
            </form>

            {/* FAQ Teaser */}
            <div className="mt-6 bg-neutral-100 border-2 border-neutral-200 rounded-xl p-6">
              <h3 className="font-bold mb-3">❓ ÎNTREBĂRI FRECVENTE</h3>
              <div className="space-y-2 text-sm">
                <p className="text-neutral-600">
                  <span className="font-bold text-black">Cât durează livrarea?</span> - 2-3 săptămâni standard, 1-2 săptămâni express
                </p>
                <p className="text-neutral-600">
                  <span className="font-bold text-black">Pot returna produsele?</span> - Da, în 14 zile pentru produsele nepersonalizate
                </p>
                <p className="text-neutral-600">
                  <span className="font-bold text-black">Cum plătesc?</span> - Card, PayPal, Transfer bancar sau Ramburs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
