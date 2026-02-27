import { useState } from 'react';
import { LayoutTemplate, ChevronDown } from 'lucide-react';
import { useFormat } from '../../context/FormatContext';
import { getOrientationLabel } from '../../utils/formats';
import FormatSelector from './FormatSelector';

// Mini canvas ratio icon
function RatioIcon({ width, height }) {
  const MAX = 14;
  const ratio = width / height;
  let w, h;
  if (ratio >= 1) { w = MAX; h = Math.max(5, Math.round(MAX / ratio)); }
  else { h = MAX; w = Math.max(5, Math.round(MAX * ratio)); }

  return (
    <div className="flex items-center justify-center" style={{ width: MAX + 2, height: MAX + 2 }}>
      <div
        className="border border-indigo-400 bg-indigo-900/40 rounded-[1px]"
        style={{ width: w, height: h }}
      />
    </div>
  );
}

export default function FormatBadge() {
  const { activeFormat } = useFormat();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 hover:border-indigo-500/40 hover:bg-zinc-800 transition-all group"
        title="Changer le format"
      >
        <RatioIcon width={activeFormat.width} height={activeFormat.height} />
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[10px] font-semibold text-zinc-300 truncate leading-none">{activeFormat.label}</div>
          <div className="text-[9px] text-zinc-600 mt-0.5">
            {activeFormat.width}×{activeFormat.height}
          </div>
        </div>
        <ChevronDown size={11} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
      </button>

      {open && <FormatSelector onClose={() => setOpen(false)} />}
    </>
  );
}
