import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Gift, Star, Check, Shirt, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const YEARS = [2024, 2025, 2026];

function TeamPicker({ teams, selected, onSelect, label, placeholder, color = 'black' }) {
  const [open, setOpen] = useState(false);
  const isGreen = color === 'green';

  // Resolve display name from selected ID
  const displayName = useMemo(() => {
    if (!selected) return '';
    if (typeof teams[0] === 'string') return selected;
    for (const g of teams) {
      const found = g.items?.find(i => i.id === selected);
      if (found) return found.name;
    }
    return selected;
  }, [selected, teams]);

  return (
    <div className="mb-4">
      <label className={`block text-xs font-bold mb-1 ${isGreen ? 'text-green-700' : 'text-neutral-500'}`}>{label}</label>
      <button
        data-testid={isGreen ? 'free-team-select' : 'main-team-select'}
        onClick={() => setOpen(!open)}
        className={`w-full text-left border-2 rounded-lg p-3 text-base font-bold flex items-center justify-between ${
          isGreen
            ? selected ? 'border-green-500 bg-green-50' : 'border-green-300 bg-white'
            : selected ? 'border-black' : 'border-neutral-200'
        }`}
        style={{ fontSize: '16px' }}
      >
        <span className={selected ? '' : 'text-neutral-400'}>{displayName || placeholder}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''} ${isGreen ? 'text-green-500' : 'text-neutral-400'}`} />
      </button>

      {open && (
        <div className={`mt-1 border-2 rounded-lg overflow-hidden ${isGreen ? 'border-green-300' : 'border-neutral-200'}`}>
          <div className="max-h-72 overflow-y-auto">
            {typeof teams[0] === 'string' ? (
              teams.map(team => (
                <button
                  key={team}
                  data-testid={`team-opt-${team}`}
                  onClick={() => { onSelect(team); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold border-b last:border-0 flex items-center justify-between active:bg-neutral-100 ${
                    selected === team ? (isGreen ? 'bg-green-100 text-green-800' : 'bg-black text-white') : 'bg-white'
                  }`}
                >
                  {team}
                  {selected === team && <Check className="w-4 h-4" />}
                </button>
              ))
            ) : (
              teams.map(group => (
                <div key={group.label}>
                  <div className={`px-4 py-2 text-xs font-bold sticky top-0 ${
                    group.type === 'retro' ? 'bg-amber-100 text-amber-700' :
                    group.type === 'limited' ? 'bg-orange-100 text-orange-700' :
                    'bg-neutral-100 text-neutral-500'
                  }`}>
                    {group.label}
                  </div>
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      data-testid={`team-opt-${item.id}`}
                      onClick={() => { onSelect(item.id); setOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold border-b last:border-0 flex items-center justify-between active:bg-neutral-100 ${
                        selected === item.id ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {item.name}
                      {selected === item.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromoBundle() {
  const { addToCart } = useCart();
  const [clubProducts, setClubProducts] = useState([]);
  const [retroProducts, setRetroProducts] = useState([]);
  const [limitedProducts, setLimitedProducts] = useState([]);
  const [nationals, setNationals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedKit, setSelectedKit] = useState(0);
  const [mainSize, setMainSize] = useState('');
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('fan');
  const [selectedPatches, setSelectedPatches] = useState([]);

  const [freeTeam, setFreeTeam] = useState('');
  const [freeSize, setFreeSize] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [clubRes, natRes, retroRes, limitedRes] = await Promise.all([
          axios.get(`${API_URL}/api/products?category=echipe-club`),
          axios.get(`${API_URL}/api/products?category=nationale`),
          axios.get(`${API_URL}/api/products?category=retro`),
          axios.get(`${API_URL}/api/products?category=limited-edition`)
        ]);
        setClubProducts(clubRes.data);
        setNationals(natRes.data);
        setRetroProducts(retroRes.data);
        setLimitedProducts(limitedRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Build picker groups: Club teams by league, then Retro, then Limited Edition
  const pickerGroups = useMemo(() => {
    const groups = [];
    // Club teams grouped by league
    const leagueMap = {};
    clubProducts.forEach(p => {
      const league = p.league || 'Altele';
      if (!leagueMap[league]) leagueMap[league] = new Set();
      leagueMap[league].add(p.team);
    });
    Object.keys(leagueMap).sort().forEach(league => {
      groups.push({
        label: league,
        type: 'club',
        items: [...leagueMap[league]].sort().map(team => ({ id: `club:${team}`, name: team }))
      });
    });
    // Retro
    if (retroProducts.length > 0) {
      groups.push({
        label: 'RETRO',
        type: 'retro',
        items: retroProducts.map(p => ({ id: `retro:${p.id}`, name: p.name }))
      });
    }
    // Limited Edition
    if (limitedProducts.length > 0) {
      groups.push({
        label: 'LIMITED EDITION',
        type: 'limited',
        items: limitedProducts.map(p => ({ id: `limited:${p.id}`, name: p.name }))
      });
    }
    return groups;
  }, [clubProducts, retroProducts, limitedProducts]);

  const uniqueNationals = useMemo(() => {
    return [...new Set(nationals.map(n => n.team))].sort();
  }, [nationals]);

  // Parse selection type
  const selectionType = useMemo(() => {
    if (!selectedProductId) return null;
    if (selectedProductId.startsWith('club:')) return 'club';
    if (selectedProductId.startsWith('retro:')) return 'retro';
    if (selectedProductId.startsWith('limited:')) return 'limited';
    return null;
  }, [selectedProductId]);

  const selectedTeamName = useMemo(() => {
    if (!selectedProductId) return '';
    const val = selectedProductId.split(':').slice(1).join(':');
    if (selectionType === 'club') return val;
    // For retro/limited, find the product name
    const allSpecial = [...retroProducts, ...limitedProducts];
    const found = allSpecial.find(p => p.id === val);
    return found?.name || val;
  }, [selectedProductId, selectionType, retroProducts, limitedProducts]);

  // For club: available years
  const availableYears = useMemo(() => {
    if (selectionType !== 'club') return [];
    const team = selectedProductId.replace('club:', '');
    return YEARS.filter(y => clubProducts.some(p => p.team === team && p.year === y));
  }, [clubProducts, selectedProductId, selectionType]);

  // Matching product
  const matchingProduct = useMemo(() => {
    if (!selectedProductId) return null;
    if (selectionType === 'club') {
      if (!selectedYear) return null;
      const team = selectedProductId.replace('club:', '');
      return clubProducts.find(p => p.team === team && p.year === parseInt(selectedYear));
    }
    const prodId = selectedProductId.split(':').slice(1).join(':');
    const allSpecial = [...retroProducts, ...limitedProducts];
    return allSpecial.find(p => p.id === prodId) || null;
  }, [selectedProductId, selectionType, selectedYear, clubProducts, retroProducts, limitedProducts]);

  const mainImage = useMemo(() => {
    if (!matchingProduct) return null;
    if (selectionType === 'club') {
      const v = matchingProduct.variants?.[selectedKit];
      return v?.images?.[0] || matchingProduct.variants?.[0]?.images?.[0] || null;
    }
    // Retro/Limited have 1 variant
    return matchingProduct.variants?.[0]?.images?.[0] || null;
  }, [matchingProduct, selectedKit, selectionType]);

  const freeProduct = useMemo(() => {
    if (!freeTeam) return null;
    return nationals.find(n => n.team === freeTeam && n.year === 2025)
      || nationals.find(n => n.team === freeTeam);
  }, [nationals, freeTeam]);

  const freeImage = freeProduct?.variants?.[0]?.images?.[0] || null;

  // Is club type (shows year/kit/version selectors)
  const isClub = selectionType === 'club';
  const isRetro = selectionType === 'retro';
  const isLimited = selectionType === 'limited';

  useEffect(() => { setSelectedKit(0); }, [selectedProductId, selectedYear]);

  // Force fan version for retro
  useEffect(() => {
    if (isRetro) setSelectedVersion('fan');
  }, [isRetro]);

  const onProductChange = (val) => {
    setSelectedProductId(val);
    setSelectedYear('');
    setSelectedKit(0);
    setMainSize('');
    setSelectedVersion('fan');
    setSelectedPatches([]);
  };

  const handleAddToCart = () => {
    if (!selectedProductId) return toast.error('Selecteaza produsul!');
    if (isClub && !selectedYear) return toast.error('Selecteaza sezonul!');
    if (!mainSize) return toast.error('Selecteaza marimea tricoului principal!');
    if (!freeTeam) return toast.error('Selecteaza nationala!');
    if (!freeSize) return toast.error('Selecteaza marimea tricoului gratuit!');
    if (!matchingProduct) return toast.error('Produsul nu a fost gasit!');

    const variant = matchingProduct.variants?.[isClub ? selectedKit : 0];
    const kitName = isClub ? (variant?.name || `Kit ${selectedKit + 1}`) : (variant?.name || matchingProduct.name);
    const kitKey = isClub ? (variant?.kit || (selectedKit === 0 ? 'first' : selectedKit === 1 ? 'second' : 'third')) : 'first';
    const year = isClub ? parseInt(selectedYear) : matchingProduct.year;

    const bundleProduct = {
      id: `bundle_${Date.now()}`,
      name: `Bundle: ${selectedTeamName} + ${freeTeam}`,
      isBundle: true,
      price_ron: 200,
      team: selectedTeamName,
      year: year,
      selectedKit: kitKey,
      selectedKitName: kitName,
      selectedVariantImage: mainImage,
      selectedVersion: selectedVersion,
      customization: (customName || customNumber || selectedPatches.length > 0) ? {
        name: customName || null,
        number: customNumber || null,
        patches: selectedPatches.length > 0 ? selectedPatches : null,
      } : null,
      bundleDetails: {
        mainProduct: {
          team: selectedTeamName,
          year: year,
          kit: kitKey,
          kitName: kitName,
          image: mainImage,
          league: matchingProduct.league || '',
          category: matchingProduct.category || 'echipe-club'
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

  // Display name for picker
  const pickerDisplayName = useMemo(() => {
    if (!selectedProductId) return '';
    const groups = pickerGroups.flat();
    for (const g of pickerGroups) {
      const found = g.items.find(i => i.id === selectedProductId);
      if (found) return found.name;
    }
    return selectedTeamName;
  }, [selectedProductId, pickerGroups, selectedTeamName]);

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
            TRICOU PRINCIPAL
          </h2>

          {/* Product Picker */}
          <TeamPicker
            teams={pickerGroups}
            selected={selectedProductId}
            onSelect={onProductChange}
            label="PRODUS"
            placeholder="Selecteaza tricoul"
          />

          {/* Category badge */}
          {selectionType && (
            <div className="mb-3 -mt-2">
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                isRetro ? 'bg-amber-100 text-amber-700' :
                isLimited ? 'bg-orange-100 text-orange-700' :
                'bg-neutral-100 text-neutral-600'
              }`}>
                {isRetro ? 'RETRO' : isLimited ? 'LIMITED EDITION' : 'CLUB'}
              </span>
            </div>
          )}

          {/* Season - only for club */}
          {isClub && (
            <>
              <label className="block text-xs font-bold text-neutral-500 mb-1">SEZON</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {YEARS.map(year => {
                  const has = availableYears.includes(year);
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

          {/* Kit - only for club */}
          {isClub && (
            <>
              <label className="block text-xs font-bold text-neutral-500 mb-1">KIT</label>
              {matchingProduct && matchingProduct.variants?.length > 0 ? (
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
              ) : (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {['First Kit', 'Second Kit', 'Third Kit'].map((k, idx) => (
                    <button key={idx} disabled className="py-2.5 rounded-lg border-2 border-neutral-100 text-neutral-300 font-bold text-sm">{k}</button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Customization */}
          <label className="block text-xs font-bold text-neutral-500 mb-1">PERSONALIZARE (optional)</label>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              data-testid="custom-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value.toUpperCase())}
              placeholder="Nume (ex: POPESCU)"
              maxLength={15}
              className="border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm font-bold uppercase focus:outline-none focus:border-black"
              style={{ fontSize: '16px' }}
            />
            <input
              data-testid="custom-number"
              type="number"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
              placeholder="Nr (ex: 10)"
              min="0"
              max="99"
              className="border-2 border-neutral-200 rounded-lg px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-black"
              style={{ fontSize: '16px' }}
            />
          </div>

          {/* Version - not for retro or limited */}
          {!isRetro && !isLimited && (
            <>
              <label className="block text-xs font-bold text-neutral-500 mb-1">VERSIUNE</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['fan', 'player'].map(v => (
                  <button
                    key={v}
                    data-testid={`version-${v}`}
                    onClick={() => setSelectedVersion(v)}
                    className={`py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${
                      selectedVersion === v
                        ? v === 'player' ? 'border-black bg-black text-[#CCFF00]' : 'border-black bg-black text-white'
                        : 'border-neutral-200 active:border-black'
                    }`}
                  >
                    {v === 'fan' ? 'FAN VERSION' : 'PLAYER VERSION'}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Retro: show Fan Version fixed */}
          {isRetro && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-neutral-500 mb-1">VERSIUNE</label>
              <div className="border-2 border-black rounded-lg px-4 py-2.5 bg-black text-white font-bold text-sm text-center">
                FAN VERSION
              </div>
            </div>
          )}

          {/* Patches - only for club/limited */}
          {(isClub || isLimited) && (
            <>
              <label className="block text-xs font-bold text-neutral-500 mb-1">PATCH-URI (optional)</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { id: 'UCL', name: 'Champions League' },
                  { id: 'Europa League', name: 'Europa League' },
                  { id: 'Conference League', name: 'Conference League' },
                  { id: 'La Liga', name: 'La Liga' },
                  { id: 'Premier League', name: 'Premier League' },
                  { id: 'Serie A', name: 'Serie A' },
                  { id: 'Bundesliga', name: 'Bundesliga' },
                  { id: 'Ligue 1', name: 'Ligue 1' },
                ].map(patch => (
                  <button
                    key={patch.id}
                    data-testid={`patch-${patch.id}`}
                    onClick={() => setSelectedPatches(prev =>
                      prev.includes(patch.id) ? prev.filter(p => p !== patch.id) : [...prev, patch.id]
                    )}
                    className={`py-2 px-2 rounded-lg border-2 font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                      selectedPatches.includes(patch.id)
                        ? 'border-black bg-[#CCFF00]'
                        : 'border-neutral-200 active:border-black'
                    }`}
                  >
                    {selectedPatches.includes(patch.id) && <Check className="w-3 h-3 flex-shrink-0" />}
                    {patch.name}
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
                alt={selectedTeamName}
                className="w-full aspect-[4/5] object-contain"
              />
              <div className="bg-neutral-50 px-3 py-2 border-t text-sm font-bold text-center">
                {selectedTeamName}{isClub && selectedYear ? ` ${selectedYear}/${(parseInt(selectedYear) + 1).toString().slice(-2)}` : ''}
                {isClub && matchingProduct?.variants?.[selectedKit]?.name ? ` - ${matchingProduct.variants[selectedKit].name}` : ''}
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${selectedVersion === 'player' ? 'bg-black text-[#CCFF00]' : 'bg-neutral-200 text-neutral-600'}`}>
                  {selectedVersion === 'player' ? 'PLAYER' : 'FAN'}
                </span>
                {(customName || customNumber) && (
                  <p className="text-xs text-neutral-500 font-normal mt-0.5">
                    {customName}{customName && customNumber && ' #'}{customNumber}
                  </p>
                )}
                {selectedPatches.length > 0 && (
                  <p className="text-xs text-neutral-500 font-normal mt-0.5">
                    Patch-uri: {selectedPatches.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center py-12 text-neutral-400">
              <Shirt className="w-12 h-12 mb-2" />
              <p className="text-xs">{isClub && !selectedYear ? 'Selecteaza sezonul pentru preview' : 'Selecteaza produsul pentru preview'}</p>
            </div>
          )}

          {/* Size */}
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
        </div>

        {/* === FREE PRODUCT === */}
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2 text-green-700">
            <Gift className="w-6 h-6 text-green-500" />
            TRICOU GRATUIT
          </h2>

          <TeamPicker
            teams={uniqueNationals}
            selected={freeTeam}
            onSelect={setFreeTeam}
            label="NATIONALA"
            placeholder="Selecteaza nationala"
            color="green"
          />

          {freeImage ? (
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-green-200 bg-white">
              <img src={freeImage} alt={`${freeTeam} 25/26`} className="w-full aspect-[4/5] object-contain" />
              <div className="bg-green-50 px-3 py-2 border-t border-green-200 text-sm font-bold text-center text-green-700">
                {freeTeam} 2025/26 - First Kit
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border-2 border-dashed border-green-200 bg-white flex flex-col items-center justify-center py-12 text-green-300">
              <Gift className="w-12 h-12 mb-2" />
              <p className="text-xs">Selecteaza nationala pentru preview</p>
            </div>
          )}

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
