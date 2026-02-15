import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

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
              // Get product image safely
              const productImage = item.product.variants && item.product.variants.length > 0 && item.product.variants[0].images && item.product.variants[0].images.length > 0
                ? item.product.variants[0].images[0]
                : (item.product.images && item.product.images.length > 0 
                  ? item.product.images[0] 
                  : 'https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=200');
              
              return (
                <div
                  key={`${item.product.id}-${item.size}`}
                  data-testid={`cart-item-${item.product.id}`}
                  className="bg-white border border-neutral-200 p-4 flex gap-4"
                >
                  <img 
                    src={productImage} 
                    alt={item.product.name}
                    className="w-24 h-24 object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.product.name}</h3>
                    <p className="text-sm text-neutral-500">{item.product.team} • {item.product.year}</p>
                    <p className="text-sm text-neutral-500">Mărime: {item.size}</p>
                    {item.product.customization && (
                      <div className="text-xs text-neutral-600 mt-1">
                        {item.product.customization.name && <p>Nume: {item.product.customization.name}</p>}
                        {item.product.customization.number && <p>Număr: {item.product.customization.number}</p>}
                      </div>
                    )}
                    <p className="font-bold mt-2">{formatPrice(item.product.price_ron)}</p>
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
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">SUMAR COMANDĂ</h2>
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
