import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Upload, Brain, Wand2, Loader2, CheckCircle2, AlertCircle,
  X, RefreshCw, Edit3, MessageSquarePlus, Download, Star,
  BookImage, ChevronDown, ChevronUp, Package, Users, Layers,
  ImageIcon, Sparkles, Play, ZapIcon, Eye, ArrowRight, FileImage,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMATS_AI = [
  { id: 'fb_feed_portrait', label: 'Feed Portrait', sub: '1080×1350', size: '1024x1536', ratio: '4:5' },
  { id: 'fb_feed_square',   label: 'Feed Carré',    sub: '1080×1080', size: '1024x1024', ratio: '1:1' },
  { id: 'fb_story',         label: 'Story / Reel',  sub: '1080×1920', size: '1024x1536', ratio: '9:16' },
  { id: 'gg_display_banner',label: 'Bannière',      sub: '1200×628',  size: '1536x1024', ratio: '3:2' },
];

const QUALITY_OPTIONS = [
  { id: 'high',   label: 'Haute',    desc: 'Meilleur rendu' },
  { id: 'medium', label: 'Standard', desc: 'Bon équilibre' },
  { id: 'low',    label: 'Rapide',   desc: 'Test rapide' },
];

const COST_TABLE = {
  high:   { '1024x1024': 0.167, '1024x1536': 0.250, '1536x1024': 0.250 },
  medium: { '1024x1024': 0.042, '1024x1536': 0.063, '1536x1024': 0.063 },
  low:    { '1024x1024': 0.011, '1024x1536': 0.016, '1536x1024': 0.016 },
};

const HOOK_LABELS = {
  chiffre: 'Chiffre choc', question: 'Question', douleur: 'Douleur',
  promesse: 'Promesse', preuve_sociale: 'Preuve sociale', avant_apres: 'Avant/Après',
  urgence: 'Urgence', autorite: 'Autorité', curiosite: 'Curiosité', comparaison: 'Comparaison',
};

const ANGLE_COLORS = {
  douleur: 'text-red-400 bg-red-900/20 border-red-800/40',
  transformation: 'text-violet-400 bg-violet-900/20 border-violet-800/40',
  promesse: 'text-blue-400 bg-blue-900/20 border-blue-800/40',
  'preuve_sociale': 'text-emerald-400 bg-emerald-900/20 border-emerald-800/40',
  urgence: 'text-orange-400 bg-orange-900/20 border-orange-800/40',
  bénéfice: 'text-cyan-400 bg-cyan-900/20 border-cyan-800/40',
};

// ─── UploadZone ───────────────────────────────────────────────────────────────

function UploadZone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      return toast.error('Fichier non supporté — images uniquement');
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(',')[1];
      onFile({ dataUrl, base64, mediaType: file.type, filename: file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
          dragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/30'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
          <Upload size={28} className="text-zinc-500" />
        </div>
        <h3 className="text-base font-bold text-zinc-300 mb-2">Dépose ta créative source</h3>
        <p className="text-sm text-zinc-500 mb-4 leading-relaxed">
          Une créative concurrente qui performe,<br/>ou une de tes ads qui spend déjà.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-zinc-600">
          {['Créative concurrent', 'Ton ad performante', 'Inspiration visuelle'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />{t}
            </span>
          ))}
        </div>
        <div className="mt-5 text-[10px] text-zinc-600">PNG, JPG, WEBP — max 20MB</div>
      </div>
    </div>
  );
}

// ─── AnalysisPanel ────────────────────────────────────────────────────────────

function AnalysisPanel({ analysis, onChange, sourceImage }) {
  const [editMode, setEditMode] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState('');

  const startEdit = () => {
    setRawJson(JSON.stringify(analysis, null, 2));
    setJsonError('');
    setEditMode(true);
  };

  const saveEdit = () => {
    try {
      const parsed = JSON.parse(rawJson);
      onChange(parsed);
      setEditMode(false);
      toast.success('Analyse mise à jour');
    } catch {
      setJsonError('JSON invalide — vérifiez la syntaxe');
    }
  };

  const score = analysis.overall_score;
  const scoreColor = score >= 8 ? 'text-emerald-400' : score >= 6 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" /> Analyse terminée
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Modifie les champs si besoin avant de générer</p>
        </div>
        <div className="flex items-center gap-2">
          {analysis.overall_score && (
            <div className={`text-xs font-bold ${scoreColor} bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1`}>
              Score {score}/10
            </div>
          )}
          <button onClick={startEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors">
            <Edit3 size={11} /> Modifier (JSON)
          </button>
        </div>
      </div>

      {editMode ? (
        <div className="space-y-2">
          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            className="w-full h-72 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-300 font-mono resize-none focus:outline-none focus:border-indigo-500"
          />
          {jsonError && <p className="text-xs text-red-400">{jsonError}</p>}
          <div className="flex gap-2">
            <button onClick={saveEdit}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors">
              Enregistrer
            </button>
            <button onClick={() => setEditMode(false)}
              className="px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded-lg transition-colors">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Layout */}
          <div className="col-span-2 bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
            <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Composition</div>
            <p className="text-xs text-zinc-300 leading-relaxed">{analysis.layout?.composition || '—'}</p>
            {analysis.layout?.zones?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.layout.zones.map((z, i) => (
                  <span key={i} className="text-[9px] bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">{z}</span>
                ))}
              </div>
            )}
          </div>

          {/* Hook */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
            <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Hook</div>
            <div className="text-[10px] font-semibold text-indigo-400 mb-1">
              {HOOK_LABELS[analysis.hook?.mechanism] || analysis.hook?.mechanism || '?'}
            </div>
            <p className="text-xs text-zinc-400 italic">"{analysis.hook?.text || '—'}"</p>
          </div>

          {/* Framework */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
            <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Framework</div>
            <div className="text-sm font-black text-indigo-400">{analysis.copy_framework?.name || '?'}</div>
            <p className="text-[10px] text-zinc-500 mt-0.5">{analysis.copy_framework?.full_name || ''}</p>
          </div>

          {/* Angle copywriting */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
            <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Angle marketing</div>
            <p className="text-xs text-zinc-300 capitalize">{analysis.copywriting_angle || '—'}</p>
          </div>

          {/* Background */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
            <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Background</div>
            <p className="text-xs text-zinc-300">{analysis.background?.description || '—'}</p>
          </div>

          {/* Colors */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
            <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Palette</div>
            <div className="flex flex-wrap gap-1.5">
              {[...(analysis.colors?.dominant || []), ...(analysis.colors?.secondary || []), ...(analysis.colors?.accent || [])].slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded border border-zinc-600" style={{ background: c }} />
                  <span className="text-[9px] text-zinc-500 font-mono">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
            <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">CTA</div>
            <div className="text-xs text-zinc-300 font-semibold">"{analysis.cta?.text || '—'}"</div>
            <p className="text-[10px] text-zinc-500 mt-0.5">{analysis.cta?.shape} · {analysis.cta?.position}</p>
          </div>

          {/* Persuasion */}
          {analysis.persuasion_elements?.length > 0 && (
            <div className="col-span-2 bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3">
              <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Éléments de persuasion</div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.persuasion_elements.map((e, i) => (
                  <span key={i} className="text-[10px] bg-amber-900/20 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded-full">
                    {e.type} — {e.description}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths / Weaknesses */}
          {(analysis.strengths?.length > 0 || analysis.weaknesses?.length > 0) && (
            <div className="col-span-2 grid grid-cols-2 gap-3">
              {analysis.strengths?.length > 0 && (
                <div className="bg-emerald-900/10 border border-emerald-800/30 rounded-xl p-3">
                  <div className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wider mb-1.5">Points forts</div>
                  {analysis.strengths.slice(0, 3).map((s, i) => (
                    <p key={i} className="text-[10px] text-zinc-400 flex items-start gap-1"><span className="text-emerald-500 mt-0.5">+</span>{s}</p>
                  ))}
                </div>
              )}
              {analysis.weaknesses?.length > 0 && (
                <div className="bg-red-900/10 border border-red-800/30 rounded-xl p-3">
                  <div className="text-[9px] font-semibold text-red-500 uppercase tracking-wider mb-1.5">À améliorer</div>
                  {analysis.weaknesses.slice(0, 3).map((w, i) => (
                    <p key={i} className="text-[10px] text-zinc-400 flex items-start gap-1"><span className="text-red-500 mt-0.5">→</span>{w}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────

function ResultCard({ result, formatId, onRegenerate, onIterate, onExport, onFavorite, onSaveLibrary }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(result.gpt_prompt);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [showIterate, setShowIterate] = useState(false);
  const [iterateInput, setIterateInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const angleClass = ANGLE_COLORS[result.angle] || ANGLE_COLORS[result.hook_mechanism] || 'text-zinc-400 bg-zinc-800 border-zinc-700';

  const aspectClass = {
    'fb_feed_portrait': 'aspect-[4/5]',
    'ig_feed_portrait': 'aspect-[4/5]',
    'fb_story': 'aspect-[9/16]',
    'ig_story': 'aspect-[9/16]',
    'ig_reel': 'aspect-[9/16]',
    'fb_feed_square': 'aspect-square',
    'ig_feed_square': 'aspect-square',
    'gg_display_banner': 'aspect-[3/2]',
  }[formatId] || 'aspect-[4/5]';

  const handleSaveLib = async () => {
    setIsSaving(true);
    await onSaveLibrary(result);
    setIsSaving(false);
  };

  const handleIterateSubmit = async () => {
    if (!iterateInput.trim()) return;
    setShowIterate(false);
    await onIterate(result.variant_index, iterateInput.trim(), editedPrompt);
    setIterateInput('');
  };

  const handlePromptRerun = async () => {
    setIsEditingPrompt(false);
    setShowPrompt(false);
    await onIterate(result.variant_index, null, editedPrompt);
  };

  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden flex flex-col transition-all ${
      result.isFavorite ? 'border-amber-500/40' : 'border-zinc-800'
    }`}>
      {/* Image */}
      <div className={`relative ${aspectClass} bg-zinc-800 overflow-hidden`}>
        {result.status === 'running' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-800">
            <Loader2 size={24} className="text-indigo-400 animate-spin" />
            <span className="text-[10px] text-zinc-500">Génération en cours…</span>
          </div>
        )}
        {result.status === 'pending' && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/80">
            <ImageIcon size={24} className="text-zinc-600" />
          </div>
        )}
        {result.status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-900/20 p-4">
            <AlertCircle size={20} className="text-red-400" />
            <p className="text-[10px] text-red-400 text-center">{result.error || 'Erreur de génération'}</p>
          </div>
        )}
        {result.status === 'done' && result.imageUrl && (
          <img src={result.imageUrl} alt={result.headline_fr} className="w-full h-full object-cover" />
        )}
        {/* Favorite badge */}
        {result.isFavorite && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
            <Star size={12} className="text-white fill-white" />
          </div>
        )}
        {/* Strategy badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
            V{result.variant_index}
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-zinc-400 truncate">{result.strategy_name}</div>
            {result.headline_fr && (
              <div className="text-xs font-bold text-zinc-200 mt-0.5 leading-snug line-clamp-2">
                {result.headline_fr}
              </div>
            )}
          </div>
          <button onClick={() => onFavorite(result.variant_index)}
            className={`shrink-0 p-1 rounded-lg transition-colors ${result.isFavorite ? 'text-amber-400 bg-amber-900/20' : 'text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'}`}>
            <Star size={13} className={result.isFavorite ? 'fill-amber-400' : ''} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <span className={`text-[8px] font-semibold border rounded-full px-1.5 py-0.5 ${angleClass}`}>
            {result.angle || result.hook_mechanism}
          </span>
          {result.framework && (
            <span className="text-[8px] font-black text-indigo-400 bg-indigo-900/20 border border-indigo-800/40 rounded-full px-1.5 py-0.5">
              {result.framework}
            </span>
          )}
        </div>

        {result.sub_fr && (
          <p className="text-[10px] text-zinc-500 leading-snug line-clamp-2">{result.sub_fr}</p>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-zinc-800 px-3 py-2 flex items-center gap-1">
        <button onClick={() => onRegenerate(result.variant_index)}
          disabled={result.status === 'running'}
          title="Régénérer"
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-40">
          <RefreshCw size={11} />
        </button>
        <button onClick={() => { setShowIterate(v => !v); setShowPrompt(false); }}
          title="Itérer"
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${showIterate ? 'text-violet-400 bg-violet-900/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}>
          <MessageSquarePlus size={11} />
        </button>
        <button onClick={() => { setShowPrompt(v => !v); setShowIterate(false); setEditedPrompt(result.gpt_prompt); setIsEditingPrompt(false); }}
          title="Voir / modifier le prompt"
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${showPrompt ? 'text-blue-400 bg-blue-900/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}>
          <Edit3 size={11} />
        </button>
        {result.status === 'done' && (
          <>
            <button onClick={() => onExport(result)} title="Télécharger"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors">
              <Download size={11} />
            </button>
            <button onClick={handleSaveLib} disabled={isSaving} title="Enregistrer dans la bibliothèque"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-40">
              {isSaving ? <Loader2 size={11} className="animate-spin" /> : <BookImage size={11} />}
            </button>
          </>
        )}
      </div>

      {/* Prompt section */}
      {showPrompt && (
        <div className="border-t border-zinc-800 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Prompt GPT</span>
            {!isEditingPrompt && (
              <button onClick={() => setIsEditingPrompt(true)}
                className="text-[9px] text-indigo-400 hover:text-indigo-300">modifier</button>
            )}
          </div>
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            readOnly={!isEditingPrompt}
            rows={5}
            className={`w-full bg-zinc-950 border rounded-lg p-2 text-[10px] text-zinc-400 font-mono resize-none focus:outline-none ${
              isEditingPrompt ? 'border-indigo-500/60 text-zinc-200' : 'border-zinc-800'
            }`}
          />
          {isEditingPrompt && (
            <div className="flex gap-2">
              <button onClick={handlePromptRerun}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold rounded-lg transition-colors">
                <Play size={10} /> Relancer avec ce prompt
              </button>
              <button onClick={() => { setIsEditingPrompt(false); setEditedPrompt(result.gpt_prompt); }}
                className="px-3 py-1.5 bg-zinc-700 text-zinc-300 text-[10px] rounded-lg hover:bg-zinc-600 transition-colors">
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {/* Iterate section */}
      {showIterate && (
        <div className="border-t border-zinc-800 p-3 space-y-2">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Instructions d'itération</div>
          <textarea
            value={iterateInput}
            onChange={(e) => setIterateInput(e.target.value)}
            placeholder='Ex: "plus agressif", "change le fond en lifestyle", "ajoute un badge -30%"'
            rows={2}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-[10px] text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500"
          />
          <div className="flex gap-2">
            <button onClick={handleIterateSubmit}
              disabled={!iterateInput.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white text-[10px] font-semibold rounded-lg transition-colors">
              <Wand2 size={10} /> Générer
            </button>
            <button onClick={() => { setShowIterate(false); setIterateInput(''); }}
              className="px-3 py-1.5 bg-zinc-700 text-zinc-300 text-[10px] rounded-lg hover:bg-zinc-600 transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AICreatorPage({ onNavigate }) {
  // Data
  const [products, setProducts] = useState([]);
  const [personas, setPersonas] = useState([]);

  // Workflow phase
  const [phase, setPhase] = useState('idle'); // idle | analyzing | analyzed | generating | done
  const [sourceImage, setSourceImage] = useState(null); // { dataUrl, base64, mediaType, filename }
  const [analysis, setAnalysis] = useState(null);

  // Config
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(FORMATS_AI[0]);
  const [variantCount, setVariantCount] = useState(4);
  const [quality, setQuality] = useState('high');

  // Results
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([axios.get('/api/products'), axios.get('/api/personas')])
      .then(([{ data: p }, { data: per }]) => {
        setProducts(p);
        setPersonas(per);
        if (p.length) setSelectedProduct(p[0]);
      })
      .catch(() => {});
  }, []);

  // ── Cost estimate ──
  const costEstimate = (() => {
    const perImg = (COST_TABLE[quality] || COST_TABLE.high)[selectedFormat.size] || 0.167;
    return (perImg * variantCount).toFixed(2);
  })();

  // ── File selected ──
  const handleFile = (img) => {
    setSourceImage(img);
    setAnalysis(null);
    setResults([]);
    setPhase('idle');
  };

  // ── Analyze with Claude Vision ──
  const handleAnalyze = async () => {
    if (!sourceImage) return;
    setPhase('analyzing');
    try {
      const { data } = await axios.post('/api/claude/analyze', {
        imageBase64: sourceImage.base64,
        mediaType: sourceImage.mediaType,
      });
      setAnalysis(data.analysis);
      setPhase('analyzed');
      toast.success('Analyse terminée');
    } catch (err) {
      setPhase('idle');
      toast.error(err.response?.data?.error || 'Erreur lors de l\'analyse');
    }
  };

  // ── Generate all images ──
  const handleGenerateAll = async () => {
    if (!selectedProduct) return toast.error('Sélectionne un produit');
    if (!analysis) return toast.error('Lance d\'abord l\'analyse');

    setPhase('generating');

    let prompts = [];
    try {
      const { data } = await axios.post('/api/gpt-images/generate-prompts', {
        analysis,
        product: selectedProduct,
        persona: selectedPersona || null,
        formatId: selectedFormat.id,
        count: variantCount,
      });
      prompts = data.prompts;
      toast.success(`${prompts.length} prompts générés par Claude`);
    } catch (err) {
      setPhase('analyzed');
      return toast.error(err.response?.data?.error || 'Erreur de génération des prompts');
    }

    // Initialise result cards
    const initialResults = prompts.map(p => ({
      ...p,
      status: 'pending',
      imageUrl: null,
      filename: null,
      isFavorite: false,
      error: null,
    }));
    setResults(initialResults);

    // Generate images one by one
    const res = [...initialResults];
    for (let i = 0; i < res.length; i++) {
      res[i] = { ...res[i], status: 'running' };
      setResults([...res]);
      try {
        const { data } = await axios.post('/api/gpt-images/generate-image', {
          prompt: res[i].gpt_prompt,
          formatId: selectedFormat.id,
          quality,
        });
        res[i] = { ...res[i], status: 'done', imageUrl: data.url, filename: data.filename };
      } catch (err) {
        res[i] = { ...res[i], status: 'error', error: err.response?.data?.error || err.message };
      }
      setResults([...res]);
    }

    setPhase('done');
    const ok = res.filter(r => r.status === 'done').length;
    toast.success(`${ok}/${res.length} créatives générées`);
  };

  // ── Regenerate single card (same prompt) ──
  const handleRegenerate = async (variantIndex) => {
    const result = results.find(r => r.variant_index === variantIndex);
    if (!result) return;
    updateResult(variantIndex, { status: 'running', imageUrl: null, filename: null, error: null });
    try {
      const { data } = await axios.post('/api/gpt-images/generate-image', {
        prompt: result.gpt_prompt,
        formatId: selectedFormat.id,
        quality,
      });
      updateResult(variantIndex, { status: 'done', imageUrl: data.url, filename: data.filename });
      toast.success('Régénération terminée');
    } catch (err) {
      updateResult(variantIndex, { status: 'error', error: err.response?.data?.error || err.message });
      toast.error('Erreur de régénération');
    }
  };

  // ── Iterate: modify prompt via Claude then regenerate ──
  const handleIterate = async (variantIndex, instruction, customPrompt = null) => {
    const result = results.find(r => r.variant_index === variantIndex);
    if (!result) return;

    let newPrompt = customPrompt || result.gpt_prompt;

    if (instruction) {
      try {
        const { data } = await axios.post('/api/gpt-images/iterate-prompt', {
          currentPrompt: result.gpt_prompt,
          instructions: instruction,
        });
        newPrompt = data.prompt;
        updateResult(variantIndex, { gpt_prompt: newPrompt });
        toast.success('Prompt modifié par Claude');
      } catch (err) {
        return toast.error(err.response?.data?.error || 'Erreur de modification du prompt');
      }
    }

    updateResult(variantIndex, { status: 'running', imageUrl: null, filename: null, error: null, gpt_prompt: newPrompt });
    try {
      const { data } = await axios.post('/api/gpt-images/generate-image', {
        prompt: newPrompt,
        formatId: selectedFormat.id,
        quality,
      });
      updateResult(variantIndex, { status: 'done', imageUrl: data.url, filename: data.filename });
      toast.success('Nouvelle version générée');
    } catch (err) {
      updateResult(variantIndex, { status: 'error', error: err.response?.data?.error || err.message });
      toast.error('Erreur de génération');
    }
  };

  const updateResult = (variantIndex, updates) => {
    setResults(prev => prev.map(r => r.variant_index === variantIndex ? { ...r, ...updates } : r));
  };

  // ── Export single image ──
  const handleExport = (result) => {
    if (!result.imageUrl) return;
    const productName = selectedProduct?.name?.replace(/\s+/g, '_') || 'product';
    const a = document.createElement('a');
    a.href = result.imageUrl;
    a.download = `${productName}_v${result.variant_index}_${result.angle}_GPT.png`;
    a.click();
  };

  // ── Export ZIP ──
  const handleExportZip = async () => {
    const done = results.filter(r => r.status === 'done' && r.filename);
    if (!done.length) return toast.error('Aucune image prête');
    try {
      const productName = selectedProduct?.name?.replace(/\s+/g, '_') || 'product';
      const items = done.map(r => ({
        filename: r.filename,
        name: `${productName}_v${r.variant_index}_${r.angle}_GPT`,
      }));
      const { data } = await axios.post('/api/gpt-images/export-zip', { items }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/zip' }));
      const a = document.createElement('a');
      a.href = url; a.download = `creatives_IA_${Date.now()}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`ZIP téléchargé (${done.length} images)`);
    } catch {
      toast.error('Erreur export ZIP');
    }
  };

  // ── Favorite toggle ──
  const handleFavorite = (variantIndex) => {
    updateResult(variantIndex, { isFavorite: !results.find(r => r.variant_index === variantIndex)?.isFavorite });
  };

  // ── Save to library ──
  const handleSaveLibrary = async (result) => {
    try {
      await axios.post('/api/creatives', {
        name: `${selectedProduct?.name || 'Produit'} — ${result.strategy_name} (IA)`,
        productId: selectedProduct?.id || null,
        personaId: selectedPersona?.id || null,
        templateId: 'gpt_generated',
        formatId: selectedFormat.id,
        paletteId: null,
        fontId: null,
        html: `<img src="${result.imageUrl}" style="width:100%;height:auto" />`,
        framework: result.framework,
        status: 'draft',
        tags: ['ia-generated', 'gpt-image', result.angle, selectedFormat.id].filter(Boolean),
        gptPrompt: result.gpt_prompt,
        imageUrl: result.imageUrl,
      });
      toast.success('Sauvegardé dans la bibliothèque');
    } catch {
      toast.error('Erreur de sauvegarde');
    }
  };

  // ── Derived counts ──
  const doneCount = results.filter(r => r.status === 'done').length;
  const runningCount = results.filter(r => r.status === 'running').length;
  const totalCount = results.length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full">
      {/* ── Left panel ── */}
      <div className="w-[300px] shrink-0 border-r border-zinc-800 bg-[#131316] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Mode Création IA</h2>
              <p className="text-[10px] text-violet-400">Analyse → Claude → GPT Image</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Source preview */}
          {sourceImage && (
            <div>
              <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Source</div>
              <div className="relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700">
                <img src={sourceImage.dataUrl} alt="source" className="w-full h-32 object-cover" />
                <button onClick={() => { setSourceImage(null); setAnalysis(null); setResults([]); setPhase('idle'); }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors">
                  <X size={10} className="text-white" />
                </button>
                {phase === 'analyzed' && (
                  <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-emerald-600/90 rounded-full px-2 py-0.5">
                    <CheckCircle2 size={9} className="text-white" />
                    <span className="text-[8px] font-semibold text-white">Analysé</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product */}
          <div>
            <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
              <Package size={9} className="inline mr-1" />Produit
            </label>
            <select value={selectedProduct?.id || ''} onChange={e => setSelectedProduct(products.find(p => p.id === e.target.value) || null)}
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 appearance-none">
              <option value="">— Sélectionner —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>)}
            </select>
            {!selectedProduct && <p className="text-[10px] text-amber-400/70 mt-1 flex items-center gap-1"><AlertCircle size={9} />Requis pour générer</p>}
          </div>

          {/* Persona */}
          <div>
            <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
              <Users size={9} className="inline mr-1" />Persona
            </label>
            <select value={selectedPersona?.id || ''} onChange={e => setSelectedPersona(personas.find(p => p.id === e.target.value) || null)}
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 appearance-none">
              <option value="">— Sans persona (générique) —</option>
              {personas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Format</label>
            <div className="grid grid-cols-2 gap-1.5">
              {FORMATS_AI.map(f => (
                <button key={f.id} onClick={() => setSelectedFormat(f)}
                  className={`rounded-lg border px-2 py-1.5 text-left transition-all ${selectedFormat.id === f.id ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="text-[10px] font-semibold text-zinc-300">{f.label}</div>
                  <div className="text-[9px] text-zinc-600">{f.sub} · {f.ratio}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Variant count */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider">Variantes</label>
              <span className="text-xs font-bold text-zinc-300">{variantCount}</span>
            </div>
            <input type="range" min={4} max={8} value={variantCount} onChange={e => setVariantCount(parseInt(e.target.value))}
              className="w-full accent-indigo-500" />
            <div className="flex justify-between text-[9px] text-zinc-600 mt-0.5">
              <span>4</span><span>8</span>
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Qualité</label>
            <div className="grid grid-cols-3 gap-1">
              {QUALITY_OPTIONS.map(q => (
                <button key={q.id} onClick={() => setQuality(q.id)}
                  className={`rounded-lg border px-1.5 py-1.5 text-center transition-all ${quality === q.id ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="text-[10px] font-semibold text-zinc-300">{q.label}</div>
                  <div className="text-[8px] text-zinc-600 mt-0.5">{q.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Cost estimate */}
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">Coût estimé</span>
              <span className="text-sm font-bold text-zinc-200">~${costEstimate}</span>
            </div>
            <div className="text-[9px] text-zinc-600 mt-0.5">
              {variantCount} image{variantCount > 1 ? 's' : ''} · qualité {quality} · {selectedFormat.size}px
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2 shrink-0">
          {/* Step 1: Analyze */}
          {(phase === 'idle' || phase === 'analyzing') && sourceImage && (
            <button onClick={handleAnalyze} disabled={phase === 'analyzing'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
              {phase === 'analyzing' ? <><Loader2 size={14} className="animate-spin" /> Analyse en cours…</> : <><Brain size={14} /> Analyser avec Claude</>}
            </button>
          )}

          {/* Step 2: Generate */}
          {(phase === 'analyzed') && (
            <button onClick={handleGenerateAll} disabled={!selectedProduct}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-900/30">
              <Play size={14} /> Générer {variantCount} créatives IA
            </button>
          )}

          {/* Generating */}
          {phase === 'generating' && (
            <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-700/60 text-white text-sm font-semibold rounded-xl">
              <Loader2 size={14} className="animate-spin" /> {doneCount}/{totalCount} images…
            </button>
          )}

          {/* Done */}
          {phase === 'done' && (
            <>
              <button onClick={handleExportZip} disabled={doneCount === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
                <Download size={14} /> Export ZIP ({doneCount} PNG)
              </button>
              <button onClick={() => { setPhase('idle'); setSourceImage(null); setAnalysis(null); setResults([]); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1">
                <FileImage size={12} /> Nouveau batch
              </button>
            </>
          )}

          {/* Change source when idle with no image */}
          {phase === 'idle' && !sourceImage && (
            <div className="text-center text-[10px] text-zinc-600 py-2">
              Dépose une image dans la zone principale pour commencer
            </div>
          )}
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f11]">
        {/* IDLE: Upload zone */}
        {phase === 'idle' && <UploadZone onFile={handleFile} />}

        {/* ANALYZING: Loading overlay over upload */}
        {phase === 'analyzing' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                <Brain size={28} className="text-indigo-400 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-zinc-300 mb-1">Analyse de la créative…</p>
              <p className="text-xs text-zinc-500">Claude Vision examine la structure, les textes et les angles marketing</p>
            </div>
          </div>
        )}

        {/* ANALYZED: Show analysis */}
        {phase === 'analyzed' && analysis && (
          <div className="max-w-3xl mx-auto">
            {/* Source image preview strip */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-900/40">
              <img src={sourceImage?.dataUrl} alt="source" className="w-16 h-16 object-cover rounded-xl border border-zinc-700" />
              <div>
                <div className="text-xs font-bold text-zinc-200 mb-0.5">Créative analysée</div>
                <div className="text-[10px] text-zinc-500">{sourceImage?.filename}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
                    {analysis.format?.type || 'format inconnu'}
                  </span>
                  <span className="text-[9px] bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
                    {analysis.format?.platform || '?'}
                  </span>
                  <span className="text-[9px] text-indigo-400 bg-indigo-900/20 border border-indigo-800/40 rounded-full px-2 py-0.5">
                    {analysis.copy_framework?.name || '?'}
                  </span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ArrowRight size={14} className="text-zinc-600" />
                <div className="text-[10px] text-zinc-500 text-right">
                  Configure à gauche<br/>puis génère
                </div>
              </div>
            </div>
            <AnalysisPanel analysis={analysis} onChange={setAnalysis} sourceImage={sourceImage} />
          </div>
        )}

        {/* GENERATING / DONE: Results grid */}
        {(phase === 'generating' || phase === 'done') && results.length > 0 && (
          <div className="p-6">
            {/* Progress header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-zinc-200">
                  {phase === 'generating' ? 'Génération en cours…' : 'Créatives générées'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {doneCount}/{totalCount} images
                  {runningCount > 0 && <span className="text-indigo-400 ml-2">· génération en cours</span>}
                </p>
              </div>
              {phase === 'done' && doneCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">{results.filter(r => r.isFavorite).length} favori{results.filter(r => r.isFavorite).length > 1 ? 's' : ''}</span>
                  <button onClick={handleExportZip}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-semibold rounded-lg transition-colors">
                    <Download size={12} /> ZIP
                  </button>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {phase === 'generating' && (
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (doneCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            )}

            {/* Cards grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {results.map(result => (
                <ResultCard
                  key={result.variant_index}
                  result={result}
                  formatId={selectedFormat.id}
                  onRegenerate={handleRegenerate}
                  onIterate={handleIterate}
                  onExport={handleExport}
                  onFavorite={handleFavorite}
                  onSaveLibrary={handleSaveLibrary}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
