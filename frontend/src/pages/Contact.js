import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram } from 'lucide-react';
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
    
    setTimeout(() => {
      toast.success('Mesajul tău a fost trimis!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div data-testid="contact-page" className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-3">CONTACT</h1>
          <p className="text-neutral-500">Suntem aici să te ajutăm</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info - Left Side */}
          <div className="lg:col-span-2 space-y-4">
            {/* Email */}
            <a 
              href="mailto:avojerseys@gmail.com"
              className="flex items-center gap-4 p-4 border border-neutral-200 hover:border-black transition-colors group"
            >
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
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
              className="flex items-center gap-4 p-4 border border-neutral-200 hover:border-black transition-colors group"
            >
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center group-hover:bg-[#CCFF00] group-hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">INSTAGRAM</div>
                <div className="text-neutral-600 text-sm">@avojerseys</div>
              </div>
            </a>

            {/* Phone/WhatsApp */}
            <div className="flex items-center gap-4 p-4 border border-neutral-200">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">WHATSAPP</div>
                <div className="text-neutral-600 text-sm">Disponibil pe Instagram DM</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4 p-4 border border-neutral-200">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">LOCAȚIE</div>
                <div className="text-neutral-600 text-sm">Sălaj, România</div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-neutral-100 p-4 text-center">
              <div className="text-2xl font-black">24h</div>
              <div className="text-xs text-neutral-500 uppercase">Timp mediu răspuns</div>
            </div>
          </div>

          {/* Contact Form - Right Side */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="border border-neutral-200 p-6">
              <h2 className="text-xl font-bold mb-6">TRIMITE MESAJ</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-neutral-500">NUME</label>
                    <input
                      type="text"
                      name="name"
                      data-testid="contact-name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-neutral-200 px-3 py-2.5 focus:outline-none focus:border-black text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-neutral-500">EMAIL</label>
                    <input
                      type="email"
                      name="email"
                      data-testid="contact-email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-neutral-200 px-3 py-2.5 focus:outline-none focus:border-black text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-neutral-500">SUBIECT</label>
                  <input
                    type="text"
                    name="subject"
                    data-testid="contact-subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 px-3 py-2.5 focus:outline-none focus:border-black text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-neutral-500">MESAJ</label>
                  <textarea
                    name="message"
                    data-testid="contact-message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full border border-neutral-200 px-3 py-2.5 focus:outline-none focus:border-black text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="send-message-btn"
                  disabled={sending}
                  className="w-full bg-black text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'SE TRIMITE...' : 'TRIMITE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
