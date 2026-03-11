import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, AlertTriangle, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

// Payment icons
const PAYMENT_ICONS = {
  card: 'https://img.icons8.com/color/48/visa.png',
  mastercard: 'https://img.icons8.com/color/48/mastercard.png',
  applepay: 'https://img.icons8.com/ios-filled/50/apple-pay.png',
  googlepay: 'https://img.icons8.com/color/48/google-pay.png',
  paypal: 'https://img.icons8.com/color/48/paypal.png',
  stripe: 'https://img.icons8.com/color/48/stripe.png',
};

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

  // Check if cart contains bundles or customized products
  const hasRestrictedItems = useMemo(() => {
    return cart.some(item => {
      if (item.product.isBundle) return true;
      if (item.product.customization) {
        const { name, number } = item.product.customization;
        if (name || number) return true;
      }
      return false;
    });
  }, [cart]);

  const hasBundles = useMemo(() => {
    return cart.some(item => item.product.isBundle);
  }, [cart]);

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

  if (cart.length === 0) {
    return (
      <div data-testid="cart-empty" className="pt-24 pb-16 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">COȘUL TĂU ESTE GOL</h1>
        <p className="text-neutral-600 mb-8">Adaugă produse pentru a continua</p>
        <Link 
          to="/products"
          className="bg-black text-white px-8 py-3 font-bold uppercase hover:bg-neutral-800 transition-colors"
        >
          Vezi Produsele
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8">COȘ DE CUMPĂRĂTURI</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const isBundle = item.product.isBundle;
              const productImage = item.product.selectedVariantImage 
                || (item.product.variants && item.product.variants.length > 0 && item.product.variants[0].images && item.product.variants[0].images.length > 0
                  ? item.product.variants[0].images[0]
                  : (item.product.images && item.product.images.length > 0 
                    ? item.product.images[0] 
                    : 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200'));
              
              return (
                <div
                  key={`${item.product.id}-${item.size}`}
                  data-testid={`cart-item-${item.product.id}`}
                  className={`bg-white border p-4 ${isBundle ? 'border-2 border-[#CCFF00]' : 'border-neutral-200'}`}
                >
                  {isBundle && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200">
                      <span className="bg-[#CCFF00] text-black text-xs font-bold px-2 py-1">BUNDLE 1+1</span>
                      <span className="text-sm font-bold">250 RON</span>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <img 
                      src={productImage} 
                      alt={item.product.name}
                      className="w-24 h-24 object-cover"
                    />
                    <div className="flex-1">
                      {isBundle ? (
                        <>
                          <h3 className="font-bold text-lg">{item.product.bundleDetails.mainProduct.team} {item.product.bundleDetails.mainProduct.year}/{(item.product.bundleDetails.mainProduct.year+1).toString().slice(-2)}</h3>
                          <p className="text-sm text-neutral-500">Kit: {item.product.bundleDetails.mainProduct.kitName} | Marime: {item.size}</p>
                          {item.product.customization && (
                            <div className="text-xs text-neutral-600 mt-1">
                              {item.product.customization.name && <p>Nume: {item.product.customization.name}</p>}
                              {item.product.customization.number && <p>Numar: {item.product.customization.number}</p>}
                              {item.product.customization.patches && item.product.customization.patches.length > 0 && (
                                <p>Patch-uri: {item.product.customization.patches.join(', ')}</p>
                              )}
                            </div>
                          )}
                        </>
                      ) : item.product.isCasual ? (
                        <>
                          <h3 className="font-bold text-lg">{item.product.name}</h3>
                          <p className="text-sm text-neutral-500">
                            <span className="bg-[#CCFF00] text-black text-xs font-bold px-1 py-0.5 mr-1">CASUAL</span>
                            {item.product.customization?.color && `Culoare: ${item.product.customization.color}`}
                          </p>
                          <p className="text-sm text-neutral-500">Mărime: {item.size}</p>
                          <p className="font-bold mt-2">{formatPrice(item.product.price_ron)}</p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-bold text-lg">{item.product.name}</h3>
                          <p className="text-sm text-neutral-500">{item.product.team} - {item.product.year}</p>
                          <p className="text-sm text-neutral-500">Marime: {item.size}</p>
                          {item.product.selectedKit && (
                            <p className="text-sm text-neutral-600">
                              Kit: <span className="font-bold">{item.product.selectedKitName || item.product.selectedKit}</span>
                            </p>
                          )}
                          {item.product.selectedVersion && (
                            <span className={`inline-block text-xs font-bold px-2 py-0.5 mt-1 ${item.product.selectedVersion === 'player' ? 'bg-black text-[#CCFF00]' : 'bg-neutral-200 text-neutral-700'}`}>
                              {item.product.selectedVersion === 'player' ? 'PLAYER VERSION' : 'FAN VERSION'}
                            </span>
                          )}
                          {item.product.customization && (
                            <div className="text-xs text-neutral-600 mt-1">
                              {item.product.customization.name && <p>Nume: {item.product.customization.name}</p>}
                              {item.product.customization.number && <p>Numar: {item.product.customization.number}</p>}
                              {item.product.customization.patches && item.product.customization.patches.length > 0 && (
                                <p>Patch-uri: {item.product.customization.patches.map(p => p === 'league' ? 'Liga' : p === 'ucl' ? 'UCL' : p).join(', ')}</p>
                              )}
                            </div>
                          )}
                          <p className="font-bold mt-2">{formatPrice(item.product.price_ron)}</p>
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        data-testid={`remove-item-${item.product.id}`}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="w-8 h-8 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="w-8 h-8 border border-neutral-300 flex items-center justify-center hover:bg-neutral-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Bundle: Free product details */}
                  {isBundle && item.product.bundleDetails?.freeProduct && (
                    <div className="mt-3 pt-3 border-t border-dashed border-green-300 flex gap-4">
                      {item.product.bundleDetails.freeProduct.image && (
                        <img 
                          src={item.product.bundleDetails.freeProduct.image} 
                          alt="Free"
                          className="w-20 h-20 object-cover border border-green-200 rounded"
                        />
                      )}
                      <div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">GRATIS</span>
                        <p className="font-bold mt-1">{item.product.bundleDetails.freeProduct.team} 25/26</p>
                        <p className="text-sm text-neutral-500">Marime: {item.product.bundleDetails.freeProduct.size}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">SUMAR COMANDĂ</h2>
              
              {/* Payment restriction warning */}
              {hasRestrictedItems && (
                <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-400 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800 text-sm">
                        {hasBundles && hasCustomizedProducts 
                          ? 'Coș cu bundle și produse personalizate'
                          : hasBundles 
                            ? 'Coș cu bundle'
                            : 'Coș cu produse personalizate'}
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        {hasBundles 
                          ? 'Bundle-urile necesită plată cu cardul (nu ramburs).'
                          : 'Produsele personalizate necesită plată cu cardul (nu ramburs).'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-bold">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Livrare</span>
                  <span className="font-bold">Se calculează la checkout</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between text-xl">
                  <span className="font-bold">TOTAL</span>
                  <span className="font-bold">{formatPrice(getCartTotal())}</span>
                </div>
              </div>

              {/* Payment methods accepted */}
              <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                <p className="text-xs text-neutral-600 mb-2 font-medium">Metode de plată acceptate:</p>
                <div className="flex flex-wrap items-center gap-2">
                  <img src={PAYMENT_ICONS.card} alt="Visa" className="h-6 w-auto" />
                  <img src={PAYMENT_ICONS.mastercard} alt="Mastercard" className="h-6 w-auto" />
                  <img src={PAYMENT_ICONS.applepay} alt="Apple Pay" className="h-6 w-auto" />
                  <img src={PAYMENT_ICONS.googlepay} alt="Google Pay" className="h-6 w-auto" />
                  <img src={PAYMENT_ICONS.paypal} alt="PayPal" className="h-6 w-auto" />
                  {!hasRestrictedItems && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+ Ramburs</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                data-testid="checkout-btn"
                className="w-full bg-[#CCFF00] text-black py-4 px-8 font-bold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Finalizează Comanda
              </button>
              <Link 
                to="/products"
                className="block text-center mt-4 text-sm text-neutral-600 hover:text-black"
              >
                Continuă cumpărăturile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
