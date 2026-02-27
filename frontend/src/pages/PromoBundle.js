import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Gift, Star, Check, Shirt } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const YEARS = [2024, 2025, 2026];

export default function PromoBundle() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [nationals, setNationals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Main product
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedKit, setSelectedKit] = useState(0);
  const [mainSize, setMainSize] = useState('');

  // Free product
  const [freeTeam, setFreeTeam] = useState('');
  const [freeSize, setFreeSize] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [clubRes, natRes] = await Promise.all([
          axios.get(`${API_URL}/api/products?category=echipe-club`),
          axios.get(`${API_URL}/api/products?category=nationale`)
        ]);
        setProducts(clubRes.data);
        setNationals(natRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Unique club teams grouped by league
  const teamsByLeague = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const league = p.league || 'Altele';
      if (!map[league]) map[league] = new Set();
      map[league].add(p.team);
    });
    const result = {};
    Object.keys(map).sort().forEach(l => { result[l] = [...map[l]].sort(); });
    return result;
  }, [products]);

  // Unique national teams
  const uniqueNationals = useMemo(() => {
    return [...new Set(nationals.map(n => n.team))].sort();
  }, [nationals]);

  // Matching club product
  const matchingProduct = useMemo(() => {
    if (!selectedTeam || !selectedYear) return null;
    return products.find(p => p.team === selectedTeam && p.year === parseInt(selectedYear));
  }, [products, selectedTeam, selectedYear]);

  // Main product image from selected variant
  const mainImage = useMemo(() => {
    if (!matchingProduct) return null;
    const v = matchingProduct.variants?.[selectedKit];
    return v?.images?.[0] || matchingProduct.variants?.[0]?.images?.[0] || null;
  }, [matchingProduct, selectedKit]);

  // Free product: find 2025 version (or any)
  const freeProduct = useMemo(() => {
    if (!freeTeam) return null;
    return nationals.find(n => n.team === freeTeam && n.year === 2025)
      || nationals.find(n => n.team === freeTeam);
  }, [nationals, freeTeam]);

  const freeImage = freeProduct?.variants?.[0]?.images?.[0] || null;

  // Reset kit when team/year changes
  useEffect(() => { setSelectedKit(0); }, [selectedTeam, selectedYear]);

  const handleAddToCart = () => {
    if (!selectedTeam) return toast.error('Selecteaza echipa de club!');
    if (!selectedYear) return toast.error('Selecteaza sezonul!');
    if (!mainSize) return toast.error('Selecteaza marimea tricoului principal!');
    if (!freeTeam) return toast.error('Selecteaza nationala!');
    if (!freeSize) return toast.error('Selecteaza marimea tricoului gratuit!');

    const variant = matchingProduct?.variants?.[selectedKit];
    const kitName = variant?.name || `Kit ${selectedKit + 1}`;
    const kitKey = variant?.kit || (selectedKit === 0 ? 'first' : selectedKit === 1 ? 'second' : 'third');

    const bundleProduct = {
      id: `bundle_${Date.now()}`,
      name: `Bundle: ${selectedTeam} + ${freeTeam}`,
      isBundle: true,
      price_ron: 200,
      team: selectedTeam,
      year: parseInt(selectedYear),
      selectedKit: kitKey,
      selectedKitName: kitName,
      selectedVariantImage: mainImage,
      selectedVersion: 'fan',
      customization: null,
      bundleDetails: {
        mainProduct: {
          team: selectedTeam,
          year: parseInt(selectedYear),
          kit: kitKey,
          kitName: kitName,
          image: mainImage,
          league: matchingProduct?.league || ''
        },
        freeProduct: {
          team: freeTeam,
          year: 2025,
          size: freeSize,
          image: freeImage
        }
      }
    };

    addToCart(bundleProduct, mainSize);
    toast.success('Bundle adaugat in cos!');
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div data-testid="promo-bundle-page" className="pt-20 pb-16 min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-4">
          <span className="inline-block bg-red-500 text-white px-3 py-0.5 text-xs font-bold mb-2 animate-pulse">
            PROMOTIE LIMITATA
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">BUNDLE 1+1 GRATIS</h1>
          <p className="text-neutral-500 text-sm mt-1">Tricou club + tricou nationala GRATIS</p>
        </div>

        {/* Price */}
        <div className="bg-black text-white p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="text-neutral-500 line-through text-lg">300 RON</span>
            <span className="text-3xl font-bold text-[#CCFF00]">200 RON</span>
          </div>
          <div className="bg-[#CCFF00] text-black px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3" /> -100 RON
          </div>
        </div>

        {/* === MAIN PRODUCT === */}
        <div className="bg-white border-2 border-black rounded-lg p-4 mb-4">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            TRICOU CLUB
          </h2>

          {/* Team Select */}
          <label className="block text-xs font-bold text-neutral-500 mb-1">ECHIPA</label>
          <select
            data-testid="main-team-select"
            value={selectedTeam}
            onChange={(e) => { setSelectedTeam(e.target.value); setSelectedYear(''); }}
            className="w-full border-2 border-neutral-200 rounded-lg p-3 text-base font-bold mb-4 bg-white focus:outline-none focus:border-black"
          >
            <option value="">Selecteaza echipa</option>
            {Object.entries(teamsByLeague).map(([league, teams]) => (
              <optgroup key={league} label={league}>
                {teams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Season */}
          {selectedTeam && (
            <>
              <label className="block text-xs font-bold text-neutral-500 mb-1">SEZON</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {YEARS.map(year => {
                  const has = products.some(p => p.team === selectedTeam && p.year === year);
                  return (
                    <button
                      key={year}
                      data-testid={`year-${year}`}
                      disabled={!has}
                      onClick={() => setSelectedYear(String(year))}
                      className={`py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${
                        String(year) === selectedYear
                          ? 'border-black bg-black text-white'
                          : has ? 'border-neutral-200 active:border-black' : 'border-neutral-100 text-neutral-300'
                      }`}
                    >
                      {year}/{(year + 1).toString().slice(-2)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Kit */}
          {matchingProduct && matchingProduct.variants?.length > 0 && (
            <>
              <label className="block text-xs font-bold text-neutral-500 mb-1">KIT</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {matchingProduct.variants.map((v, idx) => (
                  <button
                    key={idx}
                    data-testid={`kit-${idx}`}
                    onClick={() => setSelectedKit(idx)}
                    className={`py-2.5 rounded-lg border-2 font-bold text-sm transition-all flex items-center justify-center gap-1 ${
                      selectedKit === idx
                        ? 'border-black bg-[#CCFF00]'
                        : 'border-neutral-200 active:border-black'
                    }`}
                  >
                    {selectedKit === idx && <Check className="w-3.5 h-3.5" />}
                    {v.name || `Kit ${idx + 1}`}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Product Image Preview */}
          {mainImage ? (
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-neutral-100 bg-white">
              <img
                src={mainImage}
                alt={`${selectedTeam} ${selectedYear}`}
                className="w-full aspect-[4/5] object-contain"
              />
            </div>
          ) : selectedTeam && selectedYear ? (
            <div className="mb-4 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 flex items-center justify-center h-48">
              <Shirt className="w-12 h-12 text-neutral-300" />
            </div>
          ) : null}

          {/* Size */}
          {matchingProduct && (
            <>
              <label className="block text-xs font-bold text-neutral-500 mb-1">MARIME</label>
              <div className="grid grid-cols-5 gap-2">
                {SIZES.map(size => (
                  <button
                    key={size}
                    data-testid={`main-size-${size}`}
                    onClick={() => setMainSize(size)}
                    className={`py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${
                      mainSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 active:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* === FREE PRODUCT === */}
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
            <Gift className="w-6 h-6 text-green-500" />
            TRICOU GRATUIT
          </h2>

          {/* National Team Select */}
          <label className="block text-xs font-bold text-green-700 mb-1">NATIONALA</label>
          <select
            data-testid="free-team-select"
            value={freeTeam}
            onChange={(e) => setFreeTeam(e.target.value)}
            className="w-full border-2 border-green-300 rounded-lg p-3 text-base font-bold mb-4 bg-white focus:outline-none focus:border-green-600"
          >
            <option value="">Selecteaza nationala</option>
            {uniqueNationals.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>

          {/* Free Product Image */}
          {freeImage ? (
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-green-200 bg-white">
              <img
                src={freeImage}
                alt={`${freeTeam} 25/26`}
                className="w-full aspect-[4/5] object-contain"
              />
            </div>
          ) : freeTeam ? (
            <div className="mb-4 rounded-lg border-2 border-dashed border-green-200 bg-white flex items-center justify-center h-48">
              <Gift className="w-12 h-12 text-green-200" />
            </div>
          ) : null}

          {/* Preset info */}
          <div className="bg-white/70 rounded-lg p-2 mb-4 text-xs text-green-700 space-y-0.5">
            <p><span className="font-bold">Sezon:</span> 2025/26 (presetat)</p>
            <p><span className="font-bold">Kit:</span> First Kit (presetat)</p>
          </div>

          {/* Free Size */}
          <label className="block text-xs font-bold text-green-700 mb-1">MARIME</label>
          <div className="grid grid-cols-5 gap-2">
            {SIZES.map(size => (
              <button
                key={size}
                data-testid={`free-size-${size}`}
                onClick={() => setFreeSize(size)}
                className={`py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${
                  freeSize === size
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-green-300 bg-white active:border-green-500'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart */}
        <button
          data-testid="bundle-add-to-cart"
          onClick={handleAddToCart}
          className="w-full bg-[#CCFF00] text-black py-4 font-bold text-lg uppercase flex items-center justify-center gap-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all mb-4"
        >
          <ShoppingCart className="w-6 h-6" />
          ADAUGA IN COS - 200 RON
        </button>

        {/* Trust */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded-lg border border-neutral-200">
            <p className="font-bold">Livrare</p>
            <p className="text-neutral-500">2-4 zile</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-neutral-200">
            <p className="font-bold">Calitate</p>
            <p className="text-neutral-500">Premium</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-neutral-200">
            <p className="font-bold">Retur</p>
            <p className="text-neutral-500">14 zile</p>
          </div>
        </div>
      </div>
    </div>
  );
}
