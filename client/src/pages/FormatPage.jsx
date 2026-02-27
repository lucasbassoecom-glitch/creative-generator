import { useState } from 'react';
import { Check, LayoutTemplate, Monitor, Smartphone, Square, Sliders } from 'lucide-react';
import { FORMAT_CATEGORIES, getRatioLabel, getOrientationLabel } from '../utils/formats';
import { useFormat } from '../context/FormatContext';
import toast from 'react-hot-toast';

function OrientIcon({ width, height, size = 14 }) {
  const orient = getOrientationLabel(width, height);
  if (orient === 'Carré') return <Square size={size} className="text-zinc-500" />;
  if (orient === 'Paysage') return <Monitor size={size} className="text-zinc-500" />;
  return <Smartphone size={size} className="text-zinc-500" />;
}

function CanvasPreview({ width, height }) {
  const MAX = 56;
  const ratio = width / height;
  let w, h;
  if (ratio >= 1) { w = MAX; h = Math.max(8, Math.round(MAX / ratio)); }
  else { h = MAX; w = Math.max(8, Math.round(MAX * ratio)); }

  return (
    <div className="flex items-center justify-center shrink-0" style={{ width: MAX + 4, height: MAX + 4 }}>
      <div
        className="border border-indigo-500/50 bg-indigo-900/20 rounded-sm"
        style={{ width: w, height: h }}
      />
    </div>
  );
}

function FormatCard({ format, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(format)}
      className={`relative flex flex-col gap-3 p-4 rounded-xl border text-left transition-all group ${
        isActive
          ? 'border-indigo-500 bg-indigo-600/10'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800/50'
      }`}
    >
      {isActive && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
          <Check size={11} className="text-white" />
        </div>
      )}
      {format.recommended && !isActive && (
        <div className="absolute top-3 right-3 text-[9px] font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 px-1.5 py-0.5 rounded-full">
          Recommandé
        </div>
      )}

      <div className="flex items-center justify-between">
        <CanvasPreview width={format.width} height={format.height} />
        <div className="text-right">
          <div className={`text-xs font-bold ${isActive ? 'text-indigo-300' : 'text-zinc-400'}`}>
            {getRatioLabel(format.width, format.height)}
          </div>
          <div className="text-[10px] text-zinc-600 mt-0.5">
            {getOrientationLabel(format.width, format.height)}
          </div>
        </div>
      </div>

      <div>
        <div className={`text-sm font-semibold ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
          {format.label}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">{format.description}</div>
        <div className={`text-xs font-mono mt-2 ${isActive ? 'text-indigo-400' : 'text-zinc-600'}`}>
          {format.width} × {format.height} px
        </div>
      </div>
    </button>
  );
}

function CustomForm({ onApply }) {
  const [w, setW] = useState(1080);
  const [h, setH] = useState(1080);
  const [name, setName] = useState('');

  const handleApply = () => {
    const wi = parseInt(w, 10);
    const hi = parseInt(h, 10);
    if (!wi || !hi || wi < 50 || hi < 50 || wi > 8000 || hi > 8000) {
      toast.error('Dimensions invalides (min 50px, max 8000px)');
      return;
    }
    onApply(wi, hi, name || `${wi}×${hi}`);
  };

  const previewW = parseInt(w, 10) || 1080;
  const previewH = parseInt(h, 10) || 1080;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Sliders size={15} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Dimensions personnalisées</h3>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Largeur (px)</label>
            <input
              type="number" value={w} onChange={e => setW(e.target.value)}
              min={50} max={8000}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Hauteur (px)</label>
            <input
              type="number" value={h} onChange={e => setH(e.target.value)}
              min={50} max={8000}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Nom du format (optionnel)</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Mon format landing"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleApply}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Appliquer ce format
          </button>
        </div>

        {/* Live preview */}
        <div className="flex flex-col items-center justify-center bg-zinc-800/50 rounded-xl p-4 gap-3">
          {(() => {
            const MAX = 120;
            const ratio = previewW / previewH;
            let dw, dh;
            if (ratio >= 1) { dw = MAX; dh = Math.max(10, Math.round(MAX / ratio)); }
            else { dh = MAX; dw = Math.max(10, Math.round(MAX * ratio)); }
            return (
              <div
                className="border-2 border-indigo-500 bg-indigo-900/20 rounded flex items-center justify-center"
                style={{ width: dw, height: dh }}
              >
                <span className="text-[9px] text-indigo-400 font-mono">{previewW}×{previewH}</span>
              </div>
            );
          })()}
          <div className="text-center space-y-1">
            <div className="text-xs text-zinc-400 font-mono">{previewW} × {previewH} px</div>
            <div className="text-[11px] text-zinc-500">
              Ratio {getRatioLabel(previewW, previewH)} · {getOrientationLabel(previewW, previewH)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormatPage() {
  const { activeFormat, selectPreset, selectCustom } = useFormat();

  const handleSelect = (format) => {
    selectPreset(format);
    toast.success(`Format sélectionné : ${format.label} (${format.width}×${format.height})`);
  };

  const handleCustom = (w, h, label) => {
    selectCustom(w, h, label);
    toast.success(`Format personnalisé : ${label} (${w}×${h})`);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <LayoutTemplate size={17} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Formats</h1>
            <p className="text-sm text-zinc-500">Sélectionne le format de ta créative</p>
          </div>
        </div>
        {/* Active format summary */}
        <div className="mt-4 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <OrientIcon width={activeFormat.width} height={activeFormat.height} size={16} />
          <div className="flex-1">
            <span className="text-sm font-semibold text-zinc-200">{activeFormat.label}</span>
            <span className="text-zinc-600 mx-2">·</span>
            <span className="text-sm text-zinc-400 font-mono">{activeFormat.width}×{activeFormat.height}</span>
            <span className="text-zinc-600 mx-2">·</span>
            <span className="text-xs text-zinc-500">{getRatioLabel(activeFormat.width, activeFormat.height)} · {getOrientationLabel(activeFormat.width, activeFormat.height)}</span>
          </div>
          <div className="text-xs text-indigo-400 font-medium bg-indigo-900/30 border border-indigo-800/40 px-2.5 py-1 rounded-full">
            Actif
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-8">
        {FORMAT_CATEGORIES.map(cat => (
          <section key={cat.id}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{cat.icon}</span>
              <h2 className="text-sm font-semibold text-zinc-300">{cat.label}</h2>
              <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                {cat.formats.length}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {cat.formats.map(format => (
                <FormatCard
                  key={format.id}
                  format={format}
                  isActive={activeFormat.id === format.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Custom dimensions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">✏️</span>
            <h2 className="text-sm font-semibold text-zinc-300">Dimensions personnalisées</h2>
          </div>
          <CustomForm onApply={handleCustom} />
        </section>
      </div>
    </div>
  );
}
