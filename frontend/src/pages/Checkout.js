import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Banknote, Building2 } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_street: '',
    customer_city: '',
    customer_county: '',
    customer_zip: '',
    customer_country: 'România',
    shipping_method: 'standard',
    payment_method: 'ramburs'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Apply coupon code
  const handleApplyCoupon = () => {
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'AVO10LEI') {
      setCouponDiscount(10);
      setCouponApplied(true);
      toast.success('Cod de reducere aplicat: -10 RON!');
    } else {
      setCouponError('Cod de reducere invalid');
      setCouponDiscount(0);
      setCouponApplied(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || 
        !formData.customer_street || !formData.customer_city || !formData.customer_county || 
        !formData.customer_zip) {
      toast.error('Completează toate câmpurile obligatorii');
      return;
    }

    setLoading(true);

    try {
      // Create full address
      const fullAddress = `${formData.customer_street}, ${formData.customer_city}, Județul ${formData.customer_county}, ${formData.customer_zip}, ${formData.customer_country}`;

      // Create order items with CORRECT variant image
      const orderItems = cart.map(item => {
        // Use the selectedVariantImage from cart item - this is the CORRECT image for the selected kit
        const productImage = item.product.selectedVariantImage 
          || (item.product.variants && item.product.variants.length > 0 && item.product.variants[0].images && item.product.variants[0].images.length > 0
            ? item.product.variants[0].images[0]
            : (item.product.images && item.product.images.length > 0 
              ? item.product.images[0] 
              : 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200'));
        
        return {
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: productImage,
          size: item.size,
          quantity: item.quantity,
          price_ron: item.product.price_ron,
          customization: item.product.customization || null,
          version: item.product.selectedVersion || 'fan',
          kit: item.product.selectedKit || 'first',
          kit_name: item.product.selectedKitName || null
        };
      });

      const shippingCost = formData.shipping_method === 'express' ? 40 : 20;
      const subtotal = getCartTotal();
      const finalTotal = subtotal + shippingCost - couponDiscount;

      const orderData = {
        items: orderItems,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        customer_address: fullAddress,
        customer_street: formData.customer_street,
        customer_city: formData.customer_city,
        customer_county: formData.customer_county,
        customer_zip: formData.customer_zip,
        customer_country: formData.customer_country,
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        total_ron: finalTotal,
        currency: currency,
        coupon_code: couponApplied ? 'AVO10LEI' : null,
        coupon_discount: couponDiscount
      };

      const orderRes = await axios.post(`${API_URL}/api/orders`, orderData);
      const order = orderRes.data;

      console.log('Order created:', order);

      // Redirect based on payment method
      if (formData.payment_method === 'card') {
        // Create Stripe session for card payment
        const origin_url = window.location.origin;
        const paymentData = {
          order_id: order.id,
          amount_ron: order.total_ron,
          currency: currency,
          origin_url: origin_url
        };
        const paymentRes = await axios.post(`${API_URL}/api/payments/stripe/create-session`, paymentData);
        
        // Clear cart AFTER we have the payment URL
        clearCart();
        window.location.href = paymentRes.data.url;
      } else {
        // For other payment methods (ramburs, transfer, skrill, paysafe), go to success page
        // Clear cart AFTER successful order creation
        clearCart();
        
        // Use window.location instead of navigate to force full page reload
        window.location.href = `/order-success?order_id=${order.id}&payment_method=${formData.payment_method}`;
      }
      
    } catch (err) {
      console.error(err);
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    // Only redirect to cart if not currently processing an order
    setTimeout(() => navigate('/cart'), 100);
    return null;
  }

  const total = getCartTotal();
  const shippingCost = formData.shipping_method === 'express' ? 40 : 20;
  const finalTotal = total + shippingCost - couponDiscount;

  const paymentMethods = [
    { id: 'ramburs', name: 'Ramburs (Plată la Livrare)', icon: Truck, description: 'Plătești când primești coletul' },
    { id: 'card', name: 'Card Bancar (Stripe)', icon: CreditCard, description: 'Visa, Mastercard' },
    { id: 'transfer', name: 'Transfer Bancar', icon: Building2, description: 'IBAN: RO40BTRLRONCRT0CU0290301' },
    { id: 'skrill', name: 'Skrill', icon: CreditCard, description: 'Plată prin Skrill' },
    { id: 'paysafe', name: 'Paysafecard', icon: CreditCard, description: 'Plată cu voucher Paysafe' }
  ];

  return (
    <div data-testid="checkout-page" className="pt-24 pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">FINALIZARE COMANDĂ</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Details */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-2xl font-bold mb-6">DETALII PERSONALE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">Nume Complet *</label>
                    <input
                      type="text"
                      name="customer_name"
                      data-testid="customer-name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Ion Popescu"
                      className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
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
                      placeholder="exemplu@email.com"
                      className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
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
                      placeholder="+40 7XX XXX XXX"
                      className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-2xl font-bold mb-6">ADRESĂ LIVRARE</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">Țară *</label>
                    <input
                      type="text"
                      name="customer_country"
                      value={formData.customer_country}
                      disabled
                      className="w-full border-2 border-neutral-300 px-4 py-3 bg-neutral-100 text-neutral-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Județ *</label>
                    <input
                      type="text"
                      name="customer_county"
                      data-testid="customer-county"
                      value={formData.customer_county}
                      onChange={handleChange}
                      required
                      placeholder="Ex: București, Ilfov, Cluj"
                      className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Localitate *</label>
                    <input
                      type="text"
                      name="customer_city"
                      data-testid="customer-city"
                      value={formData.customer_city}
                      onChange={handleChange}
                      required
                      placeholder="Ex: București, Cluj-Napoca"
                      className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-bold mb-2">Strada, Număr, Bloc, Scară, Apartament *</label>
                    <input
                      type="text"
                      name="customer_street"
                      data-testid="customer-street"
                      value={formData.customer_street}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Str. Exemplu nr. 10, Bl. A, Sc. 1, Ap. 5"
                      className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Cod Poștal *</label>
                    <input
                      type="text"
                      name="customer_zip"
                      data-testid="customer-zip"
                      value={formData.customer_zip}
                      onChange={handleChange}
                      required
                      placeholder="Ex: 010101"
                      className="w-full border-2 border-neutral-200 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-2xl font-bold mb-6">METODĂ LIVRARE</h2>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border-2 border-neutral-200 hover:border-black cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="shipping_method"
                      value="standard"
                      checked={formData.shipping_method === 'standard'}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <span className="font-bold">Livrare Standard (2-3 saptamani)</span>
                    </div>
                    <span className="font-bold text-xl">{formatPrice(20)}</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 border-2 border-neutral-200 hover:border-black cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="shipping_method"
                      value="express"
                      checked={formData.shipping_method === 'express'}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <span className="font-bold">Livrare Expresă (1-2saptamani)</span>
                    </div>
                    <span className="font-bold text-xl">{formatPrice(40)}</span>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-2xl font-bold mb-6">METODĂ PLATĂ</h2>
                <div className="space-y-3">
                  {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                      <label 
                        key={method.id}
                        className={`flex items-center space-x-3 p-4 border-2 cursor-pointer transition-all ${
                          formData.payment_method === method.id 
                            ? 'border-black bg-[#CCFF00]/10' 
                            : 'border-neutral-200 hover:border-black'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={formData.payment_method === method.id}
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                        <Icon className="w-6 h-6" />
                        <div className="flex-1">
                          <div className="font-bold">{method.name}</div>
                          <div className="text-sm text-neutral-600">{method.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-neutral-200 p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">SUMAR COMANDĂ</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto border-b border-neutral-200 pb-4">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                      <span className="text-neutral-600">
                        {item.product.name} ({item.size}) x{item.quantity}
                      </span>
                      <span className="font-bold">{formatPrice(item.product.price_ron * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="mb-6 pb-4 border-b border-neutral-200">
                  <label className="block font-bold mb-2 text-sm">COD DE REDUCERE</label>
                  {!couponApplied ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Ex: AVO001"
                        data-testid="coupon-input"
                        className="flex-1 border-2 border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-black uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        data-testid="apply-coupon-btn"
                        className="bg-black text-white px-4 py-2 font-bold text-sm hover:bg-neutral-800 transition-all"
                      >
                        APLICĂ
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border-2 border-green-200 p-3">
                      <div>
                        <span className="font-bold text-green-700">AVO10LEI</span>
                        <span className="text-green-600 ml-2">-10 RON</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-red-500 font-bold text-sm hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-red-500 text-xs mt-1">{couponError}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="font-bold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Livrare</span>
                    <span className="font-bold">{formatPrice(shippingCost)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Reducere (AVO10LEI)</span>
                      <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-neutral-200 pt-3 flex justify-between text-xl">
                    <span className="font-bold">TOTAL</span>
                    <span className="font-bold">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="submit-order-btn"
                  disabled={loading}
                  className="w-full mt-6 bg-[#CCFF00] text-black py-4 px-8 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
                >
                  {loading ? 'Se procesează...' : 'PLASEAZĂ COMANDA'}
                </button>
                
                <p className="text-xs text-neutral-500 text-center mt-4">
                  Apasă butonul pentru a confirma comanda
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
