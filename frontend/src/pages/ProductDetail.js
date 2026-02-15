import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import axios from 'axios';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ProductDetail() {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(res.data);
      if (res.data.sizes && res.data.sizes.length > 0) {
        setSelectedSize(res.data.sizes[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Produsul nu a putut fi încărcat');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Selectează o mărime');
      return;
    }
    addToCart(product, selectedSize);
    toast.success('Produs adăugat în coș!');
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <p>Produsul nu a fost găsit.</p>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1767163294492-4e6479cab8b4?w=800'];

  return (
    <div data-testid="product-detail-page" className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-neutral-100 overflow-hidden border border-neutral-200">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square border-2 overflow-hidden ${
                      selectedImage === idx ? 'border-black' : 'border-neutral-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-neutral-600 mb-6">{product.team} • {product.year}</p>
            <p className="text-4xl font-bold mb-8">{formatPrice(product.price_ron)}</p>

            {/* Size Selector */}
            <div className="mb-8">
              <h3 className="font-bold mb-3">SELECTEAZĂ MĂRIMEA</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    data-testid={`size-${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border-2 font-bold transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                data-testid="add-to-cart-btn"
                className="w-full bg-black text-white py-4 px-8 font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Adaugă în Coș</span>
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 border-t border-neutral-200 pt-8">
                <h3 className="font-bold mb-3">DESCRIERE</h3>
                <p className="text-neutral-600">{product.description}</p>
              </div>
            )}

            {/* Features */}
            <div className="mt-8 border-t border-neutral-200 pt-8">
              <h3 className="font-bold mb-3">CARACTERISTICI</h3>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#CCFF00]" />
                  <span className="text-neutral-600">Material premium</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#CCFF00]" />
                  <span className="text-neutral-600">Design autentic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-[#CCFF00]" />
                  <span className="text-neutral-600">Confort garantat</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
