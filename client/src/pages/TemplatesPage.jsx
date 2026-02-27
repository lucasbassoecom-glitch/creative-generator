import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ScanSearch, Upload, Loader2, X, Check, Plus, Save,
  Trash2, Edit3, Tag, Link, Star, ChevronDown, ChevronUp,
  Palette, Type, Layout, Zap, Shield, MousePointer, Eye,
  Image as ImageIcon, BarChart2
} from 'lucide-react';

// ─── Color swatch ─────────────────────────────────────────────────────────────
function ColorSwatch({ color, size = 'sm' }) {
  const [copied, setCopied] = useState(false);
  const s = size === 'sm' ? 'w-5 h-5' : 'w-7 h-7';
  const copy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button onClick={copy} title={copied ? 'Copié !' : color}
      className={`${s} rounded border border-zinc-700 transition-transform hover:scale-110 shrink-0 relative`}
      style={{ backgroundColor: color }}
    >
      {copied && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
          <Check size={10} className="text-white" />
        </div>
      )}
    </button>
  );
}

// ─── Upload panel ─────────────────────────────────────────────────────────────
function UploadPanel({ onAnalyzed }) {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [tab, setTab] = useState('file'); // file | url
  const [preview, setPreview] = useState(null);
  const [pendingBase64, setPendingBase64] = useState(null);
  const [pendingType, setPendingType] = useState(null);
  const inputRef = useRef(null);

  const readFile = (file) => {
    if (!file?.type.startsWith('image/')) return toast.error('Image requise (JPG, PNG, WEBP)');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      // Extract base64 part
      const b64 = dataUrl.split(',')[1];
      setPendingBase64(b64);
      setPendingType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    readFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    setLoading(true);
    try {
      let payload;
      if (tab === 'file' && pendingBase64) {
        payload = { imageBase64: pendingBase64, mediaType: pendingType };
      } else if (tab === 'url' && url.trim()) {
        payload = { imageUrl: url.trim() };
      } else {
        toast.error('Charge une image ou colle une URL');
        setLoading(false);
        return;
      }
      const { data } = await axios.post('/api/claude/analyze', payload);
      onAnalyzed(data.analysis, preview || url);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-full bg-indigo-900/40 border border-indigo-700/50 flex items-center justify-center">
          <Loader2 size={24} className="text-indigo-400 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-300">Claude Vision analyse la créative...</p>
          <p className="text-xs text-zinc-500 mt-1">Layout · Couleurs · Typographie · Hook · CTA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-zinc-800/60 rounded-lg">
        {[{ id: 'file', label: 'Upload image', icon: Upload }, { id: 'url', label: 'URL image', icon: Link }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <t.icon size={12} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'file' ? (
        preview ? (
          <div className="relative">
            <img src={preview} alt="preview" className="w-full max-h-72 object-contain bg-zinc-800/60 rounded-xl border border-zinc-700" />
            <button onClick={() => { setPreview(null); setPendingBase64(null); }}
              className="absolute top-2 right-2 w-7 h-7 bg-zinc-900/80 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors">
              <X size={13} className="text-zinc-400" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/20'}`}
          >
            <Upload size={22} className="text-zinc-500" />
            <p className="text-sm text-zinc-400">Glisse la créative concurrente ici</p>
            <p className="text-xs text-zinc-600">JPG, PNG, WEBP — max 10MB</p>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => readFile(e.target.files[0])} />
          </div>
        )
      ) : (
        <div>
          <label className="text-[10px] text-zinc-500 block mb-1.5">URL de l'image</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500" />
        </div>
      )}

      <button
        onClick={analyze}
        disabled={tab === 'file' ? !pendingBase64 : !url.trim()}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ScanSearch size={15} />
        Analyser avec Claude Vision
      </button>
    </div>
  );
}

// ─── Analysis display (editable) ─────────────────────────────────────────────
function AnalysisDisplay({ analysis, onChange }) {
  const [open, setOpen] = useState({ layout: true, colors: true, typography: true, hook: true, cta: true, elements: false, persuasion: false, verdict: false });

  const update = (path, value) => {
    const parts = path.split('.');
    const next = JSON.parse(JSON.stringify(analysis));
    let obj = next;
    for (let i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] = obj[parts[i]] || {}; }
    obj[parts[parts.length - 1]] = value;
    onChange(next);
  };

  const Section = ({ k, label, icon: Icon, color = 'text-zinc-400', children }) => (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(p => ({ ...p, [k]: !p[k] }))}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/60 hover:bg-zinc-800/40 transition-colors">
        <div className="flex items-center gap-2">
          <Icon size={14} className={color} />
          <span className="text-xs font-semibold text-zinc-300">{label}</span>
        </div>
        {open[k] ? <ChevronUp size={13} className="text-zinc-600" /> : <ChevronDown size={13} className="text-zinc-600" />}
      </button>
      {open[k] && <div className="px-4 py-3 space-y-3 bg-zinc-900/20">{children}</div>}
    </div>
  );

  const Field = ({ label, value, path, multiline = false }) => (
    <div>
      <label className="text-[10px] text-zinc-600 block mb-0.5">{label}</label>
      {multiline ? (
        <textarea value={value || ''} onChange={e => update(path, e.target.value)}
          className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none resize-none transition-colors" rows={2} />
      ) : (
        <input value={value || ''} onChange={e => update(path, e.target.value)}
          className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none transition-colors" />
      )}
    </div>
  );

  return (
    <div className="space-y-3">

      {/* Layout */}
      <Section k="layout" label="Layout & Composition" icon={Layout} color="text-purple-400">
        <Field label="Composition" value={analysis.layout?.composition} path="layout.composition" multiline />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Ratio texte/image" value={analysis.layout?.text_ratio} path="layout.text_ratio" />
          <Field label="Orientation" value={analysis.layout?.orientation} path="layout.orientation" />
        </div>
        <Field label="Zones" value={analysis.layout?.breathing_space} path="layout.breathing_space" multiline />
        {analysis.layout?.zones?.length > 0 && (
          <div>
            <label className="text-[10px] text-zinc-600 block mb-1">Zones de contenu</label>
            <div className="space-y-1">
              {analysis.layout.zones.map((z, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-600 shrink-0">{i + 1}.</span>
                  <input value={z} onChange={e => { const n = [...analysis.layout.zones]; n[i] = e.target.value; update('layout.zones', n); }}
                    className="flex-1 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Colors */}
      <Section k="colors" label="Palette de couleurs" icon={Palette} color="text-pink-400">
        {[
          { key: 'dominant', label: 'Couleurs dominantes' },
          { key: 'secondary', label: 'Couleurs secondaires' },
          { key: 'accent', label: 'Couleurs d\'accent' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="text-[10px] text-zinc-600 block mb-1.5">{label}</label>
            <div className="flex flex-wrap gap-1.5 items-center">
              {(analysis.colors?.[key] || []).map((c, i) => (
                <div key={i} className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-700 rounded-lg px-2 py-1">
                  <ColorSwatch color={c} />
                  <input value={c} onChange={e => {
                    const n = [...(analysis.colors[key] || [])]; n[i] = e.target.value;
                    update(`colors.${key}`, n);
                  }} className="w-16 bg-transparent text-[10px] text-zinc-400 font-mono focus:outline-none focus:text-zinc-200" />
                </div>
              ))}
              <button onClick={() => update(`colors.${key}`, [...(analysis.colors?.[key] || []), '#000000'])}
                className="w-7 h-7 rounded-lg border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:border-zinc-600 transition-colors">
                <Plus size={11} />
              </button>
            </div>
          </div>
        ))}
        <Field label="Background" value={analysis.background?.description} path="background.description" multiline />
      </Section>

      {/* Typography */}
      <Section k="typography" label="Hiérarchie typographique" icon={Type} color="text-blue-400">
        {(analysis.typography || []).map((typo, i) => (
          <div key={i} className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                typo.type === 'headline' ? 'bg-indigo-900/50 text-indigo-400' :
                typo.type === 'cta' ? 'bg-orange-900/50 text-orange-400' :
                'bg-zinc-800 text-zinc-500'
              }`}>{typo.type?.toUpperCase()}</span>
              <div className="flex items-center gap-2">
                {typo.color && <ColorSwatch color={typo.color} />}
                <span className="text-[10px] text-zinc-600">{typo.size_relative} · {typo.weight}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <input value={typo.content || ''} onChange={e => { const n = [...analysis.typography]; n[i] = { ...n[i], content: e.target.value }; update('typography', n); }}
                placeholder="Contenu du texte"
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-indigo-500 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none" />
              <div className="grid grid-cols-3 gap-1">
                {[
                  { k: 'size_relative', ph: 'XL/L/M/S/XS' },
                  { k: 'weight', ph: '400/700/800' },
                  { k: 'color', ph: '#hex' },
                ].map(({ k, ph }) => (
                  <input key={k} value={typo[k] || ''} onChange={e => { const n = [...analysis.typography]; n[i] = { ...n[i], [k]: e.target.value }; update('typography', n); }}
                    placeholder={ph} className="bg-zinc-800 border border-zinc-700 focus:border-indigo-500 rounded px-2 py-1 text-[10px] text-zinc-400 focus:outline-none font-mono" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </Section>

      {/* Hook */}
      <Section k="hook" label="Hook & Mécanisme d'attention" icon={Zap} color="text-yellow-400">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {['chiffre', 'question', 'douleur', 'avant_apres', 'preuve_sociale', 'urgence', 'autorite', 'curiosite', 'promesse'].map(m => (
            <button key={m} onClick={() => update('hook.mechanism', m)}
              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-all ${analysis.hook?.mechanism === m ? 'border-yellow-500/60 bg-yellow-900/30 text-yellow-400' : 'border-zinc-700 text-zinc-600 hover:border-zinc-600'}`}>
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
        <Field label="Formulation du hook" value={analysis.hook?.text} path="hook.text" multiline />
        <Field label="Pourquoi c'est efficace" value={analysis.hook?.effectiveness} path="hook.effectiveness" multiline />
      </Section>

      {/* CTA */}
      <Section k="cta" label="Call to Action" icon={MousePointer} color="text-orange-400">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Texte du CTA" value={analysis.cta?.text} path="cta.text" />
          <Field label="Forme" value={analysis.cta?.shape} path="cta.shape" />
        </div>
        <div className="flex items-center gap-3">
          {analysis.cta?.color && (
            <div className="flex items-center gap-1.5">
              <ColorSwatch color={analysis.cta.color} size="md" />
              <span className="text-[10px] text-zinc-500 font-mono">Fond</span>
            </div>
          )}
          {analysis.cta?.text_color && (
            <div className="flex items-center gap-1.5">
              <ColorSwatch color={analysis.cta.text_color} size="md" />
              <span className="text-[10px] text-zinc-500 font-mono">Texte</span>
            </div>
          )}
        </div>
        <Field label="Position" value={analysis.cta?.position} path="cta.position" />
      </Section>

      {/* Elements */}
      <Section k="elements" label="Éléments graphiques" icon={ImageIcon} color="text-emerald-400">
        <div className="space-y-2">
          {(analysis.graphic_elements || []).map((el, i) => (
            <div key={i} className="flex items-center gap-2 bg-zinc-800/30 rounded-lg px-3 py-2">
              <span className="text-[10px] font-medium text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">{el.type}</span>
              <span className="text-xs text-zinc-400 flex-1">{el.description}</span>
              <span className="text-[10px] text-zinc-600 shrink-0">{el.position}</span>
            </div>
          ))}
          {(analysis.persuasion_elements || []).map((el, i) => (
            <div key={i} className="flex items-center gap-2 bg-zinc-800/30 rounded-lg px-3 py-2">
              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-900/30 px-1.5 py-0.5 rounded shrink-0">{typeof el === 'string' ? el : el.type}</span>
              {typeof el === 'object' && <span className="text-xs text-zinc-400">{el.description}</span>}
            </div>
          ))}
        </div>
      </Section>

      {/* Verdict */}
      <Section k="verdict" label="Verdict & Points clés" icon={BarChart2} color="text-cyan-400">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <label className="text-[10px] text-zinc-600 block mb-1">Score global</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400" style={{ width: `${(analysis.overall_score || 0) * 10}%` }} />
              </div>
              <span className="text-sm font-bold text-zinc-200">{analysis.overall_score || '?'}/10</span>
            </div>
          </div>
        </div>
        <Field label="Format détecté" value={analysis.format?.estimated_dimensions ? `${analysis.format.estimated_dimensions} · ${analysis.format.type} · ${analysis.format.platform}` : ''} path="format.estimated_dimensions" />
        {/* Copy framework */}
        {analysis.copy_framework && (
          <div className="mb-3">
            <label className="text-[10px] text-zinc-600 block mb-1.5">Framework copywriting détecté</label>
            <div className="flex items-center gap-2 bg-indigo-900/20 border border-indigo-500/25 rounded-lg px-3 py-2">
              <span className="text-sm font-black text-indigo-400 shrink-0">{analysis.copy_framework.name}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-indigo-300">{analysis.copy_framework.full_name}</div>
                {analysis.copy_framework.explanation && (
                  <div className="text-[10px] text-zinc-500 mt-0.5 italic leading-snug">{analysis.copy_framework.explanation}</div>
                )}
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                analysis.copy_framework.confidence === 'high' ? 'bg-emerald-900/40 text-emerald-400' :
                analysis.copy_framework.confidence === 'medium' ? 'bg-amber-900/40 text-amber-400' :
                'bg-zinc-800 text-zinc-500'
              }`}>{analysis.copy_framework.confidence || 'low'}</span>
            </div>
          </div>
        )}
        <Field label="Angle copywriting" value={analysis.copywriting_angle} path="copywriting_angle" multiline />
        <Field label="Cible visée (déduite)" value={analysis.target_audience_guess} path="target_audience_guess" multiline />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-emerald-500 font-semibold block mb-1">Points forts</label>
            {(analysis.strengths || []).map((s, i) => (
              <div key={i} className="flex items-start gap-1 mb-1">
                <Check size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-[10px] text-zinc-400">{s}</span>
              </div>
            ))}
          </div>
          <div>
            <label className="text-[10px] text-red-400 font-semibold block mb-1">À améliorer</label>
            {(analysis.weaknesses || []).map((w, i) => (
              <div key={i} className="flex items-start gap-1 mb-1">
                <X size={10} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-[10px] text-zinc-400">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

    </div>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ template, onSelect, onDelete, isSelected }) {
  const analysis = template.analysis || {};
  const hookColor = analysis.hook?.mechanism ? 'bg-yellow-900/30 text-yellow-400' : 'bg-zinc-800 text-zinc-500';

  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all cursor-pointer ${isSelected ? 'border-indigo-500/60 ring-1 ring-indigo-500/10' : 'border-zinc-800 hover:border-zinc-600'}`}
      onClick={() => onSelect(template)}>
      {/* Thumbnail */}
      <div className="h-28 bg-zinc-800 flex items-center justify-center overflow-hidden relative">
        {template.imageUrl ? (
          <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
        ) : (
          <ScanSearch size={28} className="text-zinc-600" />
        )}
        {analysis.overall_score && (
          <div className="absolute top-2 right-2 w-7 h-7 bg-zinc-900/80 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-zinc-200">{analysis.overall_score}</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="text-xs font-semibold text-zinc-300 truncate">{template.name}</div>
          <button onClick={e => { e.stopPropagation(); onDelete(template.id); }}
            className="p-1 text-zinc-700 hover:text-red-400 transition-colors shrink-0">
            <Trash2 size={11} />
          </button>
        </div>

        {/* Framework + hook badges */}
        <div className="flex flex-wrap gap-1 mb-1">
          {analysis.copy_framework?.name && analysis.copy_framework.name !== 'Autre' && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-900/40 text-indigo-400">
              {analysis.copy_framework.name}
            </span>
          )}
          {analysis.hook?.mechanism && (
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${hookColor}`}>
              {analysis.hook.mechanism.replace('_', ' ')}
            </span>
          )}
          {analysis.format?.type && (
            <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">
              {analysis.format.type}
            </span>
          )}
        </div>

        {/* Colors preview */}
        {analysis.colors?.dominant?.length > 0 && (
          <div className="flex gap-1 mt-2">
            {[...( analysis.colors.dominant || []), ...(analysis.colors.secondary || [])].slice(0, 5).map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-zinc-700" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}

        {/* Tags */}
        {template.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.map(t => (
              <span key={t} className="text-[9px] text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Save dialog ──────────────────────────────────────────────────────────────
function SaveDialog({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-6 w-80 shadow-2xl">
        <h3 className="text-sm font-bold text-zinc-100 mb-4">Sauvegarder le template</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Nom du template *</label>
            <input value={name} onChange={e => setName(e.target.value)} autoFocus
              placeholder="Ex: Concurrent A — Story énergie"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
              onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim(), tags.split(',').map(t => t.trim()).filter(Boolean))}
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Tags (séparés par virgule)</label>
            <input value={tags} onChange={e => setTags(e.target.value)}
              placeholder="story, urgence, social proof..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 border border-zinc-700 rounded-lg text-xs text-zinc-400 hover:text-zinc-200">Annuler</button>
          <button onClick={() => { if (name.trim()) onSave(name.trim(), tags.split(',').map(t => t.trim()).filter(Boolean)); }}
            disabled={!name.trim()}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors">
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('library'); // library | analyze
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/templates');
      setTemplates(data);
    } catch {
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleAnalyzed = (analysis, imageUrl) => {
    setCurrentAnalysis(analysis);
    setCurrentImage(imageUrl);
    setView('analysis');
  };

  const handleSave = async (name, tags) => {
    try {
      await axios.post('/api/templates', {
        name,
        tags,
        analysis: currentAnalysis,
        imageUrl: currentImage?.startsWith('data:') ? null : currentImage,
        format: currentAnalysis?.format?.type,
        hookType: currentAnalysis?.hook?.mechanism,
      });
      await fetchTemplates();
      setShowSaveDialog(false);
      toast.success('Template sauvegardé !');
      setView('library');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce template ?')) return;
    try {
      await axios.delete(`/api/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
      toast.success('Template supprimé');
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setCurrentAnalysis(template.analysis);
    setCurrentImage(template.imageUrl);
    setView('analysis');
  };

  return (
    <div className="flex h-full">
      {/* Left panel: library or upload */}
      <div className={`${view === 'analysis' ? 'w-72 shrink-0 border-r border-zinc-800' : 'flex-1'} overflow-y-auto`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <ScanSearch size={16} className="text-purple-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100">Templates</h1>
                <p className="text-xs text-zinc-500">{templates.length} template{templates.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { setCurrentAnalysis(null); setCurrentImage(null); setView(view === 'analyze' ? 'library' : 'analyze'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${view === 'analyze' ? 'bg-zinc-700 text-zinc-200' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
            >
              <Plus size={13} />
              Analyser
            </button>
          </div>

          {/* Upload mode */}
          {view === 'analyze' && (
            <UploadPanel onAnalyzed={handleAnalyzed} />
          )}

          {/* Library */}
          {(view === 'library' || view === 'analysis') && (
            <>
              {loading && <div className="flex items-center justify-center py-8"><Loader2 size={20} className="text-zinc-600 animate-spin" /></div>}
              {!loading && templates.length === 0 && (
                <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl">
                  <ScanSearch size={24} className="text-zinc-600 mx-auto mb-3" />
                  <p className="text-xs text-zinc-500">Aucun template sauvegardé</p>
                  <p className="text-[10px] text-zinc-700 mt-1">Analyse une créative pour commencer</p>
                </div>
              )}
              {!loading && templates.length > 0 && (
                <div className={view === 'analysis' ? 'space-y-3' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'}>
                  {templates.map(t => (
                    <TemplateCard key={t.id} template={t} isSelected={selectedTemplate?.id === t.id} onSelect={handleSelectTemplate} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right panel: analysis display */}
      {view === 'analysis' && currentAnalysis && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-3xl">
            {/* Analysis header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                {currentImage && !currentImage.startsWith('data:') && (
                  <img src={currentImage} alt="" className="w-12 h-12 object-cover rounded-lg border border-zinc-700" />
                )}
                <div>
                  <h2 className="text-base font-bold text-zinc-100">
                    {selectedTemplate?.name || 'Analyse en cours'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {currentAnalysis.format?.estimated_dimensions} · {currentAnalysis.format?.platform}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setView('analyze')} className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-lg transition-colors">
                  <Upload size={12} /> Nouvelle analyse
                </button>
                {!selectedTemplate && (
                  <button onClick={() => setShowSaveDialog(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors">
                    <Save size={12} /> Sauvegarder template
                  </button>
                )}
              </div>
            </div>

            {/* Current image preview */}
            {currentImage && currentImage.startsWith('data:') && (
              <div className="mb-5">
                <img src={currentImage} alt="Créative analysée" className="max-h-64 object-contain bg-zinc-800/50 rounded-xl border border-zinc-700 mx-auto block" />
              </div>
            )}

            <AnalysisDisplay analysis={currentAnalysis} onChange={setCurrentAnalysis} />
          </div>
        </div>
      )}

      {showSaveDialog && <SaveDialog onSave={handleSave} onClose={() => setShowSaveDialog(false)} />}
    </div>
  );
}
