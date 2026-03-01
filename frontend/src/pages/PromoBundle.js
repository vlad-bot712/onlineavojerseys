import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Gift, Star, Check, Shirt, ChevronDown, X } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const YEARS = [2024, 2025, 2026];

function TeamPicker({ teams, selected, onSelect, label, placeholder, color = 'black' }) {
  const [open, setOpen] = useState(false);
  const isGreen = color === 'green';

  return (
    <div className="mb-4">
      <label className={`block text-xs font-bold mb-1 ${isGreen ? 'text-green-700' : 'text-neutral-500'}`}>{label}</label>
      {/* Trigger button */}
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
        <span className={selected ? '' : 'text-neutral-400'}>{selected || placeholder}</span>
        <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''} ${isGreen ? 'text-green-500' : 'text-neutral-400'}`} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className={`mt-1 border-2 rounded-lg overflow-hidden ${isGreen ? 'border-green-300' : 'border-neutral-200'}`}>
          <div className="max-h-64 overflow-y-auto">
            {typeof teams[0] === 'string' ? (
              // Flat list (nationals)
              teams.map(team => (
                <button
                  key={team}
                  data-testid={`team-opt-${team}`}
                  onClick={() => { onSelect(team); setOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold border-b last:border-0 flex items-center justify-between active:bg-neutral-100 ${
                    selected === team
                      ? isGreen ? 'bg-green-100 text-green-800' : 'bg-black text-white'
                      : 'bg-white'
                  }`}
                >
                  {team}
                  {selected === team && <Check className="w-4 h-4" />}
                </button>
              ))
            ) : (
              // Grouped list (clubs)
              teams.map(group => (
                <div key={group.league}>
                  <div className="px-4 py-2 bg-neutral-100 text-xs font-bold text-neutral-500 sticky top-0">
                    {group.league}
                  </div>
                  {group.teams.map(team => (
                    <button
                      key={team}
                      data-testid={`team-opt-${team}`}
                      onClick={() => { onSelect(team); setOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-bold border-b last:border-0 flex items-center justify-between active:bg-neutral-100 ${
                        selected === team ? 'bg-black text-white' : 'bg-white'
                      }`}
                    >
                      {team}
                      {selected === team && <Check className="w-4 h-4" />}
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
  const [products, setProducts] = useState([]);
  const [nationals, setNationals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeam, setSelectedTeam] = useState('');
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

  // Teams grouped by league (for picker)
  const clubTeamGroups = useMemo(() => {
    const map = {};
    products.forEach(p => {
      const league = p.league || 'Altele';
      if (!map[league]) map[league] = new Set();
      map[league].add(p.team);
    });
    return Object.keys(map).sort().map(league => ({
      league,
      teams: [...map[league]].sort()
    }));
  }, [products]);

  const uniqueNationals = useMemo(() => {
    return [...new Set(nationals.map(n => n.team))].sort();
  }, [nationals]);

  const availableYears = useMemo(() => {
    if (!selectedTeam) return [];
    return YEARS.filter(y => products.some(p => p.team === selectedTeam && p.year === y));
  }, [products, selectedTeam]);

  const matchingProduct = useMemo(() => {
    if (!selectedTeam || !selectedYear) return null;
    return products.find(p => p.team === selectedTeam && p.year === parseInt(selectedYear));
  }, [products, selectedTeam, selectedYear]);

  const mainImage = useMemo(() => {
    if (!matchingProduct) return null;
    const v = matchingProduct.variants?.[selectedKit];
    return v?.images?.[0] || matchingProduct.variants?.[0]?.images?.[0] || null;
  }, [matchingProduct, selectedKit]);

  const freeProduct = useMemo(() => {
    if (!freeTeam) return null;
    return nationals.find(n => n.team === freeTeam && n.year === 2025)
      || nationals.find(n => n.team === freeTeam);
  }, [nationals, freeTeam]);

  const freeImage = freeProduct?.variants?.[0]?.images?.[0] || null;

  useEffect(() => { setSelectedKit(0); }, [selectedTeam, selectedYear]);

  const onTeamChange = (val) => {
    setSelectedTeam(val);
    setSelectedYear('');
    setSelectedKit(0);
    setMainSize('');
  };

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
      selectedVersion: selectedVersion,
      customization: (customName || customNumber || selectedPatches.length > 0) ? {
        name: customName || null,
        number: customNumber || null,
        patches: selectedPatches.length > 0 ? selectedPatches : null,
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

          {/* Team Picker - custom, no native select */}
          <TeamPicker
            teams={clubTeamGroups}
            selected={selectedTeam}
            onSelect={onTeamChange}
            label="ECHIPA"
            placeholder="Selecteaza echipa"
          />

          {/* Season */}
          <label className="block text-xs font-bold text-neutral-500 mb-1">SEZON</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {YEARS.map(year => {
              const has = selectedTeam ? availableYears.includes(year) : false;
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

          {/* Kit */}
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
                <button key={idx} disabled className="py-2.5 rounded-lg border-2 border-neutral-100 text-neutral-300 font-bold text-sm">
                  {k}
                </button>
              ))}
            </div>
          )}

          {/* Customization: Name + Number */}
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

          {/* Version */}
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

          {/* Patches */}
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

          {/* Product Image Preview */}
          {mainImage ? (
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-neutral-100 bg-white">
              <img
                src={mainImage}
                alt={`${selectedTeam} ${selectedYear}`}
                className="w-full aspect-[4/5] object-contain"
              />
              <div className="bg-neutral-50 px-3 py-2 border-t text-sm font-bold text-center">
                {selectedTeam} {selectedYear}/{(parseInt(selectedYear) + 1).toString().slice(-2)} - {matchingProduct?.variants?.[selectedKit]?.name || 'First Kit'}
                {(customName || customNumber) && (
                  <p className="text-xs text-neutral-500 font-normal mt-0.5">
                    {customName && customName}{customName && customNumber && ' #'}{customNumber && customNumber}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 flex flex-col items-center justify-center py-12 text-neutral-400">
              <Shirt className="w-12 h-12 mb-2" />
              <p className="text-xs">Selecteaza echipa si sezonul pentru preview</p>
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

          {/* National Team Picker - custom */}
          <TeamPicker
            teams={uniqueNationals}
            selected={freeTeam}
            onSelect={setFreeTeam}
            label="NATIONALA"
            placeholder="Selecteaza nationala"
            color="green"
          />

          {/* Free Product Image */}
          {freeImage ? (
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-green-200 bg-white">
              <img
                src={freeImage}
                alt={`${freeTeam} 25/26`}
                className="w-full aspect-[4/5] object-contain"
              />
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
            <p className="text-neutral-500">1-3sapt</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-neutral-200">
            <p className="font-bold">Calitate</p>
            <p className="text-neutral-500">Premium</p>
          </div>
        </div>
      </div>
    </div>
  );
}
