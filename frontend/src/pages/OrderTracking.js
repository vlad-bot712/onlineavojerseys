import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, FileText } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const orderParam = searchParams.get('order');
  const [orderNumber, setOrderNumber] = useState(orderParam || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => {
    // Load saved orders from localStorage
    try {
      const saved = localStorage.getItem('myOrders');
      if (saved) {
        setMyOrders(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    }

    // Auto-search if order number in URL
    if (orderParam) {
      handleSearch(null, orderParam);
    }
  }, [orderParam]);

  const handleSearch = async (e, orderNum = null) => {
    if (e) e.preventDefault();
    
    const searchOrder = orderNum || orderNumber;
    if (!searchOrder.trim()) {
      toast.error('Introdu numărul comenzii');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/orders/number/${searchOrder.trim()}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Comanda nu a fost găsită');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Package className="w-8 h-8" />;
      case 'shipped':
        return <Truck className="w-8 h-8" />;
      case 'delivered':
        return <CheckCircle className="w-8 h-8" />;
      default:
        return <Package className="w-8 h-8" />;
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
    <div data-testid="tracking-page" className="pt-20 sm:pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8">URMĂREȘTE COMANDA</h1>

        {/* Search Form */}
        <div className="bg-white border-2 border-neutral-200 p-4 sm:p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <input
              type="text"
              data-testid="order-number-input"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Nr. comandă (ex: AVO00001)"
              className="flex-1 border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black text-base"
            />
            <button
              type="submit"
              data-testid="search-order-btn"
              disabled={loading}
              className="bg-black text-white px-6 sm:px-8 py-3 font-bold uppercase hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Search className="w-5 h-5" />
              <span>Caută</span>
            </button>
          </form>

          {/* My Recent Orders */}
          {myOrders.length > 0 && !order && (
            <div>
              <h3 className="font-bold text-lg mb-3">COMENZILE MELE RECENTE</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myOrders.map((savedOrder, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setOrderNumber(savedOrder.order_number);
                      handleSearch(null, savedOrder.order_number);
                    }}
                    className="text-left p-4 border-2 border-neutral-200 hover:border-black hover:bg-neutral-50 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">{savedOrder.order_number}</span>
                      <span className={`text-xs px-2 py-1 font-bold ${
                        savedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        savedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {savedOrder.status === 'delivered' ? 'Livrată' :
                         savedOrder.status === 'shipped' ? 'Expediată' :
                         savedOrder.status === 'processing' ? 'Procesare' : 'Așteptare'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>{new Date(savedOrder.date).toLocaleDateString('ro-RO')}</span>
                      <span className="font-bold">{savedOrder.total} {savedOrder.currency}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div data-testid="order-details" className="bg-white border border-neutral-200 p-8">
            {/* Status */}
            <div className="text-center mb-8 pb-8 border-b border-neutral-200">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white mb-4">
                {getStatusIcon(order.status)}
              </div>
              <h2 className="text-3xl font-bold mb-2">{getStatusText(order.status)}</h2>
              <p className="text-neutral-600">Comandă #{order.order_number}</p>
            </div>

            {/* AWB */}
            {order.awb && (
              <div className="bg-[#CCFF00]/20 border-2 border-[#CCFF00] p-6 mb-8">
                <h3 className="font-bold text-xl mb-2">AWB EXPEDIERE</h3>
                <p className="text-2xl font-bold">{order.awb}</p>
                <p className="text-sm text-neutral-600 mt-2">
                  Folosește acest număr pentru a urmări coletul pe site-ul curierului
                </p>
              </div>
            )}

            {/* Customer Details */}
            <div className="mb-8">
              <h3 className="font-bold text-xl mb-4">DETALII LIVRARE</h3>
              <div className="space-y-2 text-neutral-600">
                <p><span className="font-bold text-black">Nume:</span> {order.customer_name}</p>
                <p><span className="font-bold text-black">Email:</span> {order.customer_email}</p>
                <p><span className="font-bold text-black">Telefon:</span> {order.customer_phone}</p>
                <p><span className="font-bold text-black">Adresă:</span> {order.customer_address}</p>
              </div>
            </div>

            {/* Invoice Section - Direct Image Display */}
            {order.invoice_image && (
              <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span>Factura Ta</span>
                </h3>
                
                {/* Direct Invoice Image */}
                <div className="bg-white rounded-xl p-2 shadow-sm mb-4">
                  <img 
                    src={order.invoice_image} 
                    alt={`Factura ${order.order_number}`}
                    className="w-full max-w-md mx-auto rounded-lg"
                    onClick={() => {
                      // Open full image on click
                      if (order.invoice_image.startsWith('data:')) {
                        const newWindow = window.open();
                        newWindow.document.write(`<img src="${order.invoice_image}" style="max-width:100%;height:auto;"/>`);
                      } else {
                        window.open(order.invoice_image, '_blank');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                
                <p className="text-xs text-neutral-500 text-center">Apasă pe imagine pentru a o mări</p>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="font-bold text-xl mb-4">PRODUSE</h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-neutral-100 pb-4">
                    <img 
                      src={item.product_image || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200'} 
                      alt={item.product_name}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{item.product_name}</p>
                      <p className="text-sm text-neutral-600">Mărime: {item.size} • Cantitate: {item.quantity}</p>
                      
                      {/* Kit Type */}
                      {item.kit && (
                        <p className="text-xs text-neutral-700">
                          <span className="font-bold">Kit:</span> {
                            item.kit === 'first' ? 'First Kit' :
                            item.kit === 'second' ? 'Second Kit' :
                            item.kit === 'third' ? 'Third Kit' : item.kit
                          }
                        </p>
                      )}
                      
                      {/* Version Badge */}
                      {item.version && (
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-bold ${
                            item.version === 'player' 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {item.version === 'player' ? 'PLAYER VERSION' : 'FAN VERSION'}
                          </span>
                        </div>
                      )}
                      
                      {/* Customization */}
                      {item.customization && (
                        <div className="bg-[#CCFF00]/30 border border-[#CCFF00] p-2 mt-2 space-y-0.5">
                          <p className="text-xs font-bold">CUSTOMIZARE:</p>
                          {item.customization.name && (
                            <p className="text-xs">• Nume: <span className="font-bold">{item.customization.name}</span></p>
                          )}
                          {item.customization.number && (
                            <p className="text-xs">• Număr: <span className="font-bold">{item.customization.number}</span></p>
                          )}
                          {item.customization.patches && item.customization.patches.length > 0 && (
                            <p className="text-xs">
                              • Patch-uri: <span className="font-bold">
                                {item.customization.patches.map(p => 
                                  p === 'league' ? 'Liga' : 
                                  p === 'ucl' ? 'UCL' : p
                                ).join(', ')}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                      
                      <p className="font-bold mt-1">{item.price_ron} RON</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-200 flex justify-between text-xl">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold">{order.total_ron} {order.currency}</span>
              </div>
            </div>
          </div>
        )}

        {!order && (
          <div className="text-center text-neutral-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Introdu numărul comenzii pentru a vedea detaliile</p>
          </div>
        )}
      </div>
    </div>
  );
}
