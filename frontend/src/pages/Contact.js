import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

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
    
    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Mesajul tău a fost trimis!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('A apărut o eroare. Te rugăm încearcă din nou.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('A apărut o eroare de conexiune.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="contact-page" className="pt-24 pb-16 min-h-screen bg-white relative overflow-hidden">
      {/* Decorative lime elements */}
      <div className="absolute top-32 right-0 w-64 h-64 bg-[#CCFF00]/5 rounded-full translate-x-1/2"></div>
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-[#CCFF00]/5 rounded-full -translate-x-1/2"></div>
      <div className="absolute top-1/3 left-10 w-2 h-2 bg-[#CCFF00] rounded-full"></div>
      <div className="absolute bottom-1/3 right-20 w-1.5 h-1.5 bg-[#CCFF00] rounded-full"></div>
      
      <div className="max-w-6xl mx-auto px-4 md:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-[#CCFF00] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">CONTACT</span>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">Hai să Vorbim</h1>
          <p className="text-neutral-500">Suntem aici să te ajutăm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {/* Email */}
            <a 
              href="mailto:avojerseys@gmail.com"
              className="flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl hover:bg-[#CCFF00]/10 transition-all group"
            >
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-xl group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">EMAIL</div>
                <div className="text-neutral-600 text-sm">avojerseys@gmail.com</div>
              </div>
            </a>

            {/* Instagram */}
            <a 
              href="https://instagram.com/avojerseys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl hover:bg-[#CCFF00]/10 transition-all group"
            >
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-xl group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">INSTAGRAM</div>
                <div className="text-neutral-600 text-sm">@avojerseys</div>
              </div>
            </a>

            {/* Phone/WhatsApp */}
            <div className="flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">WHATSAPP</div>
                <div className="text-neutral-600 text-sm">Disponibil pe Instagram DM</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 p-5 bg-neutral-50 rounded-2xl">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">LOCAȚIE</div>
                <div className="text-neutral-600 text-sm">Sălaj, România</div>
              </div>
            </div>

            {/* Response Time - Lime accent */}
            <div className="bg-[#CCFF00] p-5 rounded-2xl text-center">
              <div className="text-3xl font-black">24h</div>
              <div className="text-xs text-black/70 uppercase font-medium">Timp mediu răspuns</div>
            </div>
          </div>

          {/* Contact Form - Right Side */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#CCFF00] rounded-full"></div>
                Trimite Mesaj
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Nume</label>
                    <input
                      type="text"
                      name="name"
                      data-testid="contact-name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      name="email"
                      data-testid="contact-email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Subiect</label>
                  <input
                    type="text"
                    name="subject"
                    data-testid="contact-subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Mesaj</label>
                  <textarea
                    name="message"
                    data-testid="contact-message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full bg-white border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="send-message-btn"
                  disabled={sending}
                  className="w-full bg-black text-white py-4 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#CCFF00] hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'SE TRIMITE...' : 'TRIMITE MESAJ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
