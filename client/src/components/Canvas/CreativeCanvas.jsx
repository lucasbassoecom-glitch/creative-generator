import { useRef, useEffect, useState, useCallback } from 'react';
import { Maximize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

const PREVIEW_MAX_W = 580;
const PREVIEW_MAX_H = 680;

/**
 * Renders an HTML creative string inside a scaled iframe.
 * The iframe is displayed at full resolution then scaled with CSS transform.
 */
export default function CreativeCanvas({ html, format, className = '' }) {
  const iframeRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  if (!format) return null;

  const { width, height } = format;

  // Scale to fit the preview area
  const baseScale = Math.min(PREVIEW_MAX_W / width, PREVIEW_MAX_H / height);
  const effectiveScale = baseScale * zoom;

  // Container size = scaled iframe dimensions
  const displayW = Math.round(width * effectiveScale);
  const displayH = Math.round(height * effectiveScale);

  // Write HTML into iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2.5));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.2));
  const handleZoomReset = () => setZoom(1);

  if (!html) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl ${className}`}
        style={{ width: displayW, height: displayH, minHeight: 300 }}>
        <div className="text-center text-zinc-600">
          <div className="text-4xl mb-3">🎨</div>
          <p className="text-sm font-medium text-zinc-500">Aperçu créative</p>
          <p className="text-xs mt-1">Sélectionne un produit + template</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Canvas wrapper */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5"
        style={{ width: displayW, height: displayH }}
      >
        <iframe
          ref={iframeRef}
          title="creative-preview"
          sandbox="allow-same-origin allow-scripts"
          scrolling="no"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            border: 'none',
            display: 'block',
            transform: `scale(${effectiveScale})`,
            transformOrigin: 'top left',
          }}
        />
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3 py-1.5">
        <span className="text-[10px] text-zinc-500 font-mono mr-1">
          {width}×{height}px
        </span>
        <div className="w-px h-3.5 bg-zinc-700" />
        <button
          onClick={handleZoomOut}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Zoom arrière"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[10px] text-zinc-400 font-mono w-10 text-center">
          {Math.round(effectiveScale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Zoom avant"
        >
          <ZoomIn size={13} />
        </button>
        <button
          onClick={handleZoomReset}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Réinitialiser le zoom"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </div>
  );
}
