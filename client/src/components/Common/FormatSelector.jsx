import { useState, useRef, useEffect } from 'react';
import { X, Check, Sliders, Monitor, Smartphone, Square } from 'lucide-react';
import { FORMAT_CATEGORIES, getRatioLabel, getOrientationLabel } from '../../utils/formats';
import { useFormat } from '../../context/FormatContext';

// Visual canvas preview — shows the format ratio as a scaled rectangle
function CanvasPreview({ width, height, label }) {
  const MAX = 80;
  const ratio = width / height;
  let w, h;
  if (ratio >= 1) { w = MAX; h = Math.round(MAX / ratio); }
  else { h = MAX; w = Math.round(MAX * ratio); }
  const isThin = w < 20 || h < 12;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center justify-center" style={{ width: MAX + 4, height: MAX + 4 }}>
        <div
          className="border-2 border-indigo-400 bg-indigo-900/30 rounded-sm flex items-center justify-center"
          style={{ width: w, height: h }}
        >
          {!isThin && (
            <span className="text-[7px] font-bold text-indigo-300 leading-none text-center px-0.5">
              {w}×{h}
            </span>
          )}
        </div>
      </div>
      <span className="text-[9px] text-zinc-500">{label}</span>
    </div>
  );
}

// Single format card
function FormatCard({ format, isActive, onSelect }) {
  const orient = getOrientationLabel(format.width, format.height);
  const OrientIcon = orient === 'Carré' ? Square : orient === 'Paysage' ? Monitor : Smartphone;

  return (
    <button
      onClick={() => onSelect(format)}
      className={`relative w-full text-left px-3 py-2.5 rounded-lg border transition-all group ${
        isActive
          ? 'border-indigo-500 bg-indigo-600/15 text-zinc-100'
          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 hover:bg-zinc-800/50'
      }`}
    >
      {isActive && (
        <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-indigo-600">
          <Check size={10} className="text-white" />
        </span>
      )}
      {format.recommended && !isActive && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold text-emerald-400 bg-emerald-900/40 border border-emerald-800/60 px-1.5 py-0.5 rounded-full">
          ★
        </span>
      )}
      <div className="flex items-start gap-2">
        <OrientIcon size={13} className={`mt-0.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-600'}`} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold truncate leading-tight">{format.label}</div>
          <div className={`text-[10px] mt-0.5 ${isActive ? 'text-indigo-300' : 'text-zinc-600'}`}>
            {format.width}×{format.height}
          </div>
          <div className="text-[10px] text-zinc-600 truncate mt-0.5">{format.description}</div>
        </div>
      </div>
    </button>
  );
}

// Custom dimensions form
function CustomDimensionsForm({ onApply, current }) {
  const [w, setW] = useState(current?.width ?? 1080);
  const [h, setH] = useState(current?.height ?? 1080);
  const [name, setName] = useState('');

  const handleApply = () => {
    const wi = parseInt(w, 10);
    const hi = parseInt(h, 10);
    if (!wi || !hi || wi < 50 || hi < 50 || wi > 8000 || hi > 8000) return;
    onApply(wi, hi, name || `${wi}×${hi}`);
  };

  return (
    <div className="p-4 border border-dashed border-zinc-700 rounded-xl bg-zinc-900/40 space-y-3">
      <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
        <Sliders size={12} />
        Dimensions personnalisées
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-zinc-500 mb-1 block">Largeur (px)</label>
          <input
            type="number"
            value={w}
            onChange={e => setW(e.target.value)}
            min={50} max={8000}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-[10px] text-zinc-500 mb-1 block">Hauteur (px)</label>
          <input
            type="number"
            value={h}
            onChange={e => setH(e.target.value)}
            min={50} max={8000}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-zinc-500 mb-1 block">Nom (optionnel)</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Mon format custom"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
        />
      </div>
      {/* Preview */}
      {parseInt(w) > 0 && parseInt(h) > 0 && (
        <div className="flex items-center gap-3 pt-1">
          <CanvasPreview width={parseInt(w)} height={parseInt(h)} label={getRatioLabel(parseInt(w), parseInt(h))} />
          <div className="text-[10px] text-zinc-500 space-y-0.5">
            <div>{parseInt(w)}×{parseInt(h)} px</div>
            <div>Ratio {getRatioLabel(parseInt(w), parseInt(h))}</div>
            <div>{getOrientationLabel(parseInt(w), parseInt(h))}</div>
          </div>
        </div>
      )}
      <button
        onClick={handleApply}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
      >
        Appliquer ce format
      </button>
    </div>
  );
}

// ─── Main FormatSelector modal ───────────────────────────────────────────────
export default function FormatSelector({ onClose }) {
  const { activeFormat, selectPreset, selectCustom, customFormat } = useFormat();
  const [activeCategory, setActiveCategory] = useState(FORMAT_CATEGORIES[0].id);
  const [showCustom, setShowCustom] = useState(false);
  const modalRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const currentCategory = FORMAT_CATEGORIES.find(c => c.id === activeCategory);

  const handleSelectPreset = (format) => {
    selectPreset(format);
    setShowCustom(false);
    onClose();
  };

  const handleApplyCustom = (w, h, label) => {
    selectCustom(w, h, label);
    onClose();
  };

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        className="w-full max-w-3xl bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">Sélecteur de format</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Format actif : <span className="text-indigo-400 font-medium">{activeFormat.label}</span>
              {' — '}{activeFormat.width}×{activeFormat.height} px
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-700 transition-colors">
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: category tabs */}
          <div className="w-44 shrink-0 border-r border-zinc-800 p-3 space-y-1 overflow-y-auto">
            {FORMAT_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setShowCustom(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.id && !showCustom
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
            <div className="border-t border-zinc-800 pt-1 mt-1">
              <button
                onClick={() => setShowCustom(true)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  showCustom
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Sliders size={12} />
                Personnalisé
              </button>
            </div>
          </div>

          {/* Right: format grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showCustom ? (
              <CustomDimensionsForm
                onApply={handleApplyCustom}
                current={customFormat || activeFormat}
              />
            ) : (
              <>
                {/* Category header with preview of selected */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-zinc-300">
                      {currentCategory?.icon} {currentCategory?.label}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {currentCategory?.formats.length} formats disponibles
                    </div>
                  </div>
                  {/* Preview of active format */}
                  <div className="shrink-0">
                    <CanvasPreview
                      width={activeFormat.width}
                      height={activeFormat.height}
                      label={`${activeFormat.width}×${activeFormat.height}`}
                    />
                  </div>
                </div>

                {/* Format grid */}
                <div className="grid grid-cols-2 gap-2">
                  {currentCategory?.formats.map(format => (
                    <FormatCard
                      key={format.id}
                      format={format}
                      isActive={activeFormat.id === format.id}
                      onSelect={handleSelectPreset}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer — active format info */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-900/50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              <span className="text-zinc-400 font-medium">{activeFormat.label}</span>
              <span>·</span>
              <span>{activeFormat.width}×{activeFormat.height} px</span>
              <span>·</span>
              <span>Ratio {getRatioLabel(activeFormat.width, activeFormat.height)}</span>
              <span>·</span>
              <span>{getOrientationLabel(activeFormat.width, activeFormat.height)}</span>
            </div>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Confirmer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
