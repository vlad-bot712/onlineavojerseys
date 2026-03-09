import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Building2, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Payment method icons as inline SVGs
const ApplePayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
    <path d="M17.0425 8.1225C16.4625 8.8575 15.5775 9.4125 14.7075 9.3525C14.5875 8.4825 14.9925 7.5525 15.5175 6.8925C16.0975 6.1575 17.0625 5.6175 17.8275 5.5725C17.9325 6.4875 17.6025 7.3875 17.0425 8.1225ZM17.8125 9.5625C16.5075 9.4875 15.3975 10.3275 14.7825 10.3275C14.1525 10.3275 13.2075 9.6075 12.1425 9.6225C10.7775 9.6375 9.5175 10.4325 8.8275 11.6775C7.4025 14.1825 8.4675 17.8575 9.8475 19.8825C10.5225 20.8725 11.3325 21.9825 12.3975 21.9375C13.4175 21.8925 13.8075 21.2625 15.0375 21.2625C16.2525 21.2625 16.6125 21.9375 17.6925 21.9225C18.7875 21.8925 19.4775 20.9175 20.1525 19.9275C20.9175 18.7875 21.2325 17.6925 21.2475 17.6325C21.2175 17.6175 18.7125 16.6575 18.6825 13.7625C18.6525 11.3325 20.6625 10.1625 20.7525 10.1025C19.5975 8.3625 17.8125 8.1675 17.8125 9.5625V9.5625Z"/>
  </svg>
);

const GooglePayIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="#4285F4" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
  </svg>
);

const PayPalIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6">
    <path fill="#003087" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/>
    <path fill="#0070E0" d="M23.95 6.243c-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.4 8.88a.567.567 0 0 1-.56.48H6.75l.228-1.452h2.456c.524 0 .968-.382 1.05-.9l1.12-7.106h2.19c4.298 0 7.664-1.746 8.647-6.797.024-.143.047-.288.071-.437.291-1.867-.003-3.137-1.012-4.287.407.455.734.988.973 1.606.596 1.544.598 3.33-.523 5.316z"/>
  </svg>
);

const StripeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#635BFF">
    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
  </svg>
);

// Payment method images URLs
const PAYMENT_ICONS = {
  card: 'https://img.icons8.com/color/48/visa.png',
  mastercard: 'https://img.icons8.com/color/48/mastercard.png',
  applepay: 'https://img.icons8.com/ios-filled/50/apple-pay.png',
  googlepay: 'https://img.icons8.com/color/48/google-pay.png',
  paypal: 'https://img.icons8.com/color/48/paypal.png',
  stripe: 'https://img.icons8.com/color/48/stripe.png',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
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
    payment_method: 'card'
  });

  // Check if cart contains bundles or customized products
  const hasRestrictedItems = useMemo(() => {
    return cart.some(item => {
      // Check for bundle
      if (item.product.isBundle) return true;
      // Check for customization (name or number)
      if (item.product.customization) {
        const { name, number } = item.product.customization;
        if (name || number) return true;
      }
      return false;
    });
  }, [cart]);

  // Check specifically for bundles
  const hasBundles = useMemo(() => {
    return cart.some(item => item.product.isBundle);
  }, [cart]);

  // Check specifically for customized products (not bundles)
  const hasCustomizedProducts = useMemo(() => {
    return cart.some(item => {
      if (item.product.isBundle) return false;
      if (item.product.customization) {
        const { name, number } = item.product.customization;
        return name || number;
      }
      return false;
    });
  }, [cart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      // If switching to ramburs but cart has restricted items, prevent it
      if (name === 'payment_method' && value === 'ramburs' && hasRestrictedItems) {
        toast.error('Ramburs nu este disponibil pentru produse personalizate sau bundle-uri');
        return prev;
      }
      return newData;
    });
  };

  // Apply coupon code
  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'AVO10LEI') {
      setCouponDiscount(10);
      setCouponApplied(true);
      setAppliedCouponCode('AVO10LEI');
      toast.success('Cod de reducere aplicat: -10 RON!');
    } else if (code === 'AVO20') {
      setCouponDiscount(20);
      setCouponApplied(true);
      setAppliedCouponCode('AVO20');
      toast.success('Cod de reducere aplicat: -20 RON!');
    } else {
      setCouponError('Cod de reducere invalid');
      setCouponDiscount(0);
      setCouponApplied(false);
      setAppliedCouponCode('');
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
    setAppliedCouponCode('');
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

    // Prevent ramburs for restricted items
    if (formData.payment_method === 'ramburs' && hasRestrictedItems) {
      toast.error('Ramburs nu este disponibil pentru produse personalizate sau bundle-uri. Selectează altă metodă de plată.');
      return;
    }

    setLoading(true);

    try {
      // Create full address
      const fullAddress = `${formData.customer_street}, ${formData.customer_city}, Județul ${formData.customer_county}, ${formData.customer_zip}, ${formData.customer_country}`;

      // Create order items - split bundles into 2 items (main + free)
      const orderItems = [];
      cart.forEach(item => {
        if (item.product.isBundle && item.product.bundleDetails) {
          const bd = item.product.bundleDetails;
          // Main product (paid)
          orderItems.push({
            product_id: item.product.id + '_main',
            product_name: `BUNDLE: ${bd.mainProduct.team} ${bd.mainProduct.year}/${(bd.mainProduct.year+1).toString().slice(-2)} ${bd.mainProduct.kitName}`,
            product_image: bd.mainProduct.image || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200',
            size: item.size,
            quantity: item.quantity,
            price_ron: item.product.price_ron,
            customization: item.product.customization || null,
            version: item.product.selectedVersion || 'fan',
            kit: bd.mainProduct.kit || 'first',
            kit_name: bd.mainProduct.kitName || 'First Kit'
          });
          // Free product
          orderItems.push({
            product_id: item.product.id + '_free',
            product_name: `BUNDLE GRATIS: ${bd.freeProduct.team} 25/26`,
            product_image: bd.freeProduct.image || 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200',
            size: bd.freeProduct.size,
            quantity: item.quantity,
            price_ron: 0,
            customization: null,
            version: 'fan',
            kit: 'first',
            kit_name: 'First Kit'
          });
        } else {
          const productImage = item.product.selectedVariantImage 
            || (item.product.variants && item.product.variants.length > 0 && item.product.variants[0].images && item.product.variants[0].images.length > 0
              ? item.product.variants[0].images[0]
              : (item.product.images && item.product.images.length > 0 
                ? item.product.images[0] 
                : 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200'));
          orderItems.push({
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
          });
        }
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
        coupon_code: couponApplied ? appliedCouponCode : null,
        coupon_discount: couponDiscount
      };

      const orderRes = await axios.post(`${API_URL}/api/orders`, orderData);
      const order = orderRes.data;

      console.log('Order created:', order);

      // Redirect based on payment method
      if (formData.payment_method === 'card' || formData.payment_method === 'applepay' || formData.payment_method === 'googlepay') {
        // Create Stripe session for card/Apple Pay/Google Pay
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
      } else if (formData.payment_method === 'paypal') {
        // For PayPal - redirect directly to PayPal.me link
        const paypalUsername = 'cristiopris';
        const paypalAmount = finalTotal;
        // Clear cart and redirect directly to PayPal.me
        clearCart();
        // Open PayPal.me in same window
        window.location.href = `https://www.paypal.com/paypalme/${paypalUsername}/${paypalAmount}`;
      } else {
        // For other payment methods (ramburs, transfer), go to success page
        clearCart();
        window.location.href = `/order-success?order_id=${order.id}&payment_method=${formData.payment_method}`;
      }
      
    } catch (err) {
      console.error(err);
      toast.error('A apărut o eroare. Te rugăm să încerci din nou.');
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    setTimeout(() => navigate('/cart'), 100);
    return null;
  }

  const total = getCartTotal();
  
  // Free shipping for test orders (under 5 RON) or test category products
  const isTestOrder = total < 5;
  const shippingCost = isTestOrder ? 0 : (formData.shipping_method === 'express' ? 40 : 20);
  const finalTotal = total + shippingCost - couponDiscount;

  // Payment methods configuration
  const allPaymentMethods = [
    { 
      id: 'card', 
      name: 'Card Bancar', 
      icon: CreditCard,
      customIcon: <StripeIcon />,
      description: 'Visa, Mastercard prin Stripe',
      images: [PAYMENT_ICONS.card, PAYMENT_ICONS.mastercard, PAYMENT_ICONS.stripe],
      allowedForRestricted: true
    },
    { 
      id: 'applepay', 
      name: 'Apple Pay', 
      icon: CreditCard,
      customIcon: <ApplePayIcon />,
      description: 'Plată rapidă cu Apple Pay',
      images: [PAYMENT_ICONS.applepay],
      allowedForRestricted: true
    },
    { 
      id: 'googlepay', 
      name: 'Google Pay', 
      icon: CreditCard,
      customIcon: <GooglePayIcon />,
      description: 'Plată rapidă cu Google Pay',
      images: [PAYMENT_ICONS.googlepay],
      allowedForRestricted: true
    },
    { 
      id: 'paypal', 
      name: 'PayPal', 
      icon: CreditCard,
      customIcon: <PayPalIcon />,
      description: 'Plată prin PayPal',
      images: [PAYMENT_ICONS.paypal],
      allowedForRestricted: true
    },
    { 
      id: 'transfer', 
      name: 'Transfer Bancar', 
      icon: Building2,
      description: 'IBAN: RO40BTRLRONCRT0CU0290301',
      allowedForRestricted: true
    },
    { 
      id: 'ramburs', 
      name: 'Ramburs (Plată la Livrare)', 
      icon: Truck, 
      description: 'Plătești când primești coletul',
      allowedForRestricted: false
    }
  ];

  // Filter payment methods based on cart contents
  const availablePaymentMethods = hasRestrictedItems 
    ? allPaymentMethods.filter(m => m.allowedForRestricted)
    : allPaymentMethods;

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
                      <span className="font-bold">Livrare Expresă (1-2 saptamani)</span>
                    </div>
                    <span className="font-bold text-xl">{formatPrice(40)}</span>
                  </label>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border-2 border-neutral-200 p-6">
                <h2 className="text-2xl font-bold mb-4">METODĂ PLATĂ</h2>
                
                {/* Payment method icons row */}
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Acceptăm:</span>
                  <img src={PAYMENT_ICONS.card} alt="Visa" className="h-8 w-auto" />
                  <img src={PAYMENT_ICONS.mastercard} alt="Mastercard" className="h-8 w-auto" />
                  <img src={PAYMENT_ICONS.stripe} alt="Stripe" className="h-8 w-auto" />
                  <img src={PAYMENT_ICONS.applepay} alt="Apple Pay" className="h-8 w-auto" />
                  <img src={PAYMENT_ICONS.googlepay} alt="Google Pay" className="h-8 w-auto" />
                  <img src={PAYMENT_ICONS.paypal} alt="PayPal" className="h-8 w-auto" />
                </div>

                {/* Warning for restricted items */}
                {hasRestrictedItems && (
                  <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-400 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-amber-800 mb-1">
                          {hasBundles && hasCustomizedProducts 
                            ? 'ATENȚIE: Coșul conține bundle-uri și produse personalizate'
                            : hasBundles 
                              ? 'ATENȚIE: Coșul conține bundle-uri'
                              : 'ATENȚIE: Coșul conține produse personalizate'}
                        </p>
                        <p className="text-sm text-amber-700">
                          {hasBundles 
                            ? 'BUNDLE-URILE SE PLĂTESC CU CARDUL DEOARECE CONȚIN OBIECTE PERSONALIZATE CARE NU POT FI VÂNDUTE ALTORA ÎN CAZUL REFUZĂRII COMENZII.'
                            : 'PRODUSELE PERSONALIZATE (cu nume/număr) SE PLĂTESC CU CARDUL DEOARECE NU POT FI VÂNDUTE ALTORA ÎN CAZUL REFUZĂRII COMENZII.'}
                        </p>
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          Opțiunea "Ramburs" nu este disponibilă pentru aceste produse.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {availablePaymentMethods.map(method => {
                    const Icon = method.icon;
                    const isSelected = formData.payment_method === method.id;
                    return (
                      <label 
                        key={method.id}
                        className={`flex items-center space-x-3 p-4 border-2 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-black bg-[#CCFF00]/10' 
                            : 'border-neutral-200 hover:border-black'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={isSelected}
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                        {method.customIcon ? (
                          <div className="w-6 h-6">{method.customIcon}</div>
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                        <div className="flex-1">
                          <div className="font-bold flex items-center gap-2">
                            {method.name}
                            {method.images && (
                              <div className="flex items-center gap-1">
                                {method.images.slice(0, 2).map((img, idx) => (
                                  <img key={idx} src={img} alt="" className="h-5 w-auto" />
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-neutral-600">{method.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Transfer bancar info */}
                {formData.payment_method === 'transfer' && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-blue-800">Detalii pentru Transfer Bancar:</p>
                        <p className="text-sm text-blue-700 mt-1">
                          <strong>IBAN:</strong> RO40BTRLRONCRT0CU0290301
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Bancă:</strong> Banca Transilvania
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Sumă:</strong> {formatPrice(finalTotal)}
                        </p>
                        <p className="text-xs text-blue-600 mt-2">
                          Comanda va fi procesată după confirmarea plății.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal info */}
                {formData.payment_method === 'paypal' && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <PayPalIcon />
                      <div>
                        <p className="font-bold text-blue-800">Plată prin PayPal</p>
                        <p className="text-sm text-blue-700 mt-1">
                          După plasarea comenzii, vei primi instrucțiuni pentru plata prin PayPal.
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          <strong>Email PayPal:</strong> crissopris80@gmail.com
                        </p>
                        <p className="text-sm text-blue-700">
                          <strong>Sumă de plătit:</strong> {formatPrice(finalTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-neutral-200 p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6">SUMAR COMANDĂ</h2>
                
                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto border-b border-neutral-200 pb-4">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="text-sm">
                      {item.product.isBundle ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-neutral-600">
                              <span className="bg-[#CCFF00] text-black text-xs font-bold px-1">BUNDLE</span>{' '}
                              {item.product.bundleDetails.mainProduct.team} ({item.size}) x{item.quantity}
                            </span>
                            <span className="font-bold">{formatPrice(item.product.price_ron * item.quantity)}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span className="text-xs">+ GRATIS: {item.product.bundleDetails.freeProduct.team} ({item.product.bundleDetails.freeProduct.size})</span>
                            <span className="text-xs font-bold">0 RON</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-neutral-600">
                            {item.product.name} ({item.size}) x{item.quantity}
                            {item.product.customization && (item.product.customization.name || item.product.customization.number) && (
                              <span className="ml-1 text-xs bg-amber-100 text-amber-700 px-1 rounded">PERSONALIZAT</span>
                            )}
                          </span>
                          <span className="font-bold">{formatPrice(item.product.price_ron * item.quantity)}</span>
                        </div>
                      )}
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
                        <span className="font-bold text-green-700">{appliedCouponCode}</span>
                        <span className="text-green-600 ml-2">-{couponDiscount} RON</span>
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
                      <span>Reducere ({appliedCouponCode})</span>
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
