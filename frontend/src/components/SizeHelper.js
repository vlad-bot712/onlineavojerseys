import React, { useState } from 'react';
import { X, Ruler, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const GARMENT_TYPES = [
  { id: 'pantaloni-scurti', label: 'Pantaloni Scurți' },
  { id: 'pantaloni-lungi', label: 'Pantaloni Lungi' },
  { id: 'tricou', label: 'Tricou' },
  { id: 'vesta', label: 'Vestă / Geacă' },
];

const SIZE_TABLES = {
  'pantaloni-scurti': [
    { size: 'M', minKg: 45, maxKg: 60, minCm: 160, maxCm: 170 },
    { size: 'L', minKg: 60, maxKg: 65, minCm: 170, maxCm: 175 },
    { size: 'XL', minKg: 65, maxKg: 70, minCm: 175, maxCm: 180 },
    { size: '2XL', minKg: 70, maxKg: 80, minCm: 180, maxCm: 185 },
    { size: '3XL', minKg: 80, maxKg: 90, minCm: 185, maxCm: 190 },
  ],
  'pantaloni-lungi': [
    { size: 'S', minKg: 45, maxKg: 60, minCm: 160, maxCm: 165 },
    { size: 'M', minKg: 60, maxKg: 65, minCm: 165, maxCm: 170 },
    { size: 'L', minKg: 65, maxKg: 70, minCm: 170, maxCm: 175 },
    { size: 'XL', minKg: 70, maxKg: 80, minCm: 175, maxCm: 180 },
    { size: '2XL', minKg: 80, maxKg: 90, minCm: 180, maxCm: 185 },
  ],
  'tricou': [
    { size: 'S', minKg: 45, maxKg: 60 },
    { size: 'M', minKg: 60, maxKg: 70 },
    { size: 'L', minKg: 70, maxKg: 80 },
    { size: 'XL', minKg: 80, maxKg: 90 },
    { size: '2XL', minKg: 90, maxKg: 100 },
  ],
  'vesta': [
    { size: 'S', minKg: 45, maxKg: 60 },
    { size: 'M', minKg: 60, maxKg: 70 },
    { size: 'L', minKg: 70, maxKg: 80 },
    { size: 'XL', minKg: 80, maxKg: 90 },
    { size: '2XL', minKg: 90, maxKg: 100 },
  ],
};

function getRecommendation(garmentType, weight, height) {
  const table = SIZE_TABLES[garmentType];
  if (!table) return null;

  const needsHeight = garmentType === 'pantaloni-scurti' || garmentType === 'pantaloni-lungi';

  for (const row of table) {
    const kgMatch = weight >= row.minKg && weight <= row.maxKg;
    if (needsHeight) {
      const cmMatch = height >= row.minCm && height <= row.maxCm;
      if (kgMatch && cmMatch) return row.size;
    } else {
      if (kgMatch) return row.size;
    }
  }

  // Fallback: find closest by weight
  let closest = null;
  let minDist = Infinity;
  for (const row of table) {
    const mid = (row.minKg + row.maxKg) / 2;
    const dist = Math.abs(weight - mid);
    if (dist < minDist) {
      minDist = dist;
      closest = row.size;
    }
  }
  return closest;
}

export default function SizeHelper({ isOpen, onClose, preselectedType }) {
  const [step, setStep] = useState(1);
  const [garmentType, setGarmentType] = useState(preselectedType || '');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  const needsHeight = garmentType === 'pantaloni-scurti' || garmentType === 'pantaloni-lungi';

  const handleCalculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const recommended = getRecommendation(garmentType, w, h);
    setResult(recommended);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setGarmentType(preselectedType || '');
    setHeight('');
    setWeight('');
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div data-testid="size-helper-modal" className="relative bg-white w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-[#CCFF00]" />
            <span className="text-sm font-bold uppercase tracking-wider">Ajutor Mărimi</span>
          </div>
          <button onClick={onClose} data-testid="size-helper-close" className="hover:text-[#CCFF00] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex">
          {[1, 2, 3].map(s => (
            <div key={s} className={`flex-1 h-1 transition-colors ${s <= step ? 'bg-[#CCFF00]' : 'bg-neutral-200'}`} />
          ))}
        </div>

        <div className="p-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-widest mb-1">Pasul 1</p>
              <h3 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Selectează tipul de haină
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {GARMENT_TYPES.map(g => (
                  <button
                    key={g.id}
                    data-testid={`garment-${g.id}`}
                    onClick={() => { setGarmentType(g.id); setStep(2); }}
                    className={`flex items-center justify-between px-4 py-3.5 border-2 font-semibold text-sm transition-all ${
                      garmentType === g.id
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10'
                        : 'border-neutral-200 hover:border-black'
                    }`}
                  >
                    {g.label}
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <p className="text-xs font-bold text-[#CCFF00] uppercase tracking-widest mb-1">Pasul 2</p>
              <h3 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Introduce datele tale
              </h3>

              <div className="space-y-4">
                {needsHeight && (
                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                      Înălțime (cm)
                    </label>
                    <input
                      data-testid="size-height-input"
                      type="number"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      placeholder="ex: 175"
                      className="w-full border-2 border-neutral-200 px-4 py-3 text-base font-medium focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5 block">
                    Greutate (kg)
                  </label>
                  <input
                    data-testid="size-weight-input"
                    type="number"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="ex: 75"
                    className="w-full border-2 border-neutral-200 px-4 py-3 text-base font-medium focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 px-4 py-3 border-2 border-neutral-200 font-bold text-sm hover:border-black transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Înapoi
                </button>
                <button
                  data-testid="size-calculate-btn"
                  onClick={handleCalculate}
                  disabled={!weight || (needsHeight && !height)}
                  className="flex-1 bg-black text-white py-3 font-bold text-sm uppercase tracking-wider hover:bg-[#CCFF00] hover:text-black transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Calculează Mărimea
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - Result */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#CCFF00] flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-black" />
              </div>
              <p className="text-sm text-neutral-500 mb-2">Mărimea recomandată pentru tine este:</p>
              <div
                data-testid="size-result"
                className="text-5xl font-black text-black mb-6"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {result || '—'}
              </div>
              <p className="text-xs text-neutral-400 mb-6">
                Aceasta este o recomandare orientativă bazată pe datele introduse.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 border-2 border-neutral-200 py-3 font-bold text-sm hover:border-black transition-colors"
                >
                  Recalculează
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-black text-white py-3 font-bold text-sm hover:bg-[#CCFF00] hover:text-black transition-all"
                >
                  Închide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
