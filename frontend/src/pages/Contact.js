import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, Upload, X, Ticket, CheckCircle, Search, ArrowLeft, Clock, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const statusLabels = {
  open: 'Deschis',
  in_progress: 'În Lucru',
  resolved: 'Rezolvat',
  closed: 'Închis'
};

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-neutral-100 text-neutral-800'
};

export default function Contact() {
  const [view, setView] = useState('main'); // main, createTicket, myTickets, ticketDetail
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [images, setImages] = useState([]);
  const [sending, setSending] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);
  
  // My Tickets state
  const [searchEmail, setSearchEmail] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

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
    setView('main');
  };

  const searchMyTickets = async () => {
    if (!searchEmail.trim()) {
      toast.error('Te rugăm introdu adresa de email');
      return;
    }
    
    setLoadingTickets(true);
    try {
      const response = await fetch(`${API_URL}/api/tickets?search=${encodeURIComponent(searchEmail)}`);
      const data = await response.json();
      // Filter only tickets that match the email exactly
      const filtered = data.filter(t => t.email.toLowerCase() === searchEmail.toLowerCase());
      setMyTickets(filtered);
      if (filtered.length === 0) {
        toast.info('Nu am găsit tickete pentru acest email');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Eroare la căutarea ticketelor');
    } finally {
      setLoadingTickets(false);
    }
  };

  const openTicketDetail = async (ticket) => {
    try {
      const response = await fetch(`${API_URL}/api/tickets/${ticket.id}`);
      const data = await response.json();
      setSelectedTicket(data);
      setView('ticketDetail');
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Eroare la încărcarea ticketului');
    }
  };

  const sendCustomerReply = async () => {
    if (!replyText.trim()) return;
    
    setSendingReply(true);
    try {
      const response = await fetch(`${API_URL}/api/tickets/${selectedTicket.id}/customer-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      });
      const updatedTicket = await response.json();
      setSelectedTicket(updatedTicket);
      setReplyText('');
      toast.success('Mesaj trimis!');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Eroare la trimiterea mesajului');
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render ticket detail view
  if (view === 'ticketDetail' && selectedTicket) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <button
            onClick={() => { setSelectedTicket(null); setView('myTickets'); }}
            className="flex items-center gap-2 text-neutral-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi la ticketele mele
          </button>

          {/* Ticket Header */}
          <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm text-neutral-400">{selectedTicket.ticket_number}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedTicket.status]}`}>
                {statusLabels[selectedTicket.status]}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{selectedTicket.subject}</h1>
            <p className="text-neutral-500 text-sm">
              Creat pe {formatDate(selectedTicket.created_at)}
            </p>
          </div>

          {/* Attached Images */}
          {selectedTicket.images?.length > 0 && (
            <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Poze Atașate
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedTicket.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Conversation */}
          <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversație
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {selectedTicket.messages?.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${
                    msg.sender === 'admin'
                      ? 'bg-[#CCFF00]/20 ml-8 border-l-4 border-[#CCFF00]'
                      : 'bg-white mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">
                      {msg.sender === 'admin' ? '🛡️ Echipa AVO JERSEYS' : '👤 Tu'}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reply Box - only if ticket is not closed */}
          {selectedTicket.status !== 'closed' && (
            <div className="bg-neutral-50 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Trimite un răspuns</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Scrie mesajul tău aici..."
                rows={4}
                className="w-full bg-white border-0 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#CCFF00] mb-4"
              />
              <button
                onClick={sendCustomerReply}
                disabled={!replyText.trim() || sendingReply}
                className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendingReply ? 'Se trimite...' : 'Trimite Mesaj'}
              </button>
            </div>
          )}

          {selectedTicket.status === 'closed' && (
            <div className="bg-neutral-100 rounded-2xl p-6 text-center text-neutral-500">
              Acest ticket a fost închis. Pentru o nouă problemă, te rugăm să creezi un ticket nou.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render my tickets view
  if (view === 'myTickets') {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          {/* Back Button */}
          <button
            onClick={() => { setMyTickets([]); setSearchEmail(''); setView('main'); }}
            className="flex items-center gap-2 text-neutral-500 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block bg-[#CCFF00] text-black text-xs font-bold px-3 py-1 rounded-full mb-4">TICKETELE MELE</span>
            <h1 className="text-3xl font-bold mb-2">Verifică Statusul</h1>
            <p className="text-neutral-500">Introdu email-ul pentru a vedea ticketele tale</p>
          </div>

          {/* Search Box */}
          <div className="bg-neutral-50 rounded-2xl p-6 mb-6">
            <div className="flex gap-3">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Introdu adresa de email..."
                className="flex-1 bg-white border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
                onKeyDown={(e) => e.key === 'Enter' && searchMyTickets()}
              />
              <button
                onClick={searchMyTickets}
                disabled={loadingTickets}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {loadingTickets ? 'Se caută...' : 'Caută'}
              </button>
            </div>
          </div>

          {/* Tickets List */}
          {myTickets.length > 0 && (
            <div className="space-y-3">
              {myTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => openTicketDetail(ticket)}
                  className="bg-neutral-50 rounded-2xl p-5 cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-neutral-400">{ticket.ticket_number}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                          {statusLabels[ticket.status]}
                        </span>
                      </div>
                      <h3 className="font-bold mb-1">{ticket.subject}</h3>
                      <div className="flex items-center gap-4 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(ticket.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.messages?.length || 0} mesaje
                        </span>
                        {ticket.images?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {ticket.images.length} poze
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-neutral-300 rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {myTickets.length === 0 && searchEmail && !loadingTickets && (
            <div className="bg-neutral-50 rounded-2xl p-8 text-center text-neutral-500">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nu am găsit tickete pentru acest email</p>
            </div>
          )}
        </div>
      </div>
    );
  }

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

          {/* Ticket Section - Right Side */}
          <div className="lg:col-span-3">
            {view === 'main' && !ticketCreated ? (
              /* Main View - Two Options */
              <div className="space-y-4">
                {/* Create Ticket Card */}
                <div className="bg-neutral-50 rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#CCFF00] rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Ticket className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">Ai nevoie de ajutor?</h2>
                      <p className="text-neutral-500 text-sm mb-4">
                        Creează un ticket de suport și îți vom răspunde în cel mai scurt timp posibil.
                      </p>
                      <button
                        onClick={() => setView('createTicket')}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
                      >
                        <Ticket className="w-4 h-4" />
                        CREEAZĂ TICKET
                      </button>
                    </div>
                  </div>
                </div>

                {/* My Tickets Card */}
                <div className="bg-neutral-50 rounded-2xl p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-white border-2 border-neutral-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Search className="w-7 h-7 text-neutral-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold mb-2">Ai deja un ticket?</h2>
                      <p className="text-neutral-500 text-sm mb-4">
                        Verifică statusul ticketelor tale și vezi răspunsurile echipei noastre.
                      </p>
                      <button
                        onClick={() => setView('myTickets')}
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-100 transition-colors inline-flex items-center gap-2 border-2 border-neutral-200"
                      >
                        <Search className="w-4 h-4" />
                        TICKETELE MELE
                      </button>
                    </div>
                  </div>
                </div>
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
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetForm}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors"
                  >
                    Înapoi
                  </button>
                  <button
                    onClick={() => { setSearchEmail(formData.email); setView('myTickets'); searchMyTickets(); }}
                    className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-100 transition-colors border-2 border-neutral-200"
                  >
                    Vezi Ticketul
                  </button>
                </div>
              </div>
            ) : view === 'createTicket' ? (
              /* Ticket Form */
              <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#CCFF00] rounded-full"></div>
                    Creează Ticket
                  </h2>
                  <button
                    type="button"
                    onClick={() => setView('main')}
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
