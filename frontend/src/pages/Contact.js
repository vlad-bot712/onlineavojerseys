import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, Upload, X, Ticket, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function Contact() {
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [images, setImages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Imaginea este prea mare (max 5MB)');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    try {
      const response = await fetch(`${API_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: images
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTicketCreated(data);
        toast.success(data.message);
      } else {
        toast.error('A apărut o eroare. Te rugăm încearcă din nou.');
      }
    } catch (error) {
      console.error('Ticket creation error:', error);
      toast.error('A apărut o eroare de conexiune.');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setImages([]);
    setTicketCreated(null);
    setShowTicketForm(false);
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

          {/* Ticket Form - Right Side */}
          <div className="lg:col-span-3">
            {!showTicketForm && !ticketCreated ? (
              /* Create Ticket Button */
              <div className="bg-neutral-50 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-[#CCFF00] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Ticket className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Ai nevoie de ajutor?</h2>
                <p className="text-neutral-500 mb-6">
                  Creează un ticket de suport și îți vom răspunde în cel mai scurt timp posibil.
                </p>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="bg-black text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
                >
                  <Ticket className="w-5 h-5" />
                  CREEAZĂ TICKET
                </button>
              </div>
            ) : ticketCreated ? (
              /* Success Message */
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">Ticket Creat cu Succes!</h2>
                <p className="text-green-700 mb-4">
                  Îți mulțumim pentru mesaj. Te vom contacta în curând.
                </p>
                <div className="bg-white rounded-xl p-4 mb-6">
                  <p className="text-sm text-neutral-500 mb-1">Numărul ticketului tău:</p>
                  <p className="text-2xl font-mono font-bold text-green-800">{ticketCreated.ticket_number}</p>
                  <p className="text-xs text-neutral-400 mt-2">Păstrează acest număr pentru referință</p>
                </div>
                <button
                  onClick={resetForm}
                  className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors"
                >
                  Creează Alt Ticket
                </button>
              </div>
            ) : (
              /* Ticket Form */
              <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#CCFF00] rounded-full"></div>
                    Creează Ticket
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTicketForm(false)}
                    className="p-2 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Nume *</label>
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
                      <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Email *</label>
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
                    <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Subiect *</label>
                    <input
                      type="text"
                      name="subject"
                      data-testid="contact-subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Problema cu comanda #12345"
                      className="w-full bg-white border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">Descriere Problemă *</label>
                    <textarea
                      name="message"
                      data-testid="contact-message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Descrie problema în detaliu..."
                      className="w-full bg-white border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#CCFF00] text-sm resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-xs font-bold mb-2 text-neutral-400 uppercase tracking-wider">
                      Atașează Poze (opțional)
                    </label>
                    
                    {/* Upload Button */}
                    <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-[#CCFF00] hover:bg-[#CCFF00]/5 transition-all">
                      <Upload className="w-5 h-5 text-neutral-400" />
                      <span className="text-sm text-neutral-500">Click pentru a încărca poze</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-neutral-400 mt-1">Max 5MB per imagine. Formate: JPG, PNG, WEBP</p>

                    {/* Image Preview */}
                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square">
                            <img
                              src={img}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    data-testid="send-message-btn"
                    disabled={sending}
                    className="w-full bg-black text-white py-4 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-[#CCFF00] hover:text-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'SE TRIMITE...' : 'TRIMITE TICKET'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
