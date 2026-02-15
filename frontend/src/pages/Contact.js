import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
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
    <div data-testid="contact-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4">CONTACT</h1>
        <p className="text-center text-neutral-600 mb-12 text-lg">
          Ai întrebări? Suntem aici să te ajutăm!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-neutral-200 p-6">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">EMAIL</h3>
              <p className="text-neutral-600">contact@avojerseys.ro</p>
              <p className="text-sm text-neutral-500 mt-2">Răspundem în 24h</p>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">TELEFON</h3>
              <p className="text-neutral-600">+40 123 456 789</p>
              <p className="text-sm text-neutral-500 mt-2">Luni - Vineri: 09:00 - 18:00</p>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl mb-2">LOCAȚIE</h3>
              <p className="text-neutral-600">București, România</p>
              <p className="text-sm text-neutral-500 mt-2">Livrăm în toată țara</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 p-8">
              <h2 className="text-3xl font-bold mb-6">TRIMITE-NE UN MESAJ</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Nume *</label>
                  <input
                    type="text"
                    name="name"
                    data-testid="contact-name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    data-testid="contact-email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Subiect *</label>
                  <input
                    type="text"
                    name="subject"
                    data-testid="contact-subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-2">Mesaj *</label>
                  <textarea
                    name="message"
                    data-testid="contact-message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="send-message-btn"
                  disabled={sending}
                  className="w-full bg-black text-white py-4 px-8 font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{sending ? 'Se trimite...' : 'Trimite Mesaj'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
