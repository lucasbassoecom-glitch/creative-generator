import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Users, Plus, Upload, FileText, Trash2, Edit3,
  Brain, X, Check, Loader2,
  ChevronDown, ChevronUp, Clipboard, Eye
} from 'lucide-react';
import { usePersona } from '../context/PersonaContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const AWARENESS_LEVELS = [
  { id: 'unaware', label: 'Unaware', color: 'text-zinc-400', bg: 'bg-zinc-800', dot: 'bg-zinc-500', desc: 'Ne sait pas qu\'il a un problème' },
  { id: 'problem_aware', label: 'Problem Aware', color: 'text-yellow-400', bg: 'bg-yellow-900/30', dot: 'bg-yellow-500', desc: 'Conscient du problème, pas de solution' },
  { id: 'solution_aware', label: 'Solution Aware', color: 'text-blue-400', bg: 'bg-blue-900/30', dot: 'bg-blue-500', desc: 'Cherche une solution, ne connaît pas le produit' },
  { id: 'product_aware', label: 'Product Aware', color: 'text-indigo-400', bg: 'bg-indigo-900/30', dot: 'bg-indigo-500', desc: 'Connaît le produit, hésite encore' },
  { id: 'most_aware', label: 'Most Aware', color: 'text-emerald-400', bg: 'bg-emerald-900/30', dot: 'bg-emerald-500', desc: 'Prêt à acheter, cherche la meilleure offre' },
];

const INTENSITY_COLORS = ['', 'bg-zinc-600', 'bg-yellow-600', 'bg-orange-500', 'bg-red-500', 'bg-red-700'];

function AwarenessLabel({ level }) {
  const found = AWARENESS_LEVELS.find(a => a.id === level);
  if (!found) return null;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${found.bg} ${found.color}`}>
      {found.label}
    </span>
  );
}

function IntensityDots({ value }) {
  return (
    <div className="flex gap-0.5 items-center shrink-0">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i <= value ? INTENSITY_COLORS[value] : 'bg-zinc-700'}`} />
      ))}
    </div>
  );
}

// ─── Upload / Paste panel ─────────────────────────────────────────────────────
function UploadPanel({ onParsed }) {
  const [text, setText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleParse = async () => {
    if (!text.trim()) return toast.error('Colle ou charge un document d\'abord');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/claude/parse-persona', { text });
      onParsed(data.persona);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du parsing Claude');
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
          <p className="text-sm font-semibold text-zinc-300">Claude analyse le document...</p>
          <p className="text-xs text-zinc-500 mt-1">Extraction des pain points, verbatims, objections</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 hover:border-zinc-600'
        }`}
      >
        <Upload size={22} className="text-zinc-500 mx-auto mb-2" />
        <p className="text-sm text-zinc-400">Glisse un fichier <span className="text-zinc-300 font-medium">.txt .md</span></p>
        <label className="mt-2 inline-block cursor-pointer">
          <span className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">ou choisir un fichier</span>
          <input type="file" accept=".txt,.md" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </label>
      </div>

      {/* Separator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-zinc-800" />
        <span className="text-xs text-zinc-600">ou colle le texte</span>
        <div className="flex-1 border-t border-zinc-800" />
      </div>

      {/* Text area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Colle ici le contenu de ton document persona — étude Reddit, persona Notion, brief marketing, verbatims clients..."
          className="w-full h-44 bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-zinc-600">{text.length} caractères</span>
          <button
            onClick={async () => { try { setText(await navigator.clipboard.readText()); } catch {} }}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
          >
            <Clipboard size={10} /> Coller depuis le presse-papiers
          </button>
        </div>
      </div>

      <button
        onClick={handleParse}
        disabled={!text.trim()}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Brain size={15} />
        Analyser avec Claude
      </button>
    </div>
  );
}

// ─── Persona editor ───────────────────────────────────────────────────────────
function PersonaEditor({ persona, onSave, onCancel, isNew }) {
  const [data, setData] = useState(persona);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState({ pain_points: true, verbatims: true, objections: false, motivations: false, tone: false });

  const update = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) { obj = obj[parts[i]] = obj[parts[i]] || {}; }
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    if (!data.name?.trim()) return toast.error('Le nom du persona est requis');
    setSaving(true);
    try { await onSave(data); } finally { setSaving(false); }
  };

  const Section = ({ k, label, count, children }) => (
    <div className="border-t border-zinc-800 pt-4">
      <button onClick={() => setOpen(p => ({ ...p, [k]: !p[k] }))} className="w-full flex items-center justify-between py-1 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
          {count !== undefined && <span className="text-[9px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">{count}</span>}
        </div>
        {open[k] ? <ChevronUp size={13} className="text-zinc-600" /> : <ChevronDown size={13} className="text-zinc-600" />}
      </button>
      {open[k] && children}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
        <div>
          <div className="text-sm font-bold text-zinc-100">{isNew ? 'Nouveau persona' : 'Éditer le persona'}</div>
          <div className="text-xs text-zinc-500">Cliquez sur un champ pour l'éditer</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200">Annuler</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Name */}
        <div>
          <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">Nom du persona *</label>
          <input value={data.name || ''} onChange={e => update('name', e.target.value)} placeholder="Ex: Sophie, 34 ans" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500" />
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="bg-indigo-900/10 border border-indigo-900/40 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-2">Résumé Claude</div>
            <p className="text-xs text-zinc-400 leading-relaxed italic">"{data.summary}"</p>
          </div>
        )}

        {/* Demographics */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Démographie</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { k: 'demographics.age', label: 'Âge', ph: '28-40 ans' },
              { k: 'demographics.gender', label: 'Genre', ph: 'Femme / Homme' },
              { k: 'demographics.situation', label: 'Situation', ph: 'Active, mère de famille...' },
              { k: 'demographics.location', label: 'Localisation', ph: 'Paris...' },
              { k: 'demographics.income', label: 'Revenus', ph: 'Revenus moyens-supérieurs' },
            ].map(({ k, label, ph }) => {
              const val = k.split('.').reduce((o, key) => o?.[key], data) || '';
              return (
                <div key={k}>
                  <label className="text-[10px] text-zinc-600 block mb-0.5">{label}</label>
                  <input value={val} onChange={e => update(k, e.target.value)} placeholder={ph} className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Awareness */}
        <div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Niveau de conscience</div>
          <div className="space-y-1.5">
            {AWARENESS_LEVELS.map(level => (
              <button key={level.id} onClick={() => update('awareness_level', level.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${data.awareness_level === level.id ? `border-indigo-500/60 ${level.bg}` : 'border-zinc-800 hover:border-zinc-700'}`}>
                <div className={`w-2 h-2 rounded-full shrink-0 ${data.awareness_level === level.id ? level.dot : 'bg-zinc-700'}`} />
                <span className={`text-xs font-semibold ${data.awareness_level === level.id ? level.color : 'text-zinc-500'}`}>{level.label}</span>
                <span className="text-[10px] text-zinc-600 truncate">{level.desc}</span>
                {data.awareness_level === level.id && <Check size={11} className="text-indigo-400 shrink-0 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Pain points */}
        <Section k="pain_points" label="Pain points" count={data.pain_points?.length}>
          <div className="space-y-2">
            {(data.pain_points || []).map((pp, i) => (
              <div key={i} className="flex items-start gap-2 group">
                <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                  <IntensityDots value={pp.intensity} />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => { const n=[...data.pain_points]; n[i]={...n[i],intensity:v}; update('pain_points',n); }}
                        className={`w-2 h-2 rounded-full transition-colors ${v<=pp.intensity?'bg-red-500':'bg-zinc-700 hover:bg-zinc-500'}`} />
                    ))}
                  </div>
                </div>
                <textarea value={pp.text} onChange={e => { const n=[...data.pain_points]; n[i]={...n[i],text:e.target.value}; update('pain_points',n); }}
                  className="flex-1 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none resize-none transition-colors" rows={2} />
                <button onClick={() => update('pain_points', data.pain_points.filter((_,j)=>j!==i))} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all shrink-0 mt-1">
                  <X size={12} />
                </button>
              </div>
            ))}
            <button onClick={() => update('pain_points', [...(data.pain_points||[]),{text:'',intensity:3}])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <Plus size={12} /> Ajouter un pain point
            </button>
          </div>
        </Section>

        {/* Verbatims */}
        <Section k="verbatims" label="Verbatims" count={data.verbatims?.length}>
          <div className="space-y-2">
            {(data.verbatims || []).map((v, i) => (
              <div key={i} className="flex items-start gap-1.5 group">
                <span className="text-zinc-600 text-base pt-1 shrink-0">"</span>
                <textarea value={v.replace(/^["«]|["»]$/g,'')} onChange={e => { const n=[...data.verbatims]; n[i]=`"${e.target.value}"`; update('verbatims',n); }}
                  className="flex-1 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 italic focus:outline-none resize-none transition-colors" rows={2} />
                <span className="text-zinc-600 text-base pt-1 shrink-0">"</span>
                <button onClick={() => update('verbatims', data.verbatims.filter((_,j)=>j!==i))} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-all shrink-0 mt-1">
                  <X size={12} />
                </button>
              </div>
            ))}
            <button onClick={() => update('verbatims', [...(data.verbatims||[]),'""'])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <Plus size={12} /> Ajouter un verbatim
            </button>
          </div>
        </Section>

        {/* Objections */}
        <Section k="objections" label="Objections & réponses" count={data.objections?.length}>
          <div className="space-y-3">
            {(data.objections || []).map((obj, i) => (
              <div key={i} className="bg-zinc-800/30 border border-zinc-800 rounded-lg p-3 group">
                <div className="flex justify-between mb-1.5">
                  <label className="text-[10px] text-red-400 font-semibold">OBJECTION</label>
                  <button onClick={() => update('objections', data.objections.filter((_,j)=>j!==i))} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400"><X size={11}/></button>
                </div>
                <input value={obj.objection} onChange={e=>{const n=[...data.objections];n[i]={...n[i],objection:e.target.value};update('objections',n);}} className="w-full bg-zinc-800 border border-zinc-700 focus:border-indigo-500 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none mb-2" />
                <label className="text-[10px] text-emerald-400 font-semibold block mb-1">RÉPONSE MARKETING</label>
                <textarea value={obj.response} onChange={e=>{const n=[...data.objections];n[i]={...n[i],response:e.target.value};update('objections',n);}} className="w-full bg-zinc-800 border border-zinc-700 focus:border-indigo-500 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none resize-none" rows={2}/>
              </div>
            ))}
            <button onClick={() => update('objections',[...(data.objections||[]),{objection:'',response:''}])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <Plus size={12}/> Ajouter une objection
            </button>
          </div>
        </Section>

        {/* Motivations & Triggers */}
        <Section k="motivations" label="Motivations & déclencheurs" count={(data.motivations?.length||0)+(data.triggers?.length||0)}>
          <div className="space-y-4">
            {[
              { key: 'motivations', label: 'Motivations d\'achat', color: 'bg-emerald-500' },
              { key: 'triggers', label: 'Déclencheurs d\'achat', color: 'bg-orange-500' },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <label className="text-[10px] text-zinc-500 block mb-2">{label}</label>
                {(data[key] || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5 group">
                    <div className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
                    <input value={item} onChange={e=>{const n=[...data[key]];n[i]=e.target.value;update(key,n);}} className="flex-1 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none transition-colors" />
                    <button onClick={()=>update(key,data[key].filter((_,j)=>j!==i))} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"><X size={11}/></button>
                  </div>
                ))}
                <button onClick={()=>update(key,[...(data[key]||[]),''])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                  <Plus size={12}/> Ajouter
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Tone */}
        <Section k="tone" label="Ton de communication">
          <div className="space-y-3">
            <textarea value={data.tone||''} onChange={e=>update('tone',e.target.value)} placeholder="Ex: Émotionnel et bienveillant, pas trop scientifique..." className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none resize-none transition-colors" rows={2}/>
          </div>
        </Section>

      </div>
    </div>
  );
}

// ─── Persona card ─────────────────────────────────────────────────────────────
function PersonaCard({ persona, onEdit, onDelete, isActive, onToggle }) {
  return (
    <div className={`bg-zinc-900 border rounded-xl p-4 transition-all ${isActive ? 'border-indigo-500/60 ring-1 ring-indigo-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
            <Users size={15} className={isActive ? 'text-white' : 'text-zinc-400'} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-200 truncate">{persona.name}</div>
            <div className="text-[10px] text-zinc-500 truncate">
              {[persona.demographics?.age, persona.demographics?.situation].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onToggle(persona)} title={isActive ? 'Désactiver' : 'Activer pour le générateur'}
            className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300'}`}>
            {isActive ? <Check size={13}/> : <Eye size={13}/>}
          </button>
          <button onClick={() => onEdit(persona)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-all"><Edit3 size={13}/></button>
          <button onClick={() => onDelete(persona.id)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-all"><Trash2 size={13}/></button>
        </div>
      </div>

      <div className="mb-3"><AwarenessLabel level={persona.awareness_level} /></div>

      {persona.pain_points?.slice(0,3).map((pp, i) => (
        <div key={i} className="flex items-center gap-2 mb-1.5">
          <IntensityDots value={pp.intensity} />
          <span className="text-[11px] text-zinc-400 truncate">{pp.text}</span>
        </div>
      ))}

      <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-800">
        <span className="text-[10px] text-zinc-600">{persona.pain_points?.length||0} pain points</span>
        <span className="text-[10px] text-zinc-600">{persona.verbatims?.length||0} verbatims</span>
        <span className="text-[10px] text-zinc-600">{persona.objections?.length||0} objections</span>
      </div>
    </div>
  );
}

const EMPTY_PERSONA = {
  name: '', summary: '',
  demographics: { age: '', gender: '', situation: '', location: '', income: '' },
  pain_points: [{ text: '', intensity: 3 }],
  verbatims: ['""'],
  objections: [{ objection: '', response: '' }],
  motivations: [''], triggers: [''],
  awareness_level: 'problem_aware',
  tone: '', tone_examples: [],
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PersonasPage() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(null); // null | 'upload' | 'editor'
  const [editingPersona, setEditingPersona] = useState(null);
  const { isActive, togglePersona } = usePersona();

  const fetchPersonas = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/personas');
      setPersonas(data);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPersonas(); }, [fetchPersonas]);

  const handleParsed = (parsedData) => {
    setEditingPersona({ ...EMPTY_PERSONA, ...parsedData });
    setPanel('editor');
  };

  const handleNew = () => {
    setEditingPersona({ ...EMPTY_PERSONA });
    setPanel('upload');
  };

  const handleEdit = (persona) => {
    setEditingPersona(persona);
    setPanel('editor');
  };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await axios.put(`/api/personas/${data.id}`, data);
        toast.success('Persona mis à jour');
      } else {
        await axios.post('/api/personas', data);
        toast.success('Persona créé !');
      }
      await fetchPersonas();
      setPanel(null);
      setEditingPersona(null);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
      throw new Error('save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce persona ?')) return;
    try {
      await axios.delete(`/api/personas/${id}`);
      setPersonas(prev => prev.filter(p => p.id !== id));
      toast.success('Persona supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const closePanel = () => { setPanel(null); setEditingPersona(null); };

  return (
    <div className="flex h-full">
      {/* Main list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Users size={17} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">Personas</h1>
                <p className="text-sm text-zinc-500">
                  {personas.length} persona{personas.length > 1 ? 's' : ''} enregistré{personas.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
              <Plus size={15}/> Nouveau persona
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-zinc-600 animate-spin" />
            </div>
          )}

          {!loading && personas.length === 0 && (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-zinc-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">Aucun persona pour l'instant</h3>
              <p className="text-xs text-zinc-600 mb-5">
                Crée ton premier persona en uploadant un document<br />Claude extraira les pain points, verbatims et objections.
              </p>
              <button onClick={handleNew} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
                <Plus size={15}/> Créer un persona
              </button>
            </div>
          )}

          {!loading && personas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personas.map(p => (
                <PersonaCard key={p.id} persona={p} isActive={isActive(p.id)} onToggle={togglePersona} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      {panel && (
        <div className="w-[480px] shrink-0 border-l border-zinc-800 bg-[#18181b] flex flex-col overflow-hidden">
          {panel === 'upload' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-800/50 flex items-center justify-center">
                    <FileText size={15} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-100">Analyser un document</div>
                    <div className="text-xs text-zinc-500">Claude structure le persona automatiquement</div>
                  </div>
                </div>
                <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-zinc-700 transition-colors"><X size={15} className="text-zinc-400"/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <UploadPanel onParsed={handleParsed} />
                <div className="mt-6 pt-5 border-t border-zinc-800">
                  <p className="text-xs text-zinc-600 text-center mb-3">ou créer manuellement</p>
                  <button onClick={() => { setEditingPersona({...EMPTY_PERSONA}); setPanel('editor'); }}
                    className="w-full py-2 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-lg transition-all">
                    Formulaire vide →
                  </button>
                </div>
              </div>
            </div>
          )}

          {panel === 'editor' && editingPersona && (
            <PersonaEditor persona={editingPersona} isNew={!editingPersona.id} onSave={handleSave} onCancel={closePanel} />
          )}
        </div>
      )}
    </div>
  );
}
