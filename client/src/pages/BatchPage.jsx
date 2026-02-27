import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Layers, Package, Users, Monitor, Smartphone, Square,
  CheckSquare, Square as SquareIcon, Sparkles, Download,
  Loader2, CheckCircle2, X, ChevronDown, ChevronUp,
  AlertCircle, LayoutTemplate, Palette, Type, FileCode,
  BookImage, Play, Zap,
} from 'lucide-react';
import { FORMAT_CATEGORIES, getFormatById } from '../utils/formats';
import { TEMPLATES } from '../engine/templates/index';
import { PALETTES } from '../engine/palettes';
import { GOOGLE_FONTS } from '../engine/fonts';
import { buildContext, renderTemplate } from '../engine/templateEngine';
import { useProduct } from '../context/ProductContext';

// ─── Checkbox row ────────────────────────────────────────────────────────────
function CheckRow({ label, sublabel, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${checked ? 'border-indigo-500/60 bg-indigo-900/20' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-600'}`}>
        {checked && <CheckCircle2 size={10} className="text-white" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-medium truncate ${checked ? 'text-zinc-200' : 'text-zinc-400'}`}>{label}</div>
        {sublabel && <div className="text-[9px] text-zinc-600">{sublabel}</div>}
      </div>
    </button>
  );
}

// ─── Progress item ─────────────────────────────────────────────────────────
function ProgressItem({ item }) {
  const statusIcon = {
    pending: <SquareIcon size={12} className="text-zinc-600" />,
    running: <Loader2 size={12} className="text-indigo-400 animate-spin" />,
    done:    <CheckCircle2 size={12} className="text-emerald-400" />,
    error:   <X size={12} className="text-red-400" />,
  };
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs transition-all ${
      item.status === 'done' ? 'border-emerald-900/40 bg-emerald-900/10' :
      item.status === 'running' ? 'border-indigo-500/30 bg-indigo-900/10' :
      item.status === 'error' ? 'border-red-900/40 bg-red-900/10' :
      'border-zinc-800 bg-zinc-900/40'
    }`}>
      <div className="shrink-0">{statusIcon[item.status]}</div>
      <div className="flex-1 min-w-0">
        <div className="text-zinc-300 truncate font-medium">{item.label}</div>
        <div className="text-[9px] text-zinc-600">{item.persona} · {item.format}</div>
      </div>
      {item.framework && <span className="text-[8px] font-black text-indigo-400 shrink-0">{item.framework}</span>}
      {item.status === 'error' && item.error && <span className="text-[9px] text-red-400 shrink-0 max-w-[100px] truncate">{item.error}</span>}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function BatchPage({ onNavigate }) {
  const { activeProduct } = useProduct();
  const [products, setProducts] = useState([]);
  const [personas, setPersonas] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPersonas, setSelectedPersonas] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState(['fb_feed_portrait']);
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [paletteId, setPaletteId] = useState(PALETTES[0].id);
  const [fontId, setFontId] = useState(GOOGLE_FONTS[0].id);
  const [useAiCopy, setUseAiCopy] = useState(false);

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState([]); // [{ id, label, persona, format, status, html, framework, error }]
  const [done, setDone] = useState(false);

  const [openSection, setOpenSection] = useState({ personas: true, formats: true, style: false });
  const toggleSection = (k) => setOpenSection(p => ({ ...p, [k]: !p[k] }));

  useEffect(() => {
    Promise.all([axios.get('/api/products'), axios.get('/api/personas')]).then(([{ data: p }, { data: per }]) => {
      setProducts(p); setPersonas(per);
      if (activeProduct) setSelectedProduct(activeProduct);
      else if (p.length > 0) setSelectedProduct(p[0]);
    }).catch(() => {});
  }, [activeProduct]);

  const togglePersona = (p) => setSelectedPersonas(prev =>
    prev.find(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]
  );
  const toggleFormat = (id) => setSelectedFormats(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const template = useMemo(() => TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0], [templateId]);

  // Total combos: personas × formats
  const totalCombos = useMemo(() => {
    const personas = selectedPersonas.length || 1; // if none, still run once with no persona
    return personas * selectedFormats.length;
  }, [selectedPersonas, selectedFormats]);

  const canRun = selectedProduct && selectedFormats.length > 0;

  const handleRun = async () => {
    if (!canRun) return toast.error('Sélectionne un produit et au moins 1 format');
    setRunning(true); setDone(false);

    // Build job list
    const personaList = selectedPersonas.length > 0 ? selectedPersonas : [null];
    const jobs = [];
    for (const persona of personaList) {
      for (const formatId of selectedFormats) {
        const format = getFormatById(formatId);
        jobs.push({
          id: `${persona?.id || 'nopersona'}_${formatId}`,
          label: `${selectedProduct.name} · ${persona?.name || 'Sans persona'} · ${format?.label}`,
          persona: persona?.name || 'Sans persona',
          format: format?.label || formatId,
          personaObj: persona,
          formatId,
          status: 'pending',
          html: null,
          framework: null,
          error: null,
        });
      }
    }
    setProgress(jobs.map(j => ({ ...j })));

    // Execute jobs sequentially (to respect Claude rate limits)
    const results = [...jobs];

    for (let i = 0; i < results.length; i++) {
      const job = results[i];
      // Mark running
      results[i] = { ...job, status: 'running' };
      setProgress([...results]);

      try {
        let overrides = {};
        if (useAiCopy) {
          // Generate copy via Claude
          const { data: genData } = await axios.post('/api/claude/generate', {
            product: selectedProduct,
            persona: job.personaObj || null,
            formatId: job.formatId,
            templateId,
            count: 1,
          });
          if (genData.success && genData.variants.length > 0) {
            const v = genData.variants[0];
            overrides = { headline: v.headline, subheadline: v.subheadline, ctaText: v.cta_text, badgeText: v.badge_text };
            results[i].framework = v.framework;
          }
        }

        // Render HTML
        const ctx = buildContext({
          product: selectedProduct,
          persona: job.personaObj || {},
          palette: paletteId,
          font: fontId,
          overrides,
        });
        const format = getFormatById(job.formatId);
        const html = renderTemplate(template, ctx, format);

        // Save to library
        await axios.post('/api/creatives', {
          name: job.label,
          productId: selectedProduct.id,
          personaId: job.personaObj?.id || null,
          templateId,
          formatId: job.formatId,
          paletteId,
          fontId,
          html,
          framework: results[i].framework,
          status: 'draft',
          tags: ['batch', template.name, format?.label].filter(Boolean),
        });

        results[i] = { ...results[i], status: 'done', html };
      } catch (err) {
        results[i] = { ...results[i], status: 'error', error: err.response?.data?.error || err.message };
      }

      setProgress([...results]);
    }

    setRunning(false); setDone(true);
    const successCount = results.filter(r => r.status === 'done').length;
    toast.success(`Batch terminé : ${successCount}/${results.length} créatives générées`);
  };

  const handleExportZip = async () => {
    const doneItems = progress.filter(p => p.status === 'done' && p.html);
    if (doneItems.length === 0) return toast.error('Aucune créative prête à exporter');
    try {
      const creatives = doneItems.map(p => ({ name: p.label, html: p.html }));
      const { data } = await axios.post('/api/export/batch', { creatives }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([data], { type: 'application/zip' }));
      const a = document.createElement('a');
      a.href = url; a.download = `batch_${Date.now()}.zip`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`ZIP téléchargé (${doneItems.length} fichiers)`);
    } catch { toast.error('Erreur lors de l\'export ZIP'); }
  };

  const doneCount = progress.filter(p => p.status === 'done').length;
  const errorCount = progress.filter(p => p.status === 'error').length;

  const SectionHeader = ({ k, label, icon: Icon }) => (
    <button onClick={() => toggleSection(k)} className="w-full flex items-center justify-between py-2 px-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
      <div className="flex items-center gap-2"><Icon size={12} />{label}</div>
      {openSection[k] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
    </button>
  );

  return (
    <div className="flex h-full">
      {/* ── Left config panel ─── */}
      <div className="w-[310px] shrink-0 border-r border-zinc-800 bg-[#131316] flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Layers size={15} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Batch & Export</h2>
              <p className="text-[10px] text-zinc-500">N personas × M formats → ZIP</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Product */}
          <div>
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Produit</label>
            <select value={selectedProduct?.id || ''} onChange={e => setSelectedProduct(products.find(p => p.id === e.target.value) || null)}
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 appearance-none">
              <option value="">— Sélectionner un produit —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>)}
            </select>
            {!selectedProduct && <p className="text-[10px] text-amber-400/70 mt-1 flex items-center gap-1"><AlertCircle size={10} />Produit requis</p>}
          </div>

          {/* Personas */}
          <div>
            <SectionHeader k="personas" label={`Personas (${selectedPersonas.length} sélectionné${selectedPersonas.length > 1 ? 's' : ''})`} icon={Users} />
            {openSection.personas && (
              <div className="space-y-1.5">
                {personas.length === 0 ? (
                  <button onClick={() => onNavigate?.('personas')} className="w-full text-[10px] text-indigo-400 hover:text-indigo-300 border border-dashed border-indigo-500/30 rounded-lg px-3 py-2 text-center">
                    Créer des personas d'abord →
                  </button>
                ) : (
                  <>
                    <CheckRow
                      label="Sans persona (générique)"
                      checked={selectedPersonas.length === 0}
                      onChange={() => setSelectedPersonas([])}
                    />
                    {personas.map(p => (
                      <CheckRow key={p.id} label={p.name}
                        sublabel={p.demographics ? `${p.demographics.age} · ${p.demographics.gender}` : ''}
                        checked={!!selectedPersonas.find(x => x.id === p.id)}
                        onChange={() => togglePersona(p)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Formats */}
          <div>
            <SectionHeader k="formats" label={`Formats (${selectedFormats.length} sélectionné${selectedFormats.length > 1 ? 's' : ''})`} icon={Monitor} />
            {openSection.formats && (
              <div className="space-y-2">
                {FORMAT_CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    <div className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1 pl-1">{cat.icon} {cat.label}</div>
                    <div className="space-y-1">
                      {cat.formats.map(f => (
                        <CheckRow key={f.id} label={f.label} sublabel={`${f.width}×${f.height}px`}
                          checked={selectedFormats.includes(f.id)} onChange={() => toggleFormat(f.id)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Style */}
          <div>
            <SectionHeader k="style" label="Style" icon={LayoutTemplate} />
            {openSection.style && (
              <div className="space-y-3">
                {/* Template */}
                <div>
                  <label className="text-[9px] text-zinc-600 uppercase tracking-wider block mb-1.5">Template</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEMPLATES.map(t => (
                      <button key={t.id} onClick={() => setTemplateId(t.id)}
                        className={`rounded-lg border px-2 py-1.5 text-left transition-all ${templateId === t.id ? 'border-indigo-500 bg-indigo-900/20 text-indigo-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                        <div className="text-[10px] font-semibold">{t.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Palette */}
                <div>
                  <label className="text-[9px] text-zinc-600 uppercase tracking-wider block mb-1.5">Palette</label>
                  <div className="flex flex-wrap gap-2">
                    {PALETTES.map(p => (
                      <button key={p.id} onClick={() => setPaletteId(p.id)} title={p.name}
                        className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${paletteId === p.id ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ background: p.bg }} />
                    ))}
                  </div>
                </div>
                {/* Font */}
                <div>
                  <label className="text-[9px] text-zinc-600 uppercase tracking-wider block mb-1.5">Typographie</label>
                  <select value={fontId} onChange={e => setFontId(e.target.value)}
                    className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400 focus:outline-none focus:border-indigo-500 appearance-none">
                    {GOOGLE_FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* AI copy toggle */}
          <div className="border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-400" />
                <span className="text-xs font-semibold text-zinc-300">Générer le copy avec Claude</span>
              </div>
              <button onClick={() => setUseAiCopy(v => !v)}
                className={`w-10 h-5 rounded-full transition-colors relative ${useAiCopy ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useAiCopy ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 leading-snug">
              {useAiCopy
                ? 'Claude génère 1 variante de copy par combinaison. Plus lent mais textes personnalisés.'
                : 'Utilise le tagline et les bénéfices du produit. Rapide et sans API call supplémentaire.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-2 shrink-0">
          {/* Summary */}
          <div className="text-center text-xs text-zinc-500 mb-2">
            <span className="text-zinc-300 font-semibold">{totalCombos}</span> créative{totalCombos > 1 ? 's' : ''} à générer
            {useAiCopy && <span className="text-indigo-400 ml-1">(+ Claude)</span>}
          </div>

          <button onClick={handleRun} disabled={running || !canRun}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors">
            {running ? <><Loader2 size={14} className="animate-spin" /> Génération en cours…</> : <><Play size={14} /> Lancer le batch</>}
          </button>

          {done && doneCount > 0 && (
            <button onClick={handleExportZip}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-semibold rounded-xl transition-colors">
              <Download size={14} /> Télécharger ZIP ({doneCount} HTML)
            </button>
          )}

          {done && (
            <button onClick={() => onNavigate?.('library')}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1">
              <BookImage size={12} /> Voir dans la bibliothèque
            </button>
          )}
        </div>
      </div>

      {/* ── Main area ─── */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f11] p-8">
        {progress.length === 0 && !running && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-5">
              <Layers size={28} className="text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-300 mb-2">Génération en masse</h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
              Configure tes personas et formats dans le panneau gauche, puis lance le batch.
              Toutes les créatives seront sauvegardées automatiquement dans la bibliothèque.
            </p>
            <div className="grid grid-cols-3 gap-4 w-full text-center">
              {[
                { icon: Users, label: 'Personas', sub: 'Multiplie les angles' },
                { icon: Zap, label: 'Génération', sub: 'Auto ou avec Claude' },
                { icon: Download, label: 'Export ZIP', sub: 'Tous les HTML' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <Icon size={20} className="text-zinc-600 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-zinc-400">{label}</div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {progress.length > 0 && (
          <>
            {/* Progress header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-zinc-200">
                  {running ? 'Génération en cours…' : done ? 'Batch terminé !' : 'Prêt'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {doneCount}/{progress.length} créatives
                  {errorCount > 0 && <span className="text-red-400 ml-2">· {errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
                </p>
              </div>
              {running && (
                <div className="flex items-center gap-2 text-xs text-indigo-400">
                  <Loader2 size={13} className="animate-spin" />
                  {doneCount + errorCount}/{progress.length}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
                style={{ width: `${progress.length > 0 ? ((doneCount + errorCount) / progress.length) * 100 : 0}%` }}
              />
            </div>

            {/* Job list */}
            <div className="space-y-2">
              {progress.map(item => <ProgressItem key={item.id} item={item} />)}
            </div>

            {/* Done state */}
            {done && (
              <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-center">
                <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-300">
                  {doneCount} créative{doneCount > 1 ? 's' : ''} générée{doneCount > 1 ? 's' : ''} et sauvegardée{doneCount > 1 ? 's' : ''}
                </p>
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button onClick={handleExportZip}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold rounded-lg transition-colors">
                    <Download size={13} /> Export ZIP
                  </button>
                  <button onClick={() => onNavigate?.('library')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors">
                    <BookImage size={13} /> Voir la bibliothèque
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
