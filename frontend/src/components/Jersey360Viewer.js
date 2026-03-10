import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCw, Type, Hash, ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react';

const VIEWS = [
  { id: 'front', label: 'Față', src: '/images/preview360/romania-front.jpg' },
  { id: 'angle', label: 'Lateral', src: '/images/preview360/romania-angle.jpg' },
  { id: 'back', label: 'Spate', src: '/images/preview360/romania-back.jpg' },
  { id: 'flat', label: 'Detaliu', src: '/images/preview360/romania-front-flat.jpg' },
  { id: 'hanging', label: 'Display', src: '/images/preview360/romania-hanging.jpg' },
];

const STEP_PX = 80;

export default function Jersey360Viewer({ onClose }) {
  const [viewIndex, setViewIndex] = useState(0);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const dragRef = useRef({ startX: 0, cumulative: 0 });
  const containerRef = useRef(null);

  const isBack = VIEWS[viewIndex].id === 'back';

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const goTo = useCallback((dir) => {
    setViewIndex(prev => {
      const next = prev + dir;
      if (next < 0) return VIEWS.length - 1;
      if (next >= VIEWS.length) return 0;
      return next;
    });
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    setShowHint(false);
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    dragRef.current.startX = x;
    dragRef.current.cumulative = 0;
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = x - dragRef.current.startX;
    const steps = Math.floor(Math.abs(delta) / STEP_PX);
    if (steps > Math.abs(dragRef.current.cumulative)) {
      const dir = delta > 0 ? -1 : 1;
      const diff = steps - Math.abs(dragRef.current.cumulative);
      for (let i = 0; i < diff; i++) goTo(dir);
      dragRef.current.cumulative += dir * diff;
    }
  }, [isDragging, goTo]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchmove', handlePointerMove, { passive: false });
      window.addEventListener('touchend', handlePointerUp);
      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-black flex flex-col'
    : 'relative';

  return (
    <div className={wrapperClass} data-testid="jersey-360-viewer">
      {/* Header bar */}
      <div className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-[#CCFF00]" />
          <span className="text-sm font-bold tracking-wider uppercase">
            360° Preview — România
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            data-testid="360-fullscreen-toggle"
            onClick={() => setIsFullscreen(f => !f)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              data-testid="360-close"
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main viewer */}
      <div className={`flex-1 flex ${isFullscreen ? 'flex-row' : 'flex-col md:flex-row'} bg-neutral-950 overflow-hidden`}>
        {/* Image area */}
        <div
          ref={containerRef}
          className={`relative select-none flex-1 flex items-center justify-center overflow-hidden ${isFullscreen ? 'min-h-0' : 'min-h-[400px] md:min-h-[500px]'}`}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        >
          {/* Preload all images */}
          {VIEWS.map((v, i) => (
            <img
              key={v.id}
              src={v.src}
              alt={v.label}
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500 pointer-events-none"
              style={{
                opacity: i === viewIndex ? 1 : 0,
                zIndex: i === viewIndex ? 2 : 1,
              }}
            />
          ))}

          {/* Name/Number overlay on back view */}
          {isBack && (customName || customNumber) && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 3 }}
            >
              <div className="relative flex flex-col items-center" style={{ marginTop: '-2%' }}>
                {customName && (
                  <span
                    data-testid="360-custom-name-overlay"
                    className="text-neutral-900 text-center leading-none tracking-widest"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
                      letterSpacing: '0.15em',
                      textShadow: '0 1px 2px rgba(255,255,255,0.3)',
                    }}
                  >
                    {customName.toUpperCase()}
                  </span>
                )}
                {customNumber && (
                  <span
                    data-testid="360-custom-number-overlay"
                    className="text-neutral-900 text-center leading-none"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 'clamp(3rem, 10vw, 8rem)',
                      lineHeight: 0.9,
                      textShadow: '0 2px 4px rgba(255,255,255,0.3)',
                    }}
                  >
                    {customNumber}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Drag hint */}
          {showHint && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full animate-pulse">
              <ChevronLeft className="w-4 h-4 text-white/70" />
              <span className="text-xs text-white/70 font-medium">Trage pentru a roti</span>
              <ChevronRight className="w-4 h-4 text-white/70" />
            </div>
          )}

          {/* View label */}
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#CCFF00] text-black text-xs font-bold px-3 py-1 rounded-full">
              {VIEWS[viewIndex].label}
            </span>
          </div>

          {/* Arrow buttons */}
          <button
            data-testid="360-prev"
            onClick={() => goTo(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-[#CCFF00] text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            data-testid="360-next"
            onClick={() => goTo(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/10 hover:bg-[#CCFF00] text-white hover:text-black rounded-full flex items-center justify-center backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Customization panel */}
        <div className={`bg-neutral-900 text-white ${isFullscreen ? 'w-80' : 'w-full md:w-80'} flex-shrink-0 flex flex-col`}>
          {/* View dots */}
          <div className="flex items-center justify-center gap-2 py-4 border-b border-white/10">
            {VIEWS.map((v, i) => (
              <button
                key={v.id}
                data-testid={`360-dot-${v.id}`}
                onClick={() => setViewIndex(i)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  i === viewIndex ? 'bg-[#CCFF00] text-black' : 'text-white/50 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Customization inputs */}
          <div className="p-5 flex-1 flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold mb-1">Personalizare Tricou</h3>
              <p className="text-xs text-white/50">
                {isBack
                  ? 'Introdu numele și numărul pentru a vedea preview-ul pe spatele tricoului.'
                  : 'Rotește la vedere "Spate" pentru a vedea personalizarea.'}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase mb-2">
                <Type className="w-3.5 h-3.5" />
                Nume jucător
              </label>
              <input
                data-testid="360-custom-name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value.slice(0, 15))}
                placeholder="ex: RAȚIU"
                maxLength={15}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase mb-2">
                <Hash className="w-3.5 h-3.5" />
                Număr
              </label>
              <input
                data-testid="360-custom-number"
                type="text"
                value={customNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setCustomNumber(val);
                }}
                placeholder="ex: 7"
                maxLength={2}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
            </div>

            {/* Live preview of text */}
            {(customName || customNumber) && (
              <div data-testid="360-text-preview" className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Preview text</p>
                {customName && (
                  <p
                    className="text-white leading-none tracking-widest"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem' }}
                  >
                    {customName.toUpperCase()}
                  </p>
                )}
                {customNumber && (
                  <p
                    className="text-[#CCFF00] leading-none"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', lineHeight: 1 }}
                  >
                    {customNumber}
                  </p>
                )}
              </div>
            )}

            {/* Quick tip */}
            <div className="mt-auto">
              <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-lg p-3">
                <p className="text-[10px] text-[#CCFF00] font-bold uppercase mb-1">Sfat</p>
                <p className="text-xs text-white/60">
                  Folosește săgețile sau trage imaginea pentru a roti tricoul. Mergi la "Spate" pentru a vedea personalizarea live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rotation progress bar */}
      <div className="bg-neutral-900 px-4 py-2 flex items-center gap-3">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#CCFF00] rounded-full transition-all duration-300"
            style={{ width: `${((viewIndex + 1) / VIEWS.length) * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-white/40 font-mono">{viewIndex + 1}/{VIEWS.length}</span>
      </div>
    </div>
  );
}
