import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BookImage, Search, Trash2, Star, Eye, Filter, X,
  CheckCircle2, Clock, Archive, FileCode, Loader2,
  ChevronDown, Sparkles, LayoutTemplate, Monitor,
  Smartphone, Square, BarChart2, RefreshCw,
} from 'lucide-react';
import { getFormatById, FORMAT_CATEGORIES } from '../utils/formats';
import CreativeCanvas from '../components/Canvas/CreativeCanvas';
import FeedbackModal from '../components/Common/FeedbackModal';

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG = {
  draft:     { label: 'Brouillon', icon: Clock,        color: 'text-zinc-400',   bg: 'bg-zinc-800',       dot: 'bg-zinc-500' },
  published: { label: 'Publié',    icon: CheckCircle2,  color: 'text-emerald-400', bg: 'bg-emerald-900/30', dot: 'bg-emerald-500' },
  archived:  { label: 'Archivé',   icon: Archive,       color: 'text-amber-400',   bg: 'bg-amber-900/30',   dot: 'bg-amber-500' },
};

const PERF_STATUS_CFG = {
  winner:      { label: '🏆 Winner',    dot: 'bg-yellow-400' },
  potential:   { label: '⚡ Potentiel', dot: 'bg-blue-400' },
  loser:       { label: '❌ Loser',     dot: 'bg-red-400' },
  testing:     { label: '⏳ En test',   dot: 'bg-amber-400' },
  not_launched:{ label: '🚫 Pas lancé', dot: 'bg-zinc-600' },
};

function FormatMini({ formatId }) {
  const f = getFormatById(formatId);
  if (!f) return null;
  const Icon = f.width > f.height * 1.5 ? Monitor : f.height > f.width * 1.5 ? Smartphone : Square;
  return <span className="flex items-center gap-1 text-[9px] text-zinc-500"><Icon size={9} />{f.label}</span>;
}

// ─── Preview modal ──────────────────────────────────────────────────────────
function PreviewModal({ creative, onClose }) {
  const format = getFormatById(creative.formatId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 truncate max-w-md">{creative.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <FormatMini formatId={creative.formatId} />
              {creative.framework && <span className="text-[9px] font-black text-indigo-400">{creative.framework}</span>}
              {creative.variantAngle && <span className="text-[9px] text-zinc-600">{creative.variantAngle}</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 flex flex-col items-center">
          {creative.html && format
            ? <CreativeCanvas html={creative.html} format={format} />
            : <div className="w-48 h-48 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-700"><BookImage size={32} /></div>
          }
        </div>
        <div className="px-5 pb-5 grid grid-cols-2 gap-2 text-[10px] border-t border-zinc-800 pt-3">
          {creative.paletteId && <div><span className="text-zinc-600">Palette : </span><span className="text-zinc-300">{creative.paletteId}</span></div>}
          {creative.competitorReference && <div><span className="text-zinc-600">Réf : </span><span className="text-zinc-300">{creative.competitorReference}</span></div>}
          {creative.createdAt && <div><span className="text-zinc-600">Créée : </span><span className="text-zinc-300">{new Date(creative.createdAt).toLocaleDateString('fr-FR')}</span></div>}
          {creative.tags?.length > 0 && (
            <div className="col-span-2 flex gap-1 flex-wrap pt-1">
              {creative.tags.map(t => <span key={t} className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{t}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Creative card ──────────────────────────────────────────────────────────
function CreativeCard({ creative, onFavorite, onDelete, onStatusChange, onPreview, onExport, onFeedback, onIterate }) {
  const status = STATUS_CFG[creative.status] || STATUS_CFG.draft;
  const format = getFormatById(creative.formatId);
  const thumbScale = format ? (128 / format.height) : 0.1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-all group">
      {/* Thumbnail */}
      <div className="h-32 bg-zinc-800/60 flex items-center justify-center relative cursor-pointer overflow-hidden" onClick={() => onPreview(creative)}>
        {creative.html && format ? (
          <div className="absolute inset-0 flex items-start justify-center overflow-hidden">
            <iframe srcDoc={creative.html} scrolling="no" sandbox="allow-same-origin"
              style={{
                width: `${format.width}px`,
                height: `${format.height}px`,
                border: 'none',
                transform: `scale(${thumbScale})`,
                transformOrigin: 'top center',
                pointerEvents: 'none',
                marginTop: 0,
              }}
            />
          </div>
        ) : <BookImage size={24} className="text-zinc-600" />}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
          <Eye size={18} className="text-white" />
        </div>

        {/* Favorite */}
        <button onClick={e => { e.stopPropagation(); onFavorite(creative); }}
          className={`absolute top-2 left-2 z-20 p-1 rounded-full transition-all ${creative.favorite ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-900/60 text-zinc-600 opacity-0 group-hover:opacity-100'}`}>
          <Star size={11} className={creative.favorite ? 'fill-yellow-400' : ''} />
        </button>

        {/* Framework badge */}
        {creative.framework && (
          <div className="absolute top-2 right-2 z-20 text-[8px] font-black bg-indigo-900/80 border border-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded-full">
            {creative.framework}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-1.5">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-zinc-300 truncate leading-tight">{creative.name}</div>
            <FormatMini formatId={creative.formatId} />
          </div>
          <div className="flex items-center gap-0.5 shrink-0 z-10">
            <button onClick={() => onFeedback(creative)} title="Résultats" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-emerald-400 transition-all"><BarChart2 size={11} /></button>
            <button onClick={() => onIterate(creative)} title="Itérer" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-violet-400 transition-all"><RefreshCw size={11} /></button>
            <button onClick={() => onExport(creative)} title="Export HTML" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-all"><FileCode size={11} /></button>
            <button onClick={() => onDelete(creative.id)} title="Supprimer" className="p-1.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-all"><Trash2 size={11} /></button>
          </div>
        </div>

        {/* Status dropdown */}
        <div className="relative group/status inline-block">
          <button className={`flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${status.bg} ${status.color}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
            <ChevronDown size={8} />
          </button>
          <div className="absolute left-0 top-full mt-1 z-30 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden shadow-xl opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all min-w-[100px]">
            {Object.keys(STATUS_CFG).map(s => {
              const sc = STATUS_CFG[s];
              return (
                <button key={s} onClick={() => onStatusChange(creative, s)}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-[10px] hover:bg-zinc-800 transition-colors ${creative.status === s ? sc.color + ' font-semibold' : 'text-zinc-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {creative.performance?.status && PERF_STATUS_CFG[creative.performance.status] && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${PERF_STATUS_CFG[creative.performance.status].dot}`} />
            <span className="text-[9px] text-zinc-500">{PERF_STATUS_CFG[creative.performance.status].label}</span>
            {creative.performance?.ctr && <span className="text-[9px] text-zinc-500 ml-1">CTR {creative.performance.ctr}%</span>}
          </div>
        )}

        {creative.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {creative.tags.slice(0, 3).map(t => <span key={t} className="text-[8px] text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stats bar ──────────────────────────────────────────────────────────────
function StatsBar({ creatives }) {
  const favs = creatives.filter(c => c.favorite).length;
  const published = creatives.filter(c => c.status === 'published').length;
  const frameworks = [...new Set(creatives.map(c => c.framework).filter(Boolean))];
  return (
    <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
      <span><span className="text-zinc-200 font-semibold">{creatives.length}</span> créative{creatives.length > 1 ? 's' : ''}</span>
      {published > 0 && <span className="text-emerald-400"><CheckCircle2 size={10} className="inline mr-1" />{published} publiée{published > 1 ? 's' : ''}</span>}
      {favs > 0 && <span className="text-yellow-400"><Star size={10} className="inline mr-1 fill-yellow-400" />{favs} favori{favs > 1 ? 's' : ''}</span>}
      {frameworks.length > 0 && <span className="text-indigo-400 font-bold">{frameworks.join(' · ')}</span>}
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────
export default function LibraryPage({ onNavigate }) {
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [preview, setPreview] = useState(null);
  const [feedbackCreative, setFeedbackCreative] = useState(null);

  const [search, setSearch] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterPersona, setFilterPersona] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFav, setFilterFav] = useState(false);
  const [filterFramework, setFilterFramework] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: c }, { data: p }, { data: per }] = await Promise.all([
        axios.get('/api/creatives'),
        axios.get('/api/products'),
        axios.get('/api/personas'),
      ]);
      setCreatives(c); setProducts(p); setPersonas(per);
    } catch { toast.error('Erreur de chargement'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const allFrameworks = useMemo(() => [...new Set(creatives.map(c => c.framework).filter(Boolean))], [creatives]);

  const filtered = useMemo(() => {
    let list = [...creatives];
    if (search) { const q = search.toLowerCase(); list = list.filter(c => c.name?.toLowerCase().includes(q) || c.tags?.some(t => t.toLowerCase().includes(q))); }
    if (filterProduct) list = list.filter(c => c.productId === filterProduct);
    if (filterPersona) list = list.filter(c => c.personaId === filterPersona);
    if (filterStatus) list = list.filter(c => c.status === filterStatus);
    if (filterFav) list = list.filter(c => c.favorite);
    if (filterFramework) list = list.filter(c => c.framework === filterFramework);
    return list;
  }, [creatives, search, filterProduct, filterPersona, filterStatus, filterFav, filterFramework]);

  const hasFilters = search || filterProduct || filterPersona || filterStatus || filterFav || filterFramework;
  const clearFilters = () => { setSearch(''); setFilterProduct(''); setFilterPersona(''); setFilterStatus(''); setFilterFav(false); setFilterFramework(''); };

  const handleFavorite = async (c) => {
    try { const { data } = await axios.put(`/api/creatives/${c.id}`, { favorite: !c.favorite }); setCreatives(p => p.map(x => x.id === c.id ? data : x)); } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette créative ?')) return;
    try { await axios.delete(`/api/creatives/${id}`); setCreatives(p => p.filter(c => c.id !== id)); toast.success('Supprimée'); } catch { toast.error('Erreur'); }
  };

  const handleStatusChange = async (creative, status) => {
    try { const { data } = await axios.put(`/api/creatives/${creative.id}`, { status }); setCreatives(p => p.map(x => x.id === creative.id ? data : x)); toast.success(`→ ${STATUS_CFG[status].label}`); } catch { toast.error('Erreur'); }
  };

  const handleFeedbackSaved = (updated) => {
    setCreatives(prev => prev.map(c => c.id === (updated?.id || feedbackCreative?.id) ? { ...c, ...updated } : c));
    setFeedbackCreative(null);
    toast.success('Résultats enregistrés');
  };

  const handleIterate = (creative) => {
    onNavigate?.('iterate');
  };

  const handleExport = async (creative) => {
    if (!creative.html) return toast.error('Pas de HTML enregistré');
    try {
      const filename = `${creative.name || 'creative'}.html`.replace(/[^a-z0-9_\-\.]/gi, '_');
      const { data } = await axios.post('/api/export/html', { html: creative.html, filename }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'text/html' }));
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success('HTML téléchargé');
    } catch { toast.error('Erreur export'); }
  };

  const selectCls = "bg-zinc-800/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-7 pb-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <BookImage size={17} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Bibliothèque</h1>
              {!loading && <StatsBar creatives={creatives} />}
            </div>
          </div>
          <button onClick={() => onNavigate?.('generator')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
            <Sparkles size={14} /> Créer
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="bg-zinc-800/60 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 w-44" />
          </div>
          {products.length > 0 && (
            <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} className={selectCls}>
              <option value="">Tous produits</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {personas.length > 0 && (
            <select value={filterPersona} onChange={e => setFilterPersona(e.target.value)} className={selectCls}>
              <option value="">Tous personas</option>
              {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectCls}>
            <option value="">Tous statuts</option>
            {Object.entries(STATUS_CFG).map(([s, sc]) => <option key={s} value={s}>{sc.label}</option>)}
          </select>
          {allFrameworks.length > 0 && (
            <select value={filterFramework} onChange={e => setFilterFramework(e.target.value)} className={selectCls}>
              <option value="">Tous frameworks</option>
              {allFrameworks.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          )}
          <button onClick={() => setFilterFav(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${filterFav ? 'border-yellow-500/50 bg-yellow-900/20 text-yellow-400' : 'border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}>
            <Star size={11} className={filterFav ? 'fill-yellow-400' : ''} /> Favoris
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              <X size={11} /> Effacer
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading && <div className="flex items-center justify-center py-20"><Loader2 size={24} className="text-zinc-600 animate-spin" /></div>}

        {!loading && creatives.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4"><BookImage size={24} className="text-zinc-500" /></div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Bibliothèque vide</h3>
            <p className="text-xs text-zinc-600 mb-5">Génère des créatives dans le Générateur et sauvegarde-les ici.</p>
            <button onClick={() => onNavigate?.('generator')} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
              <Sparkles size={14} /> Aller au Générateur
            </button>
          </div>
        )}

        {!loading && creatives.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12">
            <Filter size={24} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Aucun résultat pour ces filtres.</p>
            <button onClick={clearFilters} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline">Effacer</button>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <p className="text-xs text-zinc-600 mb-4">{filtered.length} créative{filtered.length > 1 ? 's' : ''}{hasFilters ? ` sur ${creatives.length}` : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(c => (
                <CreativeCard key={c.id} creative={c}
                  onFavorite={handleFavorite} onDelete={handleDelete}
                  onStatusChange={handleStatusChange} onPreview={setPreview}
                  onExport={handleExport}
                  onFeedback={setFeedbackCreative}
                  onIterate={handleIterate}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {preview && <PreviewModal creative={preview} onClose={() => setPreview(null)} />}
      {feedbackCreative && (
        <FeedbackModal
          creative={feedbackCreative}
          onClose={() => setFeedbackCreative(null)}
          onSaved={handleFeedbackSaved}
        />
      )}
    </div>
  );
}
