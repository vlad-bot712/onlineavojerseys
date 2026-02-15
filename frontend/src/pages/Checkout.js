import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { formatPrice, currency, convertPrice, EUR_TO_RON } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    shipping_method: 'standard'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.customer_address) {
      toast.error('Completează toate câmpurile obligatorii');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderItems = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0] || '',
        size: item.size,
        quantity: item.quantity,
        price_ron: item.product.price_ron
      }));

      const orderData = {
        items: orderItems,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        shipping_method: formData.shipping_method,
        total_ron: getCartTotal(),
        currency: currency
      };

      const orderRes = await axios.post(`${API_URL}/api/orders`, orderData);
      const order = orderRes.data;

      // Create Stripe payment session
      const origin_url = window.location.origin;
      const paymentData = {
        order_id: order.id,
        amount_ron: order.total_ron,
        currency: currency,
        origin_url: origin_url
      };

      const paymentRes = await axios.post(`${API_URL}/api/payments/stripe/create-session`, paymentData);
      
      // Clear cart and redirect to Stripe
      clearCart();
      window.location.href = paymentRes.data.url;
      
    } catch (err) {
      console.error(err);
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const total = getCartTotal();
  const shippingCost = formData.shipping_method === 'express' ? 30 : 15;
  const finalTotal = total + shippingCost;

  return (
    <div data-testid="checkout-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">FINALIZARE COMANDĂ</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-2xl font-bold mb-6">DETALII CLIENT</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-2">Nume Complet *</label>
                    <input
                      type="text"
                      name="customer_name"
                      data-testid="customer-name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Email *</label>
                    <input
                      type="email"
                      name="customer_email"
                      data-testid="customer-email"
                      value={formData.customer_email}
                      onChange={handleChange}
                      required
                      className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Telefon *</label>
                    <input
                      type="tel"
                      name="customer_phone"
                      data-testid="customer-phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Adresă Completă *</label>
                    <textarea
                      name="customer_address"
                      data-testid="customer-address"
                      value={formData.customer_address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full border border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white border border-neutral-200 p-6">
                <h2 className="text-2xl font-bold mb-6">METODĂ LIVRARE</h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="shipping_method"
                      value="standard"
                      checked={formData.shipping_method === 'standard'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">Livrare Standard (2-3 zile)</span>
                    <span className="font-bold">{formatPrice(15)}</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="shipping_method"
                      value="express"
                      checked={formData.shipping_method === 'express'}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">Livrare Expresă (24h)</span>
                    <span className="font-bold">{formatPrice(30)}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-neutral-200 p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">SUMAR COMANDĂ</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                      <span className="text-neutral-600">
                        {item.product.name} ({item.size}) x{item.quantity}
                      </span>
                      <span className="font-bold">{formatPrice(item.product.price_ron * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-neutral-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-bold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Livrare</span>
                    <span className="font-bold">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 flex justify-between text-xl">
                    <span className="font-bold">TOTAL</span>
                    <span className="font-bold">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="submit-order-btn"
                  disabled={loading}
                  className="w-full mt-6 bg-[#CCFF00] text-black py-4 px-8 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{loading ? 'Se procesează...' : 'Plătește cu Cardul'}</span>
                </button>
                
                <p className="text-xs text-neutral-500 text-center mt-4">
                  Vei fi redirecționat către pagina de plată securizată Stripe
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
