import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Filter, Trash2, Eye, MessageSquare, 
  Clock, CheckCircle, AlertCircle, XCircle, Send, Image,
  ChevronDown, RefreshCw, X
} from 'lucide-react';
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

const priorityLabels = {
  low: 'Scăzută',
  normal: 'Normală',
  high: 'Ridicată',
  urgent: 'Urgentă'
};

const priorityColors = {
  low: 'bg-neutral-100 text-neutral-600',
  normal: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600'
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  const [showImageModal, setShowImageModal] = useState(null);

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      
      const response = await fetch(`${API_URL}/api/tickets?${params}`);
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Eroare la încărcarea ticketelor');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tickets/stats/summary`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      toast.success('Status actualizat');
      fetchTickets();
      fetchStats();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error('Eroare la actualizare');
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await fetch(`${API_URL}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority })
      });
      toast.success('Prioritate actualizată');
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, priority: newPriority }));
      }
    } catch (error) {
      toast.error('Eroare la actualizare');
    }
  };

  const handleMarkAsSeen = async (ticketId) => {
    try {
      await fetch(`${API_URL}/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seen_by_admin: true })
      });
      fetchTickets();
      fetchStats();
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Sigur vrei să ștergi acest ticket?')) return;
    
    try {
      await fetch(`${API_URL}/api/tickets/${ticketId}`, {
        method: 'DELETE'
      });
      toast.success('Ticket șters');
      fetchTickets();
      fetchStats();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (error) {
      toast.error('Eroare la ștergere');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    
    setSending(true);
    try {
      const response = await fetch(`${API_URL}/api/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText })
      });
      const updatedTicket = await response.json();
      setSelectedTicket(updatedTicket);
      setReplyText('');
      toast.success('Răspuns trimis');
      fetchTickets();
    } catch (error) {
      toast.error('Eroare la trimitere');
    } finally {
      setSending(false);
    }
  };

  const openTicketDetail = async (ticket) => {
    setSelectedTicket(ticket);
    if (!ticket.seen_by_admin) {
      handleMarkAsSeen(ticket.id);
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

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Managementul Ticketelor</h1>
              <p className="text-neutral-500 text-sm">Gestionează cererile clienților</p>
            </div>
          </div>
          <button 
            onClick={() => { fetchTickets(); fetchStats(); }}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizează
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{stats.total || 0}</div>
            <div className="text-xs text-neutral-500">Total Tickete</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats.open || 0}</div>
            <div className="text-xs text-neutral-500">Deschise</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-yellow-600">{stats.in_progress || 0}</div>
            <div className="text-xs text-neutral-500">În Lucru</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{stats.resolved || 0}</div>
            <div className="text-xs text-neutral-500">Rezolvate</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-red-200">
            <div className="text-3xl font-bold text-red-600">{stats.unseen || 0}</div>
            <div className="text-xs text-neutral-500">Nevăzute</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-orange-200">
            <div className="text-3xl font-bold text-orange-600">{stats.urgent || 0}</div>
            <div className="text-xs text-neutral-500">Urgente</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <span className="text-sm font-medium">Filtre:</span>
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 bg-neutral-100 rounded-lg text-sm focus:outline-none"
            >
              <option value="">Toate Statusurile</option>
              <option value="open">Deschise</option>
              <option value="in_progress">În Lucru</option>
              <option value="resolved">Rezolvate</option>
              <option value="closed">Închise</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 bg-neutral-100 rounded-lg text-sm focus:outline-none"
            >
              <option value="">Toate Prioritățile</option>
              <option value="urgent">Urgentă</option>
              <option value="high">Ridicată</option>
              <option value="normal">Normală</option>
              <option value="low">Scăzută</option>
            </select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Caută după nume, email, subiect..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-neutral-100 rounded-lg text-sm focus:outline-none"
              />
            </div>

            {(filters.status || filters.priority || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', priority: '', search: '' })}
                className="text-sm text-neutral-500 hover:text-black"
              >
                Resetează
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-neutral-500">Se încarcă...</div>
              ) : tickets.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  Nu există tickete
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => openTicketDetail(ticket)}
                      className={`p-4 cursor-pointer hover:bg-neutral-50 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-[#CCFF00]/10 border-l-4 border-[#CCFF00]' : ''
                      } ${!ticket.seen_by_admin ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {!ticket.seen_by_admin && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                            )}
                            <span className="font-mono text-xs text-neutral-400">{ticket.ticket_number}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                              {statusLabels[ticket.status]}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                              {priorityLabels[ticket.priority]}
                            </span>
                          </div>
                          <h3 className="font-semibold text-sm truncate">{ticket.subject}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                            <span>{ticket.name}</span>
                            <span>•</span>
                            <span>{ticket.email}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
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
                                <Image className="w-3 h-3" />
                                {ticket.images.length} poze
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(ticket.id); }}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <div className="bg-white rounded-2xl shadow-sm sticky top-24">
                {/* Header */}
                <div className="p-4 border-b border-neutral-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-neutral-400">{selectedTicket.ticket_number}</span>
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-1 hover:bg-neutral-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold">{selectedTicket.subject}</h3>
                  <p className="text-sm text-neutral-500">{selectedTicket.name} • {selectedTicket.email}</p>
                </div>

                {/* Status & Priority Controls */}
                <div className="p-4 border-b border-neutral-100 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-neutral-400 mb-1 block">STATUS</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${statusColors[selectedTicket.status]}`}
                    >
                      <option value="open">Deschis</option>
                      <option value="in_progress">În Lucru</option>
                      <option value="resolved">Rezolvat</option>
                      <option value="closed">Închis</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 mb-1 block">PRIORITATE</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handlePriorityChange(selectedTicket.id, e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${priorityColors[selectedTicket.priority]}`}
                    >
                      <option value="low">Scăzută</option>
                      <option value="normal">Normală</option>
                      <option value="high">Ridicată</option>
                      <option value="urgent">Urgentă</option>
                    </select>
                  </div>
                </div>

                {/* Images */}
                {selectedTicket.images?.length > 0 && (
                  <div className="p-4 border-b border-neutral-100">
                    <label className="text-xs font-medium text-neutral-400 mb-2 block">POZE ATAȘATE</label>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedTicket.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => setShowImageModal(img)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="p-4 border-b border-neutral-100 max-h-[300px] overflow-y-auto">
                  <label className="text-xs font-medium text-neutral-400 mb-3 block">CONVERSAȚIE</label>
                  <div className="space-y-4">
                    {selectedTicket.messages?.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] ${
                            msg.sender === 'admin'
                              ? 'bg-[#CCFF00] text-black rounded-2xl rounded-br-md'
                              : 'bg-neutral-800 text-white rounded-2xl rounded-bl-md'
                          }`}
                        >
                          <div className="px-4 py-3">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                          <div className={`px-4 pb-2 flex items-center gap-2 ${
                            msg.sender === 'admin' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className={`text-[10px] ${
                              msg.sender === 'admin' ? 'text-black/60' : 'text-white/60'
                            }`}>
                              {msg.sender === 'admin' ? 'Tu' : selectedTicket.name}
                            </span>
                            <span className={`text-[10px] ${
                              msg.sender === 'admin' ? 'text-black/40' : 'text-white/40'
                            }`}>
                              •
                            </span>
                            <span className={`text-[10px] ${
                              msg.sender === 'admin' ? 'text-black/40' : 'text-white/40'
                            }`}>
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Box */}
                <div className="p-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Scrie un răspuns..."
                    rows={3}
                    className="w-full p-3 bg-neutral-100 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#CCFF00]"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || sending}
                    className="w-full mt-2 bg-black text-white py-3 rounded-xl font-medium text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? 'Se trimite...' : 'Trimite Răspuns'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-neutral-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Selectează un ticket pentru a vedea detaliile</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowImageModal(null)}
        >
          <button
            onClick={() => setShowImageModal(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={showImageModal}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
