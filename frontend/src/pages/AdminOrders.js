import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Package, Clock, Truck, CheckCircle, XCircle, Calendar, User, Phone, Mail, MapPin, CreditCard, Trash2, Activity, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import AnalyticsModal from '../components/AnalyticsModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [casualVisible, setCasualVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0
  });

  useEffect(() => {
    loadOrders();
  }, [filter]);

  useEffect(() => {
    axios.get(`${API_URL}/api/settings/casual`)
      .then(res => setCasualVisible(res.data.casual_visible))
      .catch(() => {});
  }, []);

  const toggleCasual = async () => {
    try {
      const res = await axios.patch(`${API_URL}/api/settings/casual`);
      setCasualVisible(res.data.casual_visible);
      toast.success(res.data.casual_visible ? 'Casual ON — vizibil pentru toți' : 'Casual OFF — ascuns');
    } catch {
      toast.error('Eroare la schimbarea setării');
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await axios.get(`${API_URL}/api/orders`, { params });
      setOrders(res.data);
      
      // Calculate stats
      const allOrders = filter === 'all' ? res.data : await axios.get(`${API_URL}/api/orders`).then(r => r.data);
      setStats({
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        shipped: allOrders.filter(o => o.status === 'shipped').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Sigur vrei să ștergi comanda ${orderNumber}? Această acțiune este PERMANENTĂ!`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/orders/${orderId}`);
      toast.success('Comandă ștearsă cu succes!');
      loadOrders(); // Reload orders
    } catch (err) {
      console.error(err);
      toast.error('Eroare la ștergerea comenzii');
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        text: 'În Așteptare',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgLight: 'bg-yellow-50',
        border: 'border-yellow-200'
      },
      processing: {
        icon: Package,
        text: 'În Procesare',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgLight: 'bg-blue-50',
        border: 'border-blue-200'
      },
      shipped: {
        icon: Truck,
        text: 'Expediată',
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgLight: 'bg-purple-50',
        border: 'border-purple-200'
      },
      delivered: {
        icon: CheckCircle,
        text: 'Livrată',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgLight: 'bg-green-50',
        border: 'border-green-200'
      },
      cancelled: {
        icon: XCircle,
        text: 'Anulată',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgLight: 'bg-red-50',
        border: 'border-red-200'
      }
    };
    return configs[status] || configs.pending;
  };

  const StatCard = ({ label, value, active, onClick }) => (
    <button
      onClick={onClick}
      className={`p-6 border-2 transition-all ${
        active 
          ? 'bg-black text-white border-black shadow-lg' 
          : 'bg-white border-neutral-200 hover:border-black hover:shadow-md'
      }`}
    >
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className={`text-sm font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-neutral-600'}`}>
        {label}
      </div>
    </button>
  );

  return (
    <div data-testid="admin-orders-page" className="pt-24 pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">COMENZI ADMIN</h1>
            <p className="text-neutral-600">Gestionează și monitorizează toate comenzile</p>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Casual Products Admin */}
            <Link
              to="/admin/casual-products"
              className="bg-black text-white px-5 py-3 font-bold flex items-center space-x-2 border-2 border-black hover:bg-[#CCFF00] hover:text-black transition-all"
            >
              <Package className="w-5 h-5" />
              <span>PRODUSE CASUAL</span>
            </Link>
            {/* Casual Toggle */}
            <button
              data-testid="casual-toggle"
              onClick={toggleCasual}
              className={`px-5 py-3 font-bold flex items-center space-x-2 border-2 transition-all ${
                casualVisible
                  ? 'bg-[#CCFF00] text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                  : 'bg-neutral-200 text-neutral-600 border-neutral-300 hover:border-black'
              }`}
            >
              {casualVisible ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span>CASUAL {casualVisible ? 'ON' : 'OFF'}</span>
            </button>
            {/* Analytics Button */}
            <button
              onClick={() => setShowAnalytics(true)}
              className="bg-[#CCFF00] text-black px-6 py-3 font-bold flex items-center space-x-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Activity className="w-5 h-5" />
              <span>TRAFIC SITE</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total" value={stats.total} active={filter === 'all'} onClick={() => setFilter('all')} />
          <StatCard label="În Așteptare" value={stats.pending} active={filter === 'pending'} onClick={() => setFilter('pending')} />
          <StatCard label="Procesare" value={stats.processing} active={filter === 'processing'} onClick={() => setFilter('processing')} />
          <StatCard label="Expediate" value={stats.shipped} active={filter === 'shipped'} onClick={() => setFilter('shipped')} />
          <StatCard label="Livrate" value={stats.delivered} active={filter === 'delivered'} onClick={() => setFilter('delivered')} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            <p className="mt-4 text-neutral-600">Se încarcă comenzile...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white border-2 border-neutral-200">
            <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
            <p className="text-xl text-neutral-500">Nu există comenzi pentru filtrul selectat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={order.id}
                  data-testid={`order-card-${order.id}`}
                  className="bg-white border-2 border-neutral-200 hover:border-black hover:shadow-2xl transition-all overflow-hidden"
                >
                  {/* Header */}
                  <div className={`${statusConfig.bgLight} border-b-2 ${statusConfig.border} p-6`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`${statusConfig.color} text-white p-3 rounded-lg`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">#{order.order_number}</h3>
                          <div className="flex items-center space-x-2 text-sm text-neutral-600 mt-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(order.created_at).toLocaleDateString('ro-RO', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`px-4 py-2 ${statusConfig.color} text-white font-bold uppercase text-sm tracking-wider`}>
                          {statusConfig.text}
                        </div>
                        <Link
                          to={`/admin/orders/${order.id}`}
                          data-testid={`view-order-${order.id}`}
                          className="bg-black text-white px-6 py-2 font-bold uppercase text-sm hover:bg-[#CCFF00] hover:text-black transition-all flex items-center space-x-2"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Vezi Detalii</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.order_number)}
                          data-testid={`delete-order-${order.id}`}
                          className="bg-red-500 text-white px-4 py-2 font-bold uppercase text-sm hover:bg-red-600 transition-all flex items-center space-x-2"
                          title="Șterge comandă"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                      {/* Customer Info */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm text-neutral-500 uppercase tracking-wider mb-3">Client</h4>
                        <div className="flex items-start space-x-2">
                          <User className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-bold">{order.customer_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Mail className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                          <p className="text-sm text-neutral-600 break-all">{order.customer_email}</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Phone className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                          <p className="text-sm text-neutral-600">{order.customer_phone}</p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-bold text-sm text-neutral-500 uppercase tracking-wider mb-3">Adresă Livrare</h4>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-neutral-400 mt-1 flex-shrink-0" />
                          <p className="text-sm text-neutral-600">{order.customer_address}</p>
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">
                          Metodă: {order.shipping_method === 'express' ? 'Expresă (1-2 saptamani)' : 'Standard (2-3 saptamani)'}
                        </p>
                      </div>

                      {/* Products Preview */}
                      <div>
                        <h4 className="font-bold text-sm text-neutral-500 uppercase tracking-wider mb-3">Produse</h4>
                        <div className="space-y-3">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex items-start space-x-3 bg-neutral-50 p-2 rounded">
                              <img 
                                src={item.product_image || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=100'} 
                                alt={item.product_name}
                                className="w-14 h-14 object-cover border border-neutral-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{item.product_name}</p>
                                <p className="text-xs text-neutral-500">Mărime: {item.size} • Cantitate: {item.quantity}</p>
                                {/* Kit Info */}
                                {item.kit && (
                                  <p className="text-xs font-bold text-blue-600 mt-1">
                                    🎽 {item.kit_name || (item.kit === 'first' ? 'First Kit' : item.kit === 'second' ? 'Second Kit' : 'Third Kit')}
                                  </p>
                                )}
                                {/* Version Badge */}
                                {item.version && (
                                  <span className={`inline-block text-xs font-bold px-2 py-0.5 mt-1 ${item.version === 'player' ? 'bg-black text-[#CCFF00]' : 'bg-neutral-200 text-neutral-700'}`}>
                                    {item.version === 'player' ? 'PLAYER' : 'FAN'}
                                  </span>
                                )}
                                {/* Customization Details */}
                                {item.customization && (
                                  <div className="mt-1 text-xs text-neutral-600 space-y-0.5">
                                    {item.customization.name && <p>📝 Nume: <span className="font-bold">{item.customization.name}</span></p>}
                                    {item.customization.number && <p>🔢 Număr: <span className="font-bold">#{item.customization.number}</span></p>}
                                    {item.customization.patches && item.customization.patches.length > 0 && (
                                      <p>🏷️ Patch-uri: {item.customization.patches.map(p => 
                                        p === 'league' ? 'Liga' : 
                                        p === 'ucl' ? 'UCL' : p
                                      ).join(', ')}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-xs text-neutral-500 text-center">+{order.items.length - 3} alte produse</p>
                          )}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="font-bold text-sm text-neutral-500 uppercase tracking-wider mb-3">Plată</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600">
                              {order.payment_method === 'stripe' ? 'Card (Stripe)' : 'Nespecificat'}
                            </span>
                          </div>
                          <div className={`inline-block px-3 py-1 text-xs font-bold ${
                            order.payment_status === 'paid' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.payment_status === 'paid' ? 'PLĂTITĂ' : 'ÎN AȘTEPTARE'}
                          </div>
                          <p className="text-2xl font-bold mt-2">{order.total_ron} {order.currency}</p>
                        </div>
                      </div>
                    </div>

                    {/* AWB Section */}
                    {order.awb && (
                      <div className="bg-[#CCFF00] border-2 border-black p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Truck className="w-6 h-6" />
                          <div>
                            <p className="text-xs font-bold uppercase text-neutral-600">AWB Expediere</p>
                            <p className="text-xl font-bold">{order.awb}</p>
                          </div>
                        </div>
                        <Package className="w-8 h-8 text-neutral-600" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      <AnalyticsModal isOpen={showAnalytics} onClose={() => setShowAnalytics(false)} />
    </div>
  );
}
