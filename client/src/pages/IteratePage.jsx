import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  RefreshCw, Loader2, ChevronLeft, ChevronRight, AlertCircle,
  BookImage, X, Check, Download, Star, BarChart2, Info,
  ArrowLeft, Upload, Eye, Zap, Users, Package,
} from 'lucide-react';
import { getFormatById } from '../utils/formats';
import { usePersona } from '../context/PersonaContext';
import { useProduct } from '../context/ProductContext';
import FeedbackModal from '../components/Common/FeedbackModal';

// ─── Constants ─────────────────────────────────────────────────────────────────
const VARIABLES = [
  {
    id: 'headline',
    icon: '🔤',
    label: 'Headlines',
    desc: 'Tester différents titres (pain point, formulation, niveau conscience)',
    highlight: 'Le headline change',
    strategies: [
      { id: 'pain_points_differents', label: 'Pain points différents' },
      { id: 'formulations', label: 'Même pain point, formulations différentes' },
      { id: 'niveaux_conscience', label: 'Niveaux de conscience différents' },
      { id: 'mix_auto', label: 'Mix auto (Claude choisit)' },
    ],
  },
  {
    id: 'colors',
    icon: '🎨',
    label: 'Couleurs',
    desc: 'Tester différentes palettes (fond sombre, clair, vive, monochrome…)',
    highlight: 'La palette change',
    strategies: null,
  },
  {
    id: 'angle',
    icon: '🎯',
    label: 'Angles / Bénéfices',
    desc: 'Tester différents bénéfices ou pain points ciblés',
    highlight: "L'angle marketing change",
    strategies: null,
  },
  {
    id: 'structure',
    icon: '📐',
    label: 'Structure / Layout',
    desc: 'Tester différents placements des éléments (miroir, split, hero…)',
    highlight: 'La structure change',
    strategies: null,
  },
  {
    id: 'cta',
    icon: '🔁',
    label: 'CTA & Éléments',
    desc: 'Tester le texte du CTA, badges promo, preuve sociale, garantie',
    highlight: 'Le CTA et les éléments secondaires changent',
    strategies: null,
  },
];

const DEFAULT_COUNT = 5;

function CreativeSelectModal({ onSelect, onClose }) {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/creatives').then(({ data }) => {
      setCreatives(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = search
    ? creatives.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.content?.headline || '').toLowerCase().includes(search.toLowerCase())
      )
    : creatives;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-100">Sélectionner la créative de base</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500"><X size={16} /></button>
        </div>
        <div className="px-5 py-3 border-b border-zinc-800">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {loading && <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-zinc-600" /></div>}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-8">
              <BookImage size={24} className="text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">Aucune créative trouvée</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => { onSelect(c); onClose(); }}
                className="text-left p-3 bg-zinc-900 border border-zinc-800 hover:border-indigo-500 rounded-xl transition-all group"
              >
                <div className="flex items-start gap-2">
                  {c.imagePath ? (
                    <img src={`http://localhost:3001${c.imagePath}`} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                      <BookImage size={16} className="text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                      {c.content?.headline || c.name || 'Sans nom'}
                    </div>
                    {c.content?.angle && <div className="text-[9px] text-zinc-600 mt-0.5">🎯 {c.content.angle}</div>}
                    {c.performance?.status && (
                      <div className="text-[9px] mt-0.5">
                        {c.performance.status === 'winner' && <span className="text-yellow-400">🏆 Winner</span>}
                        {c.performance.status === 'testing' && <span className="text-amber-400">⏳ En test</span>}
                        {c.performance.ctr && <span className="text-zinc-500 ml-1">CTR {c.performance.ctr}%</span>}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantCard({ variant, isControl, variable, onFavorite, onFeedback, index }) {
  const format = getFormatById(variant.formatId);
  const thumbScale = format ? (160 / Math.max(format.width, format.height)) : 0.1;
  const [isFav, setIsFav] = useState(variant.is_favorite || false);

  const highlightClass = 'ring-2 ring-indigo-400/60';

  const handleExport = () => {
    if (!variant.html) return toast.error('Pas de HTML disponible');
    const blob = new Blob([variant.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iterate_${variable}_v${index + 1}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exporté');
  };

  return (
    <div className={`bg-zinc-900 border rounded-2xl overflow-hidden shrink-0 w-72 flex flex-col ${isControl ? 'border-yellow-500/40' : 'border-zinc-800'}`}>
      {/* Badge */}
      <div className={`px-3 py-2 flex items-center gap-2 border-b ${isControl ? 'bg-yellow-900/20 border-yellow-500/20' : 'bg-zinc-800/30 border-zinc-800'}`}>
        {isControl ? (
          <span className="text-[9px] font-black text-yellow-400 uppercase tracking-wider">Contrôle</span>
        ) : (
          <span className="text-[9px] font-bold text-indigo-300">Variante {index}</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setIsFav(v => !v)} className={`p-1 rounded transition-colors ${isFav ? 'text-yellow-400' : 'text-zinc-600 hover:text-zinc-400'}`}>
            <Star size={11} className={isFav ? 'fill-yellow-400' : ''} />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="h-48 bg-zinc-800/50 flex items-center justify-center relative overflow-hidden">
        {variant.html ? (
          <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
            <iframe srcDoc={variant.html} scrolling="no" sandbox="allow-same-origin"
              style={{
                width: format ? `${format.width}px` : '1080px',
                height: format ? `${format.height}px` : '1350px',
                border: 'none',
                transform: `scale(${thumbScale})`,
                transformOrigin: 'top center',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : variant.imageBase64 ? (
          <img src={variant.imageBase64} alt="" className="w-full h-full object-cover" />
        ) : variant.imagePath ? (
          <img src={`http://localhost:3001${variant.imagePath}`} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-2">{variant.changes?.variable === 'colors' ? '🎨' : variant.changes?.variable === 'structure' ? '📐' : '📝'}</div>
            <div className="text-[10px] text-zinc-500 px-4">Aperçu non disponible</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Variable highlighted */}
        <div className={`mb-3 p-2.5 rounded-lg ${!isControl ? 'bg-indigo-900/20 border border-indigo-500/20' : 'bg-zinc-800/40'}`}>
          {variable === 'headline' && (
            <>
              <div className={`text-xs font-bold leading-tight mb-1 ${!isControl ? 'text-indigo-200' : 'text-zinc-200'}`}>
                {variant.content?.headline || '—'}
              </div>
              {variant.content?.subheadline && (
                <div className="text-[10px] text-zinc-500 leading-snug">{variant.content.subheadline}</div>
              )}
            </>
          )}
          {variable === 'colors' && (
            <div className="flex items-center gap-2 flex-wrap">
              {variant.content?.colors && Object.entries(variant.content.colors).filter(([, v]) => v && v.startsWith('#')).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded border border-zinc-600" style={{ background: v }} title={k} />
                  <span className="text-[9px] text-zinc-500">{v}</span>
                </div>
              ))}
              {variant.label && <div className="text-[10px] font-semibold text-indigo-300 w-full mt-1">{variant.label}</div>}
            </div>
          )}
          {variable === 'angle' && (
            <>
              <div className={`text-[9px] font-semibold uppercase tracking-wide mb-1 ${!isControl ? 'text-indigo-400' : 'text-zinc-500'}`}>
                {variant.changes?.value || variant.label}
              </div>
              {variant.content?.pain_point_source && (
                <div className="text-[10px] text-zinc-500 italic">"{variant.content.pain_point_source}"</div>
              )}
              {variant.content?.headline && (
                <div className="text-xs font-semibold text-zinc-200 mt-1">{variant.content.headline}</div>
              )}
            </>
          )}
          {variable === 'structure' && (
            <>
              <div className={`text-xs font-bold mb-1 ${!isControl ? 'text-indigo-200' : 'text-zinc-200'}`}>{variant.label}</div>
              {variant.content?.description && (
                <div className="text-[10px] text-zinc-500 leading-snug">{variant.content.description}</div>
              )}
            </>
          )}
          {variable === 'cta' && (
            <>
              <div className={`text-xs font-bold mb-1 ${!isControl ? 'text-indigo-200' : 'text-zinc-200'}`}>
                {variant.content?.cta || '—'}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {variant.content?.badge && <span className="text-[9px] bg-orange-900/30 text-orange-400 px-1.5 py-0.5 rounded">{variant.content.badge}</span>}
                {variant.content?.social_proof && <span className="text-[9px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded">{variant.content.social_proof}</span>}
                {variant.content?.guarantee && <span className="text-[9px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded">{variant.content.guarantee}</span>}
              </div>
            </>
          )}
        </div>

        {variant.rationale && (
          <div className="text-[9px] text-zinc-600 leading-relaxed mb-3 flex-1">
            <Info size={8} className="inline mr-1" />{variant.rationale}
          </div>
        )}

        {variant.note && (
          <div className="text-[9px] text-amber-600 mb-3 flex items-start gap-1">
            <AlertCircle size={9} className="shrink-0 mt-0.5" /> {variant.note}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1.5">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold rounded-lg transition-colors">
            <Download size={10} /> Export
          </button>
          <button onClick={() => onFeedback(variant)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold rounded-lg transition-colors">
            <BarChart2 size={10} /> Résultats
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IteratePage({ onNavigate }) {
  const { activePersonas } = usePersona();
  const { activeProduct } = useProduct();

  const [step, setStep] = useState(1); // 1: select, 2: configure, 3: results
  const [baseCreative, setBaseCreative] = useState(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [uploadAnalyzing, setUploadAnalyzing] = useState(false);
  const uploadInputRef = useRef(null);

  // Personas & products from library
  const [allPersonas, setAllPersonas] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPersonaList, setShowPersonaList] = useState(false);
  const [showProductList, setShowProductList] = useState(false);

  const [selectedVariable, setSelectedVariable] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState('mix_auto');
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [feedbackCreative, setFeedbackCreative] = useState(null);
  const scrollRef = useRef(null);

  // Fetch personas & products, auto-select if only one exists
  useEffect(() => {
    Promise.all([axios.get('/api/personas'), axios.get('/api/products')])
      .then(([{ data: ps }, { data: prods }]) => {
        setAllPersonas(ps);
        setAllProducts(prods);
        if (ps.length === 1) setSelectedPersona(ps[0]);
        if (prods.length === 1) setSelectedProduct(prods[0]);
      })
      .catch(() => {});
  }, []);

  // When base creative changes, pre-select its persona/product
  useEffect(() => {
    if (!baseCreative) return;
    if (baseCreative.personaId && allPersonas.length > 0) {
      const match = allPersonas.find(p => p.id === baseCreative.personaId);
      if (match) setSelectedPersona(match);
    }
    if (baseCreative.productId && allProducts.length > 0) {
      const match = allProducts.find(p => p.id === baseCreative.productId);
      if (match) setSelectedProduct(match);
    }
  }, [baseCreative, allPersonas, allProducts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (step === 2 && !loading) {
        const varKeys = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4 };
        if (varKeys[e.key] !== undefined) setSelectedVariable(VARIABLES[varKeys[e.key]].id);
        if (e.key === 'Enter' && selectedVariable) handleGenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [step, selectedVariable, loading]);

  const handleGenerate = async () => {
    if (!baseCreative) return toast.error('Sélectionne une créative de base');
    if (!selectedPersona) return toast.error('Sélectionne un persona');
    if (!selectedProduct) return toast.error('Sélectionne un produit');
    if (!selectedVariable) return toast.error('Sélectionne une variable à tester');

    setLoading(true);
    try {
      const payload = {
        baseContent: baseCreative.content || {
          headline: baseCreative.name,
          subheadline: '',
          angle: '',
          cta: 'Découvrir maintenant',
          colors: {},
          structure: 'hero-centré',
        },
        product: selectedProduct,
        persona: selectedPersona,
        variable: selectedVariable,
        strategy: selectedStrategy,
        count,
        baseHtml: baseCreative.html || null,
      };

      const { data } = await axios.post('/api/claude/generate-iterate', payload);
      if (!data.success) throw new Error(data.error);

      // Add control at position 0
      const controlVariant = {
        id: 'control',
        label: 'Contrôle',
        content: baseCreative.content || { headline: baseCreative.name },
        html: baseCreative.html || null,
        imagePath: baseCreative.imagePath || null,
        imageBase64: baseCreative.imageBase64 || null,
        formatId: baseCreative.formatId || baseCreative.format,
        changes: { variable: selectedVariable, value: 'Contrôle' },
        rationale: 'Créative de référence — toujours en position 1.',
      };

      setVariants([controlVariant, ...data.variants]);
      setStep(3);
      toast.success(`${data.variants.length} variantes générées`);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Erreur de génération');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) return toast.error('Format non supporté (JPG, PNG, WEBP)');

    setUploadAnalyzing(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Analyze via Claude Vision
      const { data } = await axios.post('/api/claude/analyze', {
        imageBase64: base64,
        mediaType: file.type,
      });
      if (!data.success) throw new Error(data.error);

      const analysis = data.analysis;
      const headline = analysis.typography?.find(t => t.type === 'headline')?.content || '';
      const subheadline = analysis.typography?.find(t => t.type === 'subheadline')?.content || '';
      const ctaText = analysis.cta?.text || '';

      // Build a synthetic creative from the analysis
      const synthetic = {
        id: `upload_${Date.now()}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        isUploaded: true,
        imageBase64: `data:${file.type};base64,${base64}`,
        content: {
          headline,
          subheadline,
          cta: ctaText,
          angle: analysis.copywriting_angle || '',
          structure: analysis.layout?.composition || 'hero-centré',
          colors: {
            background: analysis.background?.color || analysis.colors?.dominant?.[0] || '',
            text: analysis.typography?.find(t => t.type === 'headline')?.color || '#ffffff',
            cta: analysis.cta?.color || '',
          },
          copy_framework: analysis.copy_framework?.name || '',
          badges: analysis.persuasion_elements?.map(e => e.description).slice(0, 2) || [],
        },
        analysis,
        html: null,
      };

      setBaseCreative(synthetic);
      setStep(2);
      toast.success('Image analysée — créative prête');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'analyse');
    } finally {
      setUploadAnalyzing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const varCfg = VARIABLES.find(v => v.id === selectedVariable);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => onNavigate?.('dashboard')} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-violet-900/40 border border-violet-700/30 flex items-center justify-center">
            <RefreshCw size={17} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Itérer sur un winner</h1>
            <p className="text-xs text-zinc-500">Tester une seule variable à la fois pour des résultats fiables</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {step < 3 ? (
          <div className="p-8 max-w-3xl mx-auto">
            {/* Step 1: Select creative */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>1</div>
                <span className="text-sm font-semibold text-zinc-200">Sélectionner la créative de base</span>
              </div>

              {!baseCreative ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Option 1 : Upload */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    className="relative flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-zinc-700 hover:border-violet-500 rounded-xl text-zinc-400 hover:text-violet-300 transition-all group cursor-pointer"
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => handleUpload(e.target.files[0])}
                    />
                    {uploadAnalyzing ? (
                      <>
                        <Loader2 size={22} className="animate-spin text-violet-400" />
                        <span className="text-xs font-semibold text-violet-300">Analyse en cours…</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-violet-900/40 flex items-center justify-center transition-colors">
                          <Upload size={18} className="group-hover:text-violet-400 transition-colors" />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">Uploader une image</div>
                          <div className="text-[10px] text-zinc-600 mt-0.5">Drag & drop ou clic · JPG, PNG, WEBP</div>
                          <div className="text-[10px] text-violet-600 mt-1">Analyse Claude auto</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Option 2 : Bibliothèque */}
                  <button
                    onClick={() => setShowSelectModal(true)}
                    className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl text-zinc-400 hover:text-indigo-300 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-indigo-900/40 flex items-center justify-center transition-colors">
                      <BookImage size={18} className="group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">Bibliothèque</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5">Créatives existantes</div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-zinc-900 border border-indigo-500/40 rounded-xl">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {baseCreative.imageBase64
                      ? <img src={baseCreative.imageBase64} alt="" className="w-full h-full object-cover" />
                      : baseCreative.imagePath
                      ? <img src={`http://localhost:3001${baseCreative.imagePath}`} alt="" className="w-full h-full object-cover" />
                      : <BookImage size={18} className="text-zinc-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-200 truncate">
                      {baseCreative.content?.headline || baseCreative.name || 'Créative'}
                    </div>
                    {baseCreative.content?.angle && <div className="text-xs text-zinc-500">🎯 {baseCreative.content.angle}</div>}
                    {baseCreative.performance?.ctr && <div className="text-xs text-amber-400">CTR {baseCreative.performance.ctr}%</div>}
                  </div>
                  <Check size={16} className="text-indigo-400 shrink-0" />
                  <button onClick={() => setBaseCreative(null)} className="p-1 hover:bg-zinc-800 rounded text-zinc-600 hover:text-zinc-400">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Persona + Produit */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${baseCreative ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>2</div>
                <span className={`text-sm font-semibold ${baseCreative ? 'text-zinc-200' : 'text-zinc-600'}`}>Persona & Produit</span>
              </div>

              {baseCreative && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Persona selector */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowPersonaList(v => !v); setShowProductList(false); }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        selectedPersona
                          ? 'border-indigo-500/50 bg-indigo-900/10'
                          : 'border-dashed border-zinc-700 hover:border-indigo-500/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-800/40 flex items-center justify-center shrink-0">
                        <Users size={14} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {selectedPersona ? (
                          <>
                            <div className="text-[10px] text-zinc-500 leading-none mb-0.5">Persona <span className="text-red-500">*</span></div>
                            <div className="text-xs font-semibold text-zinc-200 truncate">{selectedPersona.name}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-[10px] text-zinc-500 leading-none mb-0.5">Persona <span className="text-red-500">*</span></div>
                            <div className="text-xs text-zinc-500">Sélectionner…</div>
                          </>
                        )}
                      </div>
                      {selectedPersona
                        ? <Check size={12} className="text-indigo-400 shrink-0" />
                        : <ChevronRight size={12} className="text-zinc-600 shrink-0" />}
                    </button>

                    {showPersonaList && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl max-h-52 overflow-y-auto">
                        {allPersonas.length === 0 ? (
                          <div className="px-3 py-4 text-xs text-zinc-500 text-center">Aucun persona — crée-en un d'abord</div>
                        ) : allPersonas.map(p => (
                          <button key={p.id} onClick={() => { setSelectedPersona(p); setShowPersonaList(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-zinc-800 transition-colors text-left ${selectedPersona?.id === p.id ? 'bg-indigo-900/20 text-indigo-300 font-semibold' : 'text-zinc-300'}`}>
                            <Users size={11} className="text-blue-400 shrink-0" />
                            <span className="truncate">{p.name}</span>
                            {p.demographics?.age && <span className="text-zinc-600 ml-auto shrink-0">{p.demographics.age}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Produit selector */}
                  <div className="relative">
                    <button
                      onClick={() => { setShowProductList(v => !v); setShowPersonaList(false); }}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        selectedProduct
                          ? 'border-emerald-500/50 bg-emerald-900/10'
                          : 'border-dashed border-zinc-700 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-900/40 border border-emerald-800/40 flex items-center justify-center shrink-0 overflow-hidden">
                        {selectedProduct?.packshot
                          ? <img src={selectedProduct.packshot} alt="" className="w-full h-full object-contain" />
                          : <Package size={14} className="text-emerald-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {selectedProduct ? (
                          <>
                            <div className="text-[10px] text-zinc-500 leading-none mb-0.5">Produit <span className="text-red-500">*</span></div>
                            <div className="text-xs font-semibold text-zinc-200 truncate">{selectedProduct.name}</div>
                          </>
                        ) : (
                          <>
                            <div className="text-[10px] text-zinc-500 leading-none mb-0.5">Produit <span className="text-red-500">*</span></div>
                            <div className="text-xs text-zinc-500">Sélectionner…</div>
                          </>
                        )}
                      </div>
                      {selectedProduct
                        ? <Check size={12} className="text-emerald-400 shrink-0" />
                        : <ChevronRight size={12} className="text-zinc-600 shrink-0" />}
                    </button>

                    {showProductList && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl max-h-52 overflow-y-auto">
                        {allProducts.length === 0 ? (
                          <div className="px-3 py-4 text-xs text-zinc-500 text-center">Aucun produit — crée-en un d'abord</div>
                        ) : allProducts.map(p => (
                          <button key={p.id} onClick={() => { setSelectedProduct(p); setShowProductList(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-zinc-800 transition-colors text-left ${selectedProduct?.id === p.id ? 'bg-emerald-900/20 text-emerald-300 font-semibold' : 'text-zinc-300'}`}>
                            <Package size={11} className="text-emerald-400 shrink-0" />
                            <span className="truncate">{p.name}</span>
                            {p.price && <span className="text-zinc-600 ml-auto shrink-0">{p.price}€</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Variable */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${selectedPersona && selectedProduct ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>3</div>
                <span className={`text-sm font-semibold ${selectedPersona && selectedProduct ? 'text-zinc-200' : 'text-zinc-600'}`}>Choisir la variable à tester</span>
              </div>

              {baseCreative && selectedPersona && selectedProduct && (
                <>
                  <div className="text-[10px] text-amber-400/80 mb-3 flex items-center gap-1.5 bg-amber-900/10 border border-amber-900/30 rounded-lg px-3 py-2">
                    <AlertCircle size={11} />
                    Pour des résultats fiables, teste une seule variable à la fois.
                    {selectedVariable && <span className="ml-auto">Appuie sur <kbd className="bg-zinc-800 px-1 rounded">Entrée</kbd> pour générer</span>}
                  </div>

                  <div className="grid grid-cols-1 gap-2 mb-6">
                    {VARIABLES.map((v, i) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariable(selectedVariable === v.id ? null : v.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                          selectedVariable === v.id
                            ? 'border-indigo-500 bg-indigo-900/20'
                            : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                        }`}
                      >
                        <span className="text-2xl">{v.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-semibold ${selectedVariable === v.id ? 'text-indigo-300' : 'text-zinc-200'}`}>{v.label}</div>
                          <div className="text-xs text-zinc-500 mt-0.5">{v.desc}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <kbd className="text-[9px] text-zinc-600 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">{i + 1}</kbd>
                          {selectedVariable === v.id && <Check size={14} className="text-indigo-400" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Strategy & count */}
                  {selectedVariable && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
                      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Configuration</h3>

                      {varCfg?.strategies && (
                        <div className="mb-4">
                          <label className="text-xs text-zinc-400 mb-2 block">Stratégie de test</label>
                          <div className="grid grid-cols-2 gap-2">
                            {varCfg.strategies.map(s => (
                              <button key={s.id} onClick={() => setSelectedStrategy(s.id)}
                                className={`p-2.5 rounded-lg border text-[11px] font-semibold text-left transition-all ${
                                  selectedStrategy === s.id
                                    ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300'
                                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                }`}>
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-xs text-zinc-400 mb-2 block">
                          Nombre de variantes : <span className="text-zinc-200 font-bold">{count}</span>
                        </label>
                        <input
                          type="range" min={3} max={8} step={1} value={count}
                          onChange={e => setCount(parseInt(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                        <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                          <span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {(() => {
                    const ready = selectedVariable && selectedPersona && selectedProduct && !loading;
                    const missing = !selectedPersona ? 'persona' : !selectedProduct ? 'produit' : !selectedVariable ? 'variable' : null;
                    return (
                      <button
                        onClick={handleGenerate}
                        disabled={!ready}
                        title={missing ? `Sélectionne un ${missing} pour continuer` : ''}
                        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all ${
                          ready
                            ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <><Loader2 size={16} className="animate-spin" /> Génération en cours…</>
                        ) : missing ? (
                          <><AlertCircle size={16} /> Sélectionne un {missing} pour continuer</>
                        ) : (
                          <><Zap size={16} /> Générer {count} variantes — {VARIABLES.find(v => v.id === selectedVariable)?.icon}</>
                        )}
                      </button>
                    );
                  })()}
                </>
              )}
            </div>
          </div>
        ) : (
          /* Results */
          <div className="flex flex-col h-full">
            {/* Results header */}
            <div className="px-8 py-4 border-b border-zinc-800/60 flex items-center gap-4 shrink-0">
              <button onClick={() => { setStep(2); setVariants([]); }}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                <ChevronLeft size={14} /> Modifier
              </button>
              <div className="flex items-center gap-2">
                <span className="text-lg">{varCfg?.icon}</span>
                <div>
                  <span className="text-sm font-bold text-zinc-200">Test {varCfg?.label}</span>
                  <span className="text-xs text-zinc-500 ml-2">{variants.length - 1} variantes + contrôle</span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className="text-[10px] text-zinc-600 bg-indigo-900/20 border border-indigo-500/20 px-3 py-1.5 rounded-lg">
                  {varCfg?.highlight} • Tout le reste est identique
                </div>
                <button
                  onClick={() => { setStep(2); setVariants([]); setSelectedVariable(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <RefreshCw size={12} /> Nouveau test
                </button>
              </div>
            </div>

            {/* Horizontal grid */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-4 p-6 h-full" ref={scrollRef} style={{ minWidth: `${variants.length * 300}px` }}>
                {variants.map((v, i) => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    isControl={i === 0}
                    variable={selectedVariable}
                    index={i}
                    onFavorite={() => {}}
                    onFeedback={setFeedbackCreative}
                  />
                ))}
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="px-8 py-4 border-t border-zinc-800/60 flex items-center gap-4 shrink-0">
              <span className="text-xs text-zinc-600">Marque un winner puis teste la prochaine variable :</span>
              {['headline', 'colors', 'angle', 'structure', 'cta'].map(v => (
                <button key={v} onClick={() => { setSelectedVariable(v); setStep(2); setVariants([]); }}
                  className={`text-xs px-2 py-1 rounded border transition-all ${v === selectedVariable ? 'border-violet-500 text-violet-300 bg-violet-900/20' : 'border-zinc-700 text-zinc-500 hover:border-zinc-500'}`}>
                  {VARIABLES.find(vv => vv.id === v)?.icon} {VARIABLES.find(vv => vv.id === v)?.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSelectModal && (
        <CreativeSelectModal
          onSelect={c => { setBaseCreative(c); setStep(2); }}
          onClose={() => setShowSelectModal(false)}
        />
      )}

      {feedbackCreative && (
        <FeedbackModal
          creative={feedbackCreative}
          onClose={() => setFeedbackCreative(null)}
          onSaved={() => { setFeedbackCreative(null); toast.success('Résultats enregistrés'); }}
        />
      )}
    </div>
  );
}
