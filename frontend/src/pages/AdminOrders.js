import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await axios.get(`${API_URL}/api/orders`, { params });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'În Așteptare';
      case 'processing':
        return 'În Procesare';
      case 'shipped':
        return 'Expediată';
      case 'delivered':
        return 'Livrată';
      default:
        return status;
    }
  };

  return (
    <div data-testid="admin-orders-page" className="pt-24 pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold">COMENZI ADMIN</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-bold text-sm ${filter === 'all' ? 'bg-black text-white' : 'bg-white border border-neutral-200'}`}
            >
              Toate
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 font-bold text-sm ${filter === 'pending' ? 'bg-black text-white' : 'bg-white border border-neutral-200'}`}
            >
              În Așteptare
            </button>
            <button
              onClick={() => setFilter('processing')}
              className={`px-4 py-2 font-bold text-sm ${filter === 'processing' ? 'bg-black text-white' : 'bg-white border border-neutral-200'}`}
            >
              Procesare
            </button>
            <button
              onClick={() => setFilter('shipped')}
              className={`px-4 py-2 font-bold text-sm ${filter === 'shipped' ? 'bg-black text-white' : 'bg-white border border-neutral-200'}`}
            >
              Expediate
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Se încarcă...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-neutral-200">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl text-neutral-500">Nu există comenzi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders.map(order => (
              <div
                key={order.id}
                data-testid={`order-card-${order.id}`}
                className="bg-white border border-neutral-200 hover:border-black hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* First Product Image */}
                    <img 
                      src={order.items[0]?.product_image || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200'} 
                      alt="Product"
                      className="w-24 h-24 object-cover"
                    />

                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">#{order.order_number}</h3>
                          <p className="text-sm text-neutral-500">{order.customer_name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(order.status)}
                          <span className="font-bold">{getStatusText(order.status)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-neutral-500">Email:</span>
                          <p className="font-bold">{order.customer_email}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Telefon:</span>
                          <p className="font-bold">{order.customer_phone}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Total:</span>
                          <p className="font-bold">{order.total_ron} {order.currency}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500">Plată:</span>
                          <p className="font-bold">{order.payment_status === 'paid' ? 'Plătită' : 'În Așteptare'}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-sm text-neutral-500">Produse:</span>
                        <p className="font-bold">
                          {order.items.map(item => `${item.product_name} (${item.size}) x${item.quantity}`).join(', ')}
                        </p>
                      </div>

                      {order.awb && (
                        <div className="bg-[#CCFF00]/20 border border-[#CCFF00] px-3 py-2 inline-block mb-4">
                          <span className="text-sm font-bold">AWB: {order.awb}</span>
                        </div>
                      )}

                      <Link
                        to={`/admin/orders/${order.id}`}
                        data-testid={`view-order-${order.id}`}
                        className="inline-flex items-center space-x-2 bg-black text-white px-6 py-2 font-bold uppercase hover:bg-neutral-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Vezi Comandă</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
