import { useState, useMemo, useEffect } from 'react';
import {
  Sparkles, Download, Save, ChevronRight,
  Package, User, LayoutTemplate, Palette, Type,
  Monitor, Smartphone, Square, RectangleHorizontal,
  AlertCircle, CheckCircle2, Loader2, Settings2,
  ChevronDown, ChevronUp, Eye, Zap, X, RotateCcw,
  Info, ScanSearch, FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useProduct } from '../context/ProductContext';
import { usePersona } from '../context/PersonaContext';
import { FORMAT_CATEGORIES, getFormatById } from '../utils/formats';
import { TEMPLATES } from '../engine/templates/index';
import { PALETTES } from '../engine/palettes';
import { GOOGLE_FONTS } from '../engine/fonts';
import { buildContext, renderTemplate } from '../engine/templateEngine';
import CreativeCanvas from '../components/Canvas/CreativeCanvas';

// ─── Hook colors ──────────────────────────────────────────────────────────────
const HOOK_COLORS = {
  douleur:        { bg: 'bg-red-900/20 border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-500' },
  promesse:       { bg: 'bg-emerald-900/20 border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  preuve_sociale: { bg: 'bg-blue-900/20 border-blue-500/30',  text: 'text-blue-400',   dot: 'bg-blue-500' },
  urgence:        { bg: 'bg-orange-900/20 border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  curiosite:      { bg: 'bg-violet-900/20 border-violet-500/30', text: 'text-violet-400', dot: 'bg-violet-500' },
  autorite:       { bg: 'bg-amber-900/20 border-amber-500/30', text: 'text-amber-400', dot: 'bg-amber-500' },
  transformation: { bg: 'bg-cyan-900/20 border-cyan-500/30', text: 'text-cyan-400',   dot: 'bg-cyan-500' },
  identite:       { bg: 'bg-pink-900/20 border-pink-500/30',  text: 'text-pink-400',  dot: 'bg-pink-500' },
};
function hookColor(m) { return HOOK_COLORS[m] || HOOK_COLORS.promesse; }

// ─── Format icon ──────────────────────────────────────────────────────────────
function FormatIcon({ format }) {
  if (!format) return <Square size={12} />;
  const { width, height } = format;
  if (width > height * 1.5) return <RectangleHorizontal size={12} />;
  if (height > width * 1.5) return <Smartphone size={12} />;
  return <Square size={12} />;
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function Section({ label, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-800/60 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} className="text-zinc-500" />}
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
        </div>
        {open ? <ChevronUp size={12} className="text-zinc-600" /> : <ChevronDown size={12} className="text-zinc-600" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

// ─── Context status pill ──────────────────────────────────────────────────────
function ContextPill({ label, value, icon: Icon, color = 'indigo', onClick }) {
  const colors = {
    indigo: value ? 'bg-indigo-900/30 border-indigo-500/40 text-indigo-300' : 'bg-zinc-800/40 border-zinc-700 text-zinc-500',
    emerald: value ? 'bg-emerald-900/30 border-emerald-500/40 text-emerald-300' : 'bg-zinc-800/40 border-zinc-700 text-zinc-500',
  };
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all w-full text-left ${colors[color]}`}>
      <Icon size={12} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
        <div className="truncate font-semibold">{value || 'Non sélectionné'}</div>
      </div>
      {!value ? <ChevronRight size={10} className="shrink-0 opacity-50" /> : <CheckCircle2 size={11} className="shrink-0 opacity-70" />}
    </button>
  );
}

// ─── Template card ────────────────────────────────────────────────────────────
function TemplateCard({ template, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`relative rounded-xl border p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
        selected ? 'border-indigo-500 bg-indigo-900/20 ring-1 ring-indigo-500/20' : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
      }`}
    >
      <div className="w-full aspect-square rounded-lg mb-2 overflow-hidden flex items-center justify-center text-2xl" style={{ background: template.previewBg }}>
        {selected && <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"><CheckCircle2 size={10} className="text-white" /></div>}
        <span>🎨</span>
      </div>
      <div className="text-[11px] font-bold text-zinc-200 truncate">{template.name}</div>
      <div className="text-[9px] text-zinc-500 mt-0.5 leading-tight">{template.description}</div>
    </button>
  );
}

// ─── Palette swatch ───────────────────────────────────────────────────────────
function PaletteSwatch({ palette, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(palette.id)} title={palette.name}
      className={`relative w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${selected ? 'border-white scale-110' : 'border-transparent'}`}
      style={{ background: palette.bg }}>
      {selected && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 size={12} className="text-white drop-shadow" /></div>}
    </button>
  );
}

// ─── Font selector ────────────────────────────────────────────────────────────
function FontSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {GOOGLE_FONTS.map(f => (
        <button key={f.id} onClick={() => onChange(f.id)}
          className={`px-2 py-1.5 rounded-lg border text-[10px] font-medium text-left transition-all ${
            value === f.id ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400'
          }`}>
          {f.name}
        </button>
      ))}
    </div>
  );
}

// ─── Format selector ──────────────────────────────────────────────────────────
function FormatSelector({ value, onChange }) {
  const [openCat, setOpenCat] = useState(FORMAT_CATEGORIES[0].id);
  return (
    <div className="space-y-1">
      {FORMAT_CATEGORIES.map(cat => (
        <div key={cat.id}>
          <button onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
            className="w-full flex items-center justify-between py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            <span>{cat.icon} {cat.label}</span>
            {openCat === cat.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {openCat === cat.id && (
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {cat.formats.map(f => (
                <button key={f.id} onClick={() => onChange(f.id)}
                  className={`rounded-lg border px-2 py-1.5 text-left transition-all ${
                    value === f.id ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-800 hover:border-zinc-700'
                  }`}>
                  <div className="flex items-center gap-1 mb-0.5">
                    <FormatIcon format={f} />
                    <span className={`text-[10px] font-semibold truncate ${value === f.id ? 'text-indigo-300' : 'text-zinc-300'}`}>{f.label}</span>
                  </div>
                  <div className="text-[9px] text-zinc-600 font-mono">{f.width}×{f.height}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Override field ───────────────────────────────────────────────────────────
function OverrideField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider block mb-1">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none transition-colors" />
    </div>
  );
}

// ─── Variant card ─────────────────────────────────────────────────────────────
function VariantCard({ variant, selected, onSelect }) {
  const [showRationale, setShowRationale] = useState(false);
  const c = hookColor(variant.hook_mechanism);

  return (
    <div
      className={`relative flex-1 min-w-[220px] max-w-[280px] rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.01] ${
        selected
          ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/20'
          : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
      }`}
      onClick={() => onSelect(variant)}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
          <CheckCircle2 size={11} className="text-white" />
        </div>
      )}

      {/* Badges row: framework + hook */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {variant.framework && (
          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-900/40 border border-indigo-500/30 text-indigo-400">
            {variant.framework}
          </span>
        )}
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          {variant.angle_label}
        </div>
      </div>

      {/* Headline */}
      <div className="text-sm font-bold text-zinc-100 leading-tight mb-2">
        {variant.headline}
      </div>

      {/* Subheadline */}
      {variant.subheadline && (
        <p className="text-[11px] text-zinc-400 leading-snug mb-3 line-clamp-3">
          {variant.subheadline}
        </p>
      )}

      {/* CTA + badge row */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
          → {variant.cta_text}
        </span>
        {variant.badge_text && (
          <span className="text-[10px] font-bold bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
            {variant.badge_text}
          </span>
        )}
      </div>

      {/* Framework rationale */}
      {variant.framework_rationale && (
        <p className="text-[9px] text-indigo-400/70 italic mb-2 leading-snug border-l-2 border-indigo-500/30 pl-2">
          {variant.framework_rationale}
        </p>
      )}

      {/* Rationale toggle */}
      {variant.rationale && (
        <div className="mt-2">
          <button
            onClick={e => { e.stopPropagation(); setShowRationale(r => !r); }}
            className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <Info size={10} />
            {showRationale ? 'Masquer la logique' : 'Pourquoi ce mécanisme ?'}
          </button>
          {showRationale && (
            <p className="mt-1.5 text-[10px] text-zinc-500 italic leading-snug border-l-2 border-zinc-700 pl-2">
              {variant.rationale}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function GeneratorPage({ onNavigate }) {
  const { activeProduct } = useProduct();
  const { primaryPersona } = usePersona();

  // Config state
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const [fontId, setFontId] = useState(GOOGLE_FONTS[0].id);
  const [formatId, setFormatId] = useState('fb_feed_portrait');

  // Content overrides
  const [overrides, setOverrides] = useState({ headline: '', subheadline: '', ctaText: '', badgeText: '' });
  const updateOverride = (key, val) => setOverrides(o => ({ ...o, [key]: val }));
  const resetOverrides = () => setOverrides({ headline: '', subheadline: '', ctaText: '', badgeText: '' });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Competitor template reference (framework detection)
  const [competitorTemplates, setCompetitorTemplates] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null); // { name, framework }

  // Save state
  const [saving, setSaving] = useState(false);

  // Load saved competitor templates for framework reference
  useEffect(() => {
    axios.get('/api/templates').then(({ data }) => {
      setCompetitorTemplates(data.filter(t => t.analysis?.copy_framework?.name));
    }).catch(() => {});
  }, []);

  const format = useMemo(() => getFormatById(formatId), [formatId]);
  const template = useMemo(() => TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0], [templateId]);

  // Build context + render HTML
  const ctx = useMemo(() => buildContext({
    product: activeProduct || {},
    persona: primaryPersona || {},
    palette: paletteId,
    font: fontId,
    overrides: {
      headline: overrides.headline || undefined,
      subheadline: overrides.subheadline || undefined,
      ctaText: overrides.ctaText || undefined,
      badgeText: overrides.badgeText || undefined,
    },
  }), [activeProduct, primaryPersona, paletteId, fontId, overrides]);

  const html = useMemo(() => {
    if (!format) return '';
    try { return renderTemplate(template, ctx, format); }
    catch (e) { console.error('Render error:', e); return ''; }
  }, [template, ctx, format]);

  // ── Apply variant to canvas ──
  const applyVariant = (variant) => {
    setSelectedVariant(variant);
    setOverrides({
      headline: variant.headline || '',
      subheadline: variant.subheadline || '',
      ctaText: variant.cta_text || '',
      badgeText: variant.badge_text || '',
    });
  };

  // ── Generate via Claude ──
  const handleGenerate = async () => {
    if (!activeProduct) return toast.error('Sélectionne un produit d\'abord');
    setGenerating(true);
    setVariants([]);
    setSelectedVariant(null);
    const tid = toast.loading('Claude génère 4 variantes...', { duration: 60000 });
    try {
      const { data } = await axios.post('/api/claude/generate', {
        product: activeProduct,
        persona: primaryPersona || null,
        formatId,
        templateId,
        count: 4,
        detectedFramework: selectedCompetitor?.framework || null,
      });
      toast.dismiss(tid);
      if (!data.success) throw new Error(data.error || 'Erreur inconnue');
      setVariants(data.variants);
      // Auto-apply first variant
      if (data.variants.length > 0) applyVariant(data.variants[0]);
      toast.success(`${data.variants.length} variantes générées !`);
    } catch (err) {
      toast.dismiss(tid);
      toast.error(`Erreur : ${err.response?.data?.error || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // ── Save creative ──
  const handleSave = async () => {
    if (!activeProduct) return toast.error('Sélectionne un produit d\'abord');
    setSaving(true);
    try {
      await axios.post('/api/creatives', {
        name: `${activeProduct.name} — ${template.name} (${format?.label})`,
        productId: activeProduct.id,
        personaId: primaryPersona?.id || null,
        templateId, formatId, paletteId, fontId,
        overrides, html,
        variantAngle: selectedVariant?.angle || null,
        framework: selectedVariant?.framework || null,
        competitorReference: selectedCompetitor?.name || null,
        status: 'draft',
        tags: [template.name, format?.label].filter(Boolean),
      });
      toast.success('Créative sauvegardée !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!html) return toast.error('Rien à exporter — génère d\'abord une créative');
    try {
      const filename = `${activeProduct?.name || 'creative'}_${template.name}_${format?.label || formatId}.html`
        .replace(/[^a-z0-9_\-\.]/gi, '_');
      const { data } = await axios.post('/api/export/html',
        { html, filename },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([data], { type: 'text/html' }));
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
      toast.success('Fichier HTML téléchargé');
    } catch {
      toast.error('Erreur lors de l\'export');
    }
  };

  return (
    <div className="flex h-full">
      {/* ── Left config panel ─────────────────────────────── */}
      <div className="w-[290px] shrink-0 border-r border-zinc-800 bg-[#131316] overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="px-4 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles size={15} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Générateur</h2>
              <p className="text-[10px] text-zinc-500">Template Engine + IA — Étapes 6–7</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Context */}
          <Section label="Contexte" icon={Settings2}>
            <div className="space-y-2">
              <ContextPill label="Produit" value={activeProduct?.name} icon={Package} color="emerald" onClick={() => onNavigate?.('products')} />
              <ContextPill label="Persona" value={primaryPersona?.name} icon={User} color="indigo" onClick={() => onNavigate?.('personas')} />
            </div>
            {(!activeProduct || !primaryPersona) && (
              <div className="mt-2.5 flex items-start gap-2 text-[10px] text-amber-400/80 bg-amber-900/10 border border-amber-500/20 rounded-lg px-2.5 py-2">
                <AlertCircle size={11} className="shrink-0 mt-0.5" />
                <span>
                  {!activeProduct ? 'Sélectionne un produit pour voir le packshot.' :
                   'Ajoute un persona pour que Claude personnalise le copy.'}
                </span>
              </div>
            )}
          </Section>

          {/* Competitor reference */}
          <Section label="Modèle concurrent (framework)" icon={ScanSearch} defaultOpen={false}>
            <p className="text-[10px] text-zinc-600 mb-2 leading-snug">
              Sélectionne une créative analysée pour que Claude détecte son framework et génère la variante A en miroir.
            </p>
            {competitorTemplates.length === 0 ? (
              <button onClick={() => onNavigate?.('templates')}
                className="w-full flex items-center gap-2 text-[10px] text-indigo-400 hover:text-indigo-300 border border-dashed border-indigo-500/30 hover:border-indigo-500/50 rounded-lg px-3 py-2 transition-all">
                <ScanSearch size={11} /> Analyser un concurrent d'abord
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCompetitor(null)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg border text-[10px] transition-all ${!selectedCompetitor ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  Automatique (Claude choisit)
                </button>
                {competitorTemplates.map(t => (
                  <button key={t.id}
                    onClick={() => setSelectedCompetitor({ name: t.name, framework: t.analysis.copy_framework.name })}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border transition-all ${selectedCompetitor?.name === t.name ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] text-zinc-300 truncate">{t.name}</span>
                      <span className="text-[9px] font-black text-indigo-400 shrink-0">{t.analysis.copy_framework.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Templates */}
          <Section label="Template" icon={LayoutTemplate}>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map(t => <TemplateCard key={t.id} template={t} selected={templateId === t.id} onSelect={setTemplateId} />)}
            </div>
          </Section>

          {/* Format */}
          <Section label="Format" icon={Monitor} defaultOpen={false}>
            <FormatSelector value={formatId} onChange={setFormatId} />
          </Section>

          {/* Palette */}
          <Section label="Couleurs" icon={Palette} defaultOpen={false}>
            <div className="flex flex-wrap gap-2 mb-2">
              {PALETTES.map(p => <PaletteSwatch key={p.id} palette={p} selected={paletteId === p.id} onSelect={setPaletteId} />)}
            </div>
            <div className="text-[10px] text-zinc-500">{PALETTES.find(p => p.id === paletteId)?.name}</div>
          </Section>

          {/* Font */}
          <Section label="Typographie" icon={Type} defaultOpen={false}>
            <FontSelector value={fontId} onChange={setFontId} />
          </Section>

          {/* Content overrides */}
          <Section label="Textes personnalisés" icon={Eye} defaultOpen={false}>
            <div className="space-y-2.5">
              <OverrideField label="Headline" value={overrides.headline} onChange={v => updateOverride('headline', v)} placeholder={ctx.headline} />
              <OverrideField label="Sous-titre" value={overrides.subheadline} onChange={v => updateOverride('subheadline', v)} placeholder={ctx.subheadline || 'Sous-titre...'} />
              <OverrideField label="CTA" value={overrides.ctaText} onChange={v => updateOverride('ctaText', v)} placeholder={ctx.ctaText} />
              <OverrideField label="Badge" value={overrides.badgeText} onChange={v => updateOverride('badgeText', v)} placeholder={ctx.badgeText || 'Ex: -30%'} />
              <button onClick={resetOverrides} className="text-[10px] text-zinc-600 hover:text-zinc-400 underline underline-offset-2 flex items-center gap-1">
                <RotateCcw size={9} /> Réinitialiser
              </button>
            </div>
          </Section>
        </div>

        {/* Actions (sticky bottom) */}
        <div className="p-4 border-t border-zinc-800 space-y-2 shrink-0 bg-[#131316]">
          <button
            onClick={handleGenerate}
            disabled={generating || !activeProduct}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {generating
              ? <><Loader2 size={14} className="animate-spin" /> Génération en cours…</>
              : <><Sparkles size={14} /> Générer avec Claude</>
            }
          </button>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving || !activeProduct}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 text-xs font-semibold rounded-lg transition-colors">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Sauvegarder
            </button>
            <button onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors">
              <FileCode size={12} /> Export HTML
            </button>
          </div>
        </div>
      </div>

      {/* ── Main canvas area ──────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-[#0f0f11]">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-[#0f0f11]/90 backdrop-blur border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-300">{template.name}</span>
            <span className="text-zinc-700">·</span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <FormatIcon format={format} />
              {format?.label} — {format?.width}×{format?.height}px
            </span>
          </div>
          <div className="flex items-center gap-2">
            {activeProduct && (
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <Package size={10} /> {activeProduct.name}
              </div>
            )}
            {primaryPersona && (
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 bg-indigo-900/20 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                <User size={10} /> {primaryPersona.name}
              </div>
            )}
            {selectedVariant && (
              <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border ${hookColor(selectedVariant.hook_mechanism).bg} ${hookColor(selectedVariant.hook_mechanism).text}`}>
                <Zap size={9} /> {selectedVariant.angle_label}
              </div>
            )}
          </div>
        </div>

        {/* Canvas + variants */}
        <div className="flex flex-col items-center py-8 px-6 min-h-full">
          {/* Creative preview */}
          <CreativeCanvas html={html} format={format} />

          {/* Palette quick-switch */}
          <div className="mt-5 flex items-center gap-2">
            {PALETTES.map(p => (
              <button key={p.id} onClick={() => setPaletteId(p.id)} title={p.name}
                className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${paletteId === p.id ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                style={{ background: p.primary }} />
            ))}
          </div>

          {/* ── Variants panel ── */}
          {variants.length > 0 && (
            <div className="w-full max-w-5xl mt-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-indigo-400" />
                  <h3 className="text-sm font-bold text-zinc-200">Variantes générées par Claude</h3>
                  <span className="text-[10px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{variants.length} variantes</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedVariant && (
                    <button onClick={resetOverrides} className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
                      <X size={10} /> Effacer sélection
                    </button>
                  )}
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-900/20 border border-indigo-500/20 hover:border-indigo-500/40 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                  >
                    {generating ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />}
                    Régénérer
                  </button>
                </div>
              </div>

              {/* 4 cards in a row */}
              <div className="flex gap-4 flex-wrap">
                {variants.map((v) => (
                  <VariantCard
                    key={v.id}
                    variant={v}
                    selected={selectedVariant?.id === v.id}
                    onSelect={applyVariant}
                  />
                ))}
              </div>

              <p className="text-[10px] text-zinc-700 text-center mt-4">
                Clique sur une variante pour l'appliquer sur le canvas · L'éditeur inline sera disponible à l'étape 8
              </p>
            </div>
          )}

          {/* Empty state when no generation yet */}
          {variants.length === 0 && !generating && (
            <div className="mt-10 text-center max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={20} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-zinc-400 mb-1">Génère 4 variantes avec Claude</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Claude analysera le produit et le persona pour créer 4 angles copywriting distincts (douleur, promesse, preuve sociale, urgence…) et les appliquera sur le canvas.
              </p>
              {!activeProduct && (
                <button onClick={() => onNavigate?.('products')}
                  className="mt-4 inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
                  <Package size={11} /> Ajouter un produit d'abord
                </button>
              )}
            </div>
          )}

          {/* Loading skeletons */}
          {generating && (
            <div className="w-full max-w-5xl mt-10">
              <div className="flex items-center gap-2 mb-4">
                <Loader2 size={14} className="text-indigo-400 animate-spin" />
                <span className="text-sm text-zinc-400">Claude génère vos variantes…</span>
              </div>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex-1 min-w-[220px] max-w-[280px] rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 animate-pulse">
                    <div className="h-4 w-24 bg-zinc-800 rounded-full mb-3" />
                    <div className="h-5 w-full bg-zinc-800 rounded mb-1" />
                    <div className="h-5 w-3/4 bg-zinc-800 rounded mb-3" />
                    <div className="h-3 w-full bg-zinc-800/60 rounded mb-1" />
                    <div className="h-3 w-5/6 bg-zinc-800/60 rounded mb-1" />
                    <div className="h-3 w-4/6 bg-zinc-800/60 rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
