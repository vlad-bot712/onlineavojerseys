import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Gift, ChevronDown, Users, Star, AlertCircle, Check, Shirt, Award } from 'lucide-react';
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
  const [viewerCount] = useState(Math.floor(Math.random() * 11) + 2);

  // Main product state
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedKit, setSelectedKit] = useState(0);
  const [mainSize, setMainSize] = useState('');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [selectedPatches, setSelectedPatches] = useState([]);

  // Free product state
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

  // Group teams by league
  const teamsByLeague = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const league = p.league || 'Altele';
      if (!map[league]) map[league] = new Set();
      map[league].add(p.team);
    });
    // Convert sets to sorted arrays
    const result = {};
    Object.keys(map).sort().forEach(league => {
      result[league] = [...map[league]].sort();
    });
    return result;
  }, [products]);

  // Unique national teams
  const uniqueNationals = useMemo(() => {
    const teams = [...new Set(nationals.map(n => n.team))];
    return teams.sort();
  }, [nationals]);

  // Find matching product for main selection
  const matchingProduct = useMemo(() => {
    if (!selectedTeam || !selectedYear) return null;
    return products.find(p => p.team === selectedTeam && p.year === parseInt(selectedYear));
  }, [products, selectedTeam, selectedYear]);

  // Get main product image
  const mainImage = useMemo(() => {
    if (!matchingProduct) return null;
    const variant = matchingProduct.variants?.[selectedKit];
    return variant?.images?.[0] || matchingProduct.variants?.[0]?.images?.[0] || null;
  }, [matchingProduct, selectedKit]);

  // Get free product data
  const freeProduct = useMemo(() => {
    if (!freeTeam) return null;
    // Prefer year 2025 for 25/26 season
    return nationals.find(n => n.team === freeTeam && n.year === 2025) 
      || nationals.find(n => n.team === freeTeam);
  }, [nationals, freeTeam]);

  const freeImage = freeProduct?.variants?.[0]?.images?.[0] || null;

  // Available patches based on team's league
  const availablePatches = useMemo(() => {
    if (!matchingProduct) return [];
    const patches = [];
    const league = matchingProduct.league;
    if (league) {
      patches.push({ id: league, name: `Patch ${league}` });
    }
    // UCL available for all club teams
    patches.push({ id: 'UCL', name: 'Patch UEFA Champions League' });
    return patches;
  }, [matchingProduct]);

  // Reset kit and patches when team/year changes
  useEffect(() => {
    setSelectedKit(0);
    setSelectedPatches([]);
  }, [selectedTeam, selectedYear]);

  const togglePatch = (patchId) => {
    setSelectedPatches(prev =>
      prev.includes(patchId) ? prev.filter(p => p !== patchId) : [...prev, patchId]
    );
  };

  const handleAddToCart = () => {
    if (!selectedTeam) return toast.error('Selecteaza echipa de club!');
    if (!selectedYear) return toast.error('Selecteaza sezonul!');
    if (!mainSize) return toast.error('Selecteaza marimea tricoului principal!');
    if (!freeTeam) return toast.error('Selecteaza nationala pentru tricoul gratuit!');
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
      customization: (customName || customNumber || selectedPatches.length > 0) ? {
        name: customName || null,
        number: customNumber || null,
        patches: selectedPatches
      } : null,
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
    <div data-testid="promo-bundle-page" className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-neutral-100 to-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-block bg-red-500 text-white px-4 py-1 text-sm font-bold mb-4 animate-pulse">
            PROMOTIE LIMITATA
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">BUNDLE 1+1 GRATIS</h1>
          <p className="text-neutral-600">Cumperi un tricou de club, primesti unul de nationala GRATIS!</p>
        </div>

        {/* Price Banner */}
        <div className="bg-gradient-to-r from-black to-neutral-800 text-white p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-neutral-400 line-through text-xl">300 RON</p>
              <p className="text-5xl font-bold text-[#CCFF00]">200 RON</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#CCFF00] text-black px-4 py-2 rounded font-bold">
                <Star className="w-5 h-5 inline mr-1" />
                ECONOMISESTI 100 RON
              </div>
              <div className="bg-orange-500/20 border border-orange-400 px-4 py-2 rounded flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400 animate-pulse" />
                <span className="text-orange-300 font-bold text-sm">+{viewerCount} persoane vad acum</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left - Live Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border-2 border-neutral-200 p-4 rounded-lg sticky top-24">
              <h3 className="font-bold text-lg mb-4">PREVIZUALIZARE</h3>

              {/* Main product preview */}
              <div className="mb-4">
                <p className="text-xs font-bold text-neutral-500 mb-2">TRICOU PRINCIPAL</p>
                {mainImage ? (
                  <img src={mainImage} alt="Main" className="w-full aspect-square object-cover rounded border" />
                ) : (
                  <div className="w-full aspect-square bg-neutral-100 rounded border flex items-center justify-center text-neutral-400">
                    <Shirt className="w-16 h-16" />
                  </div>
                )}
                {selectedTeam && (
                  <div className="mt-2 text-sm space-y-1">
                    <p className="font-bold">{selectedTeam} {selectedYear}</p>
                    {matchingProduct?.variants?.[selectedKit] && (
                      <p className="text-neutral-600">{matchingProduct.variants[selectedKit].name}</p>
                    )}
                    {mainSize && <p className="text-neutral-600">Marime: {mainSize}</p>}
                    {customName && <p className="text-neutral-600">Nume: {customName}</p>}
                    {customNumber && <p className="text-neutral-600">Numar: {customNumber}</p>}
                    {selectedPatches.length > 0 && (
                      <p className="text-neutral-600">Patch-uri: {selectedPatches.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Free product preview */}
              <div className="border-t-2 border-dashed border-green-300 pt-4">
                <p className="text-xs font-bold text-green-600 mb-2 flex items-center gap-1">
                  <Gift className="w-4 h-4" /> TRICOU GRATUIT
                </p>
                {freeImage ? (
                  <img src={freeImage} alt="Free" className="w-full aspect-square object-cover rounded border border-green-200" />
                ) : (
                  <div className="w-full aspect-square bg-green-50 rounded border border-green-200 flex items-center justify-center text-green-300">
                    <Gift className="w-16 h-16" />
                  </div>
                )}
                {freeTeam && (
                  <div className="mt-2 text-sm space-y-1">
                    <p className="font-bold text-green-700">{freeTeam} 25/26</p>
                    {freeSize && <p className="text-green-600">Marime: {freeSize}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right - Configurator */}
          <div className="lg:col-span-3 space-y-6">

            {/* === SECTION 1: MAIN PRODUCT === */}
            <div className="bg-white border-2 border-black p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                TRICOU PRINCIPAL (Club)
              </h2>

              {/* Team Select */}
              <div className="mb-5">
                <label className="block text-sm font-bold mb-2">ECHIPA</label>
                <div className="relative">
                  <select
                    data-testid="main-team-select"
                    value={selectedTeam}
                    onChange={(e) => { setSelectedTeam(e.target.value); setSelectedYear(''); }}
                    className="w-full border-2 border-neutral-200 p-3 font-bold focus:outline-none focus:border-black appearance-none bg-white pr-10"
                  >
                    <option value="">-- Selecteaza echipa --</option>
                    {Object.entries(teamsByLeague).map(([league, teams]) => (
                      <optgroup key={league} label={league}>
                        {teams.map(team => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-neutral-400" />
                </div>
              </div>

              {/* Season/Year Select */}
              {selectedTeam && (
                <div className="mb-5">
                  <label className="block text-sm font-bold mb-2">SEZON / AN</label>
                  <div className="flex gap-2">
                    {YEARS.map(year => {
                      const hasProduct = products.some(p => p.team === selectedTeam && p.year === year);
                      return (
                        <button
                          key={year}
                          data-testid={`year-${year}`}
                          disabled={!hasProduct}
                          onClick={() => setSelectedYear(String(year))}
                          className={`flex-1 py-3 border-2 font-bold transition-all ${
                            String(year) === selectedYear
                              ? 'border-black bg-black text-white'
                              : hasProduct
                                ? 'border-neutral-200 hover:border-black'
                                : 'border-neutral-100 text-neutral-300 cursor-not-allowed'
                          }`}
                        >
                          {year}/{(year + 1).toString().slice(-2)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kit Select */}
              {matchingProduct && matchingProduct.variants && matchingProduct.variants.length > 0 && (
                <div className="mb-5">
                  <label className="block text-sm font-bold mb-2">KIT</label>
                  <div className="grid grid-cols-3 gap-2">
                    {matchingProduct.variants.map((v, idx) => (
                      <button
                        key={idx}
                        data-testid={`kit-${idx}`}
                        onClick={() => setSelectedKit(idx)}
                        className={`py-3 px-2 border-2 font-bold text-sm transition-all flex items-center justify-center gap-1 ${
                          selectedKit === idx
                            ? 'border-black bg-[#CCFF00]'
                            : 'border-neutral-200 hover:border-black'
                        }`}
                      >
                        {selectedKit === idx && <Check className="w-4 h-4 flex-shrink-0" />}
                        {v.name || `Kit ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customization: Name + Number */}
              {matchingProduct && (
                <div className="mb-5">
                  <label className="block text-sm font-bold mb-2">PERSONALIZARE (optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        data-testid="custom-name"
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                        placeholder="Nume (ex: POPESCU)"
                        maxLength={15}
                        className="w-full border-2 border-neutral-200 px-3 py-2.5 focus:outline-none focus:border-black uppercase text-sm"
                      />
                    </div>
                    <div>
                      <input
                        data-testid="custom-number"
                        type="number"
                        value={customNumber}
                        onChange={(e) => setCustomNumber(e.target.value)}
                        placeholder="Numar (ex: 10)"
                        min="0"
                        max="99"
                        className="w-full border-2 border-neutral-200 px-3 py-2.5 focus:outline-none focus:border-black text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Patches */}
              {availablePatches.length > 0 && matchingProduct && (
                <div className="mb-5">
                  <label className="block text-sm font-bold mb-2">PATCH-URI</label>
                  <div className="space-y-2">
                    {availablePatches.map(patch => (
                      <label
                        key={patch.id}
                        data-testid={`patch-${patch.id}`}
                        className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all ${
                          selectedPatches.includes(patch.id)
                            ? 'border-black bg-[#CCFF00]/30'
                            : 'border-neutral-200 hover:border-black'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPatches.includes(patch.id)}
                          onChange={() => togglePatch(patch.id)}
                          className="w-5 h-5"
                        />
                        <Award className="w-5 h-5" />
                        <span className="font-bold text-sm">{patch.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Size */}
              {matchingProduct && (
                <div>
                  <label className="block text-sm font-bold mb-2">MARIME TRICOU PRINCIPAL</label>
                  <div className="flex gap-2">
                    {SIZES.map(size => (
                      <button
                        key={size}
                        data-testid={`main-size-${size}`}
                        onClick={() => setMainSize(size)}
                        className={`flex-1 py-3 border-2 font-bold transition-all ${
                          mainSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-neutral-200 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 bg-yellow-50 border border-yellow-300 p-2 rounded flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800">
                      <strong>Verifica tabelul de marimi</strong> - Fan si Player Version au sizing diferit!
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* === SECTION 2: FREE PRODUCT === */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-6 flex items-center text-green-700">
                <Gift className="w-8 h-8 mr-3 text-green-500" />
                TRICOU GRATUIT (Nationala)
              </h2>

              {/* National Team Select */}
              <div className="mb-5">
                <label className="block text-sm font-bold mb-2 text-green-800">NATIONALA</label>
                <div className="relative">
                  <select
                    data-testid="free-team-select"
                    value={freeTeam}
                    onChange={(e) => setFreeTeam(e.target.value)}
                    className="w-full border-2 border-green-300 p-3 font-bold focus:outline-none focus:border-green-600 bg-white appearance-none pr-10"
                  >
                    <option value="">-- Selecteaza nationala --</option>
                    {uniqueNationals.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none text-green-400" />
                </div>
              </div>

              {/* Info: Year preset */}
              <div className="mb-5 bg-white/60 p-3 rounded border border-green-200">
                <p className="text-sm text-green-700">
                  <strong>Sezon:</strong> 2025/26 (presetat)
                </p>
                <p className="text-sm text-green-700">
                  <strong>Kit:</strong> First Kit (presetat)
                </p>
                <p className="text-sm text-green-700">
                  <strong>Personalizare:</strong> Nu este disponibila pentru produsul gratuit
                </p>
              </div>

              {/* Free Size */}
              <div>
                <label className="block text-sm font-bold mb-2 text-green-800">MARIME TRICOU GRATUIT</label>
                <div className="flex gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      data-testid={`free-size-${size}`}
                      onClick={() => setFreeSize(size)}
                      className={`flex-1 py-3 border-2 font-bold transition-all ${
                        freeSize === size
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-green-300 bg-white hover:border-green-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              data-testid="bundle-add-to-cart"
              onClick={handleAddToCart}
              className="w-full bg-[#CCFF00] text-black py-5 font-bold text-xl uppercase flex items-center justify-center gap-3 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
            >
              <ShoppingCart className="w-7 h-7" />
              <span>ADAUGA IN COS - 200 RON</span>
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="bg-neutral-100 p-3 rounded">
                <p className="font-bold">Livrare rapida</p>
                <p className="text-neutral-600">2-4 zile</p>
              </div>
              <div className="bg-neutral-100 p-3 rounded">
                <p className="font-bold">Calitate premium</p>
                <p className="text-neutral-600">Garantat</p>
              </div>
              <div className="bg-neutral-100 p-3 rounded">
                <p className="font-bold">Retur gratuit</p>
                <p className="text-neutral-600">14 zile</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
