import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Phone, Mail, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    awb: ''
  });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/${id}`);
      setOrder(res.data);
      setFormData({
        status: res.data.status,
        awb: res.data.awb || ''
      });
    } catch (err) {
      console.error(err);
      toast.error('Comanda nu a putut fi încărcată');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/orders/${id}`, formData);
      toast.success('Comanda a fost actualizată!');
      loadOrder();
    } catch (err) {
      console.error(err);
      toast.error('Eroare la actualizare');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Sigur vrei să ștergi comanda ${order.order_number}? Această acțiune este PERMANENTĂ și nu poate fi anulată!`)) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/orders/${id}`);
      toast.success('Comandă ștearsă cu succes!');
      navigate('/admin/orders');
    } catch (err) {
      console.error(err);
      toast.error('Eroare la ștergerea comenzii');
    }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p>Comanda nu a fost găsită</p>
      </div>
    );
  }

  return (
    <div data-testid="admin-order-detail-page" className="pt-24 pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/admin/orders')}
              data-testid="back-btn"
              className="flex items-center space-x-2 text-neutral-600 hover:text-black mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Înapoi la Comenzi</span>
            </button>
            <h1 className="text-4xl font-bold">COMANDĂ #{order.order_number}</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleDelete}
              data-testid="delete-order-btn"
              className="bg-red-500 text-white px-6 py-3 font-bold uppercase flex items-center space-x-2 hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span>Șterge</span>
            </button>
            <button
              onClick={handleSave}
              data-testid="save-order-btn"
              disabled={saving}
              className="bg-[#CCFF00] text-black px-6 py-3 font-bold uppercase flex items-center space-x-2 hover:bg-[#B3E600] transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Se salvează...' : 'Salvează'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Management */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white border-2 border-neutral-200 p-6">
              <h2 className="font-bold text-xl mb-4">ACȚIUNI RAPIDE</h2>
              <div className="space-y-3">
                <a
                  href={`tel:${order.customer_phone}`}
                  className="w-full bg-green-500 text-white py-3 px-4 font-bold uppercase text-sm hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Sună Clientul</span>
                </a>
                <a
                  href={`mailto:${order.customer_email}?subject=Comandă ${order.order_number}`}
                  className="w-full bg-blue-500 text-white py-3 px-4 font-bold uppercase text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>Trimite Email</span>
                </a>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white border-2 border-neutral-200 p-6">
              <h2 className="font-bold text-xl mb-4">STATUS COMANDĂ</h2>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                data-testid="status-select"
                className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black font-bold"
              >
                <option value="pending">În Așteptare</option>
                <option value="processing">În Procesare</option>
                <option value="shipped">Expediată</option>
                <option value="delivered">Livrată</option>
                <option value="cancelled">Anulată</option>
              </select>
            </div>

            {/* AWB */}
            <div className="bg-white border-2 border-neutral-200 p-6">
              <h2 className="font-bold text-xl mb-4">AWB EXPEDIERE</h2>
              <input
                type="text"
                value={formData.awb}
                onChange={(e) => setFormData({ ...formData, awb: e.target.value })}
                data-testid="awb-input"
                placeholder="Introdu AWB..."
                className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
              />
              <p className="text-sm text-neutral-500 mt-2">
                * Clientul va vedea acest număr în tracking
              </p>
            </div>

            {/* Payment Status */}
            <div className="bg-white border-2 border-neutral-200 p-6">
              <h2 className="font-bold text-xl mb-4">STATUS PLATĂ</h2>
              <div className={`px-4 py-3 font-bold text-center ${
                order.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                  : order.payment_status === 'cod'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
              }`}>
                {order.payment_status === 'paid' ? 'PLĂTITĂ' : 
                 order.payment_status === 'cod' ? 'RAMBURS' : 
                 'ÎN AȘTEPTARE'}
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                Metodă: {order.payment_method || 'Nespecificată'}
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white border border-neutral-200 p-6">
              <h2 className="font-bold text-xl mb-4">DETALII CLIENT</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-500">Nume:</span>
                  <p className="font-bold">{order.customer_name}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Email:</span>
                  <p className="font-bold">{order.customer_email}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Telefon:</span>
                  <p className="font-bold">{order.customer_phone}</p>
                </div>
                <div>
                  <span className="text-neutral-500">Metodă Livrare:</span>
                  <p className="font-bold">{order.shipping_method === 'express' ? 'Expresă' : 'Standard'}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <span className="text-neutral-500">Adresă Livrare:</span>
                <p className="font-bold mt-1">{order.customer_address}</p>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white border-2 border-neutral-200 p-6">
              <h2 className="font-bold text-xl mb-4">PRODUSE COMANDATE</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0">
                    <img 
                      src={item.product_image || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200'} 
                      alt={item.product_name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-lg">{item.product_name}</p>
                      <p className="text-sm text-neutral-600">
                        Mărime: {item.size} • Cantitate: {item.quantity}
                      </p>
                      
                      {/* Version Badge */}
                      {item.version && (
                        <div className="mt-2">
                          <span className={`inline-block px-3 py-1 text-xs font-bold ${
                            item.version === 'player' 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {item.version === 'player' ? '⭐ PLAYER VERSION' : '👕 FAN VERSION'}
                          </span>
                        </div>
                      )}
                      
                      {/* Customization Details */}
                      {item.customization && (
                        <div className="mt-2 bg-[#CCFF00]/20 border border-[#CCFF00] p-3 space-y-1">
                          <p className="font-bold text-sm">🎨 CUSTOMIZARE:</p>
                          {item.customization.name && (
                            <p className="text-sm">• Nume: <span className="font-bold">{item.customization.name}</span></p>
                          )}
                          {item.customization.number && (
                            <p className="text-sm">• Număr: <span className="font-bold">{item.customization.number}</span></p>
                          )}
                          {item.customization.patches && item.customization.patches.length > 0 && (
                            <p className="text-sm">
                              • Patch-uri: <span className="font-bold">
                                {item.customization.patches.map(p => 
                                  p === 'league' ? '🏆 Liga' : 
                                  p === 'ucl' ? '⭐ UCL' : p
                                ).join(', ')}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                      
                      <p className="font-bold mt-2">{item.price_ron} RON x {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{item.price_ron * item.quantity} RON</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t-2 border-neutral-200 flex justify-between text-2xl">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold">{order.total_ron} {order.currency}</span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-white border border-neutral-200 p-6">
              <h2 className="font-bold text-xl mb-4">INFORMAȚII SUPLIMENTARE</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Data Comenzii:</span>
                  <span className="font-bold">{new Date(order.created_at).toLocaleString('ro-RO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ultima Actualizare:</span>
                  <span className="font-bold">{new Date(order.updated_at).toLocaleString('ro-RO')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
