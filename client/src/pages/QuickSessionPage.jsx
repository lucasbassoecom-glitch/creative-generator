import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Zap, ArrowLeft, ArrowRight, Trophy, TrendingUp, RefreshCw,
  Plus, Clock, CheckCircle2, Loader2, BarChart2, Download,
  ChevronRight, Target,
} from 'lucide-react';
import FeedbackModal from '../components/Common/FeedbackModal';

const VARIABLE_HIERARCHY = ['headline', 'colors', 'angle', 'structure', 'cta'];
const VARIABLE_LABELS = { headline: 'Headlines', colors: 'Couleurs', angle: 'Angles', structure: 'Structure', cta: 'CTA' };
const VARIABLE_ICONS = { headline: '🔤', colors: '🎨', angle: '🎯', structure: '📐', cta: '🔁' };

const STEPS = [
  { id: 'update', num: 1, label: 'Résultats', icon: BarChart2, desc: 'Mise à jour des créatives en test (5 min)' },
  { id: 'winner', num: 2, label: 'Identifier le winner', icon: Trophy, desc: 'Classer par performance (1 min)' },
  { id: 'generate', num: 3, label: 'Générer', icon: Zap, desc: 'Lancer le prochain batch (5-10 min)' },
  { id: 'export', num: 4, label: 'Export & Récap', icon: Download, desc: 'Exporter et noter (2 min)' },
];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              active ? 'bg-amber-600 text-white' : done ? 'bg-zinc-800 text-emerald-400' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
            }`}>
              {done ? <CheckCircle2 size={11} /> : <Icon size={11} />}
              {s.label}
            </div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-zinc-700" />}
          </div>
        );
      })}
    </div>
  );
}

// Step 1: Update results for creatives in testing
function StepUpdate({ testing, onUpdate, onNext, onSkip }) {
  const [feedbackCreative, setFeedbackCreative] = useState(null);
  const [updated, setUpdated] = useState(new Set());

  const handleSaved = (c) => {
    setUpdated(prev => new Set([...prev, c?.id || feedbackCreative?.id]));
    onUpdate(c);
    setFeedbackCreative(null);
    toast.success('Résultats enregistrés');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">Mise à jour des résultats</h2>
        <p className="text-sm text-zinc-400">Entre les résultats pour tes créatives en test.</p>
      </div>

      {testing.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl mb-6">
          <Clock size={24} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Aucune créative en test actuellement</p>
          <p className="text-[11px] text-zinc-600 mt-1">Lance des créatives dans la bibliothèque et marque-les "En test"</p>
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {testing.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className={`w-2 h-2 rounded-full shrink-0 ${updated.has(c.id) ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-zinc-200 truncate">{c.content?.headline || c.name || 'Créative'}</div>
                <div className="text-xs text-zinc-500">
                  {c.test_variable && <span className="mr-2">{VARIABLE_ICONS[c.test_variable]} {VARIABLE_LABELS[c.test_variable]}</span>}
                  {c.performance?.ctr && <span className="text-amber-400">CTR {c.performance.ctr}%</span>}
                </div>
              </div>
              {updated.has(c.id) ? (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> Mis à jour</span>
              ) : (
                <button onClick={() => setFeedbackCreative(c)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors">
                  Entrer résultats
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {testing.length > 0 && (
          <button onClick={onSkip} className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm rounded-xl transition-colors">
            Passer
          </button>
        )}
        <button onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl transition-colors">
          Suivant <ArrowRight size={16} />
        </button>
      </div>

      {feedbackCreative && (
        <FeedbackModal
          creative={feedbackCreative}
          onClose={() => setFeedbackCreative(null)}
          onSaved={() => handleSaved(feedbackCreative)}
        />
      )}
    </div>
  );
}

// Step 2: Identify winner
function StepWinner({ creatives, sortBy, setSortBy, onNext, onIterate }) {
  const withResults = creatives.filter(c => c.performance?.ctr != null || c.performance?.status);
  const sorted = [...withResults].sort((a, b) => {
    if (sortBy === 'ctr') return (parseFloat(b.performance?.ctr) || 0) - (parseFloat(a.performance?.ctr) || 0);
    return (parseFloat(a.performance?.cpa) || Infinity) - (parseFloat(b.performance?.cpa) || Infinity);
  });
  const winner = sorted[0];
  const controlCtr = sorted.find(c => c.is_control)?.performance?.ctr;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">Identifier le winner</h2>
        <p className="text-sm text-zinc-400">Classement de tes créatives par performance.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl mb-6">
          <Target size={24} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Aucun résultat disponible</p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setSortBy('ctr')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sortBy === 'ctr' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              Trier par CTR
            </button>
            <button onClick={() => setSortBy('cpa')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${sortBy === 'cpa' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
              Trier par CPA
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {sorted.slice(0, 5).map((c, i) => {
              const isWinner = i === 0;
              const ctr = parseFloat(c.performance?.ctr);
              const ctrlCtr = parseFloat(controlCtr);
              const uplift = (ctrlCtr && !c.is_control && ctr && ctr > ctrlCtr)
                ? `+${Math.round(((ctr - ctrlCtr) / ctrlCtr) * 100)}% vs contrôle`
                : null;

              return (
                <div key={c.id} className={`flex items-center gap-3 p-3.5 rounded-xl border ${isWinner ? 'bg-yellow-900/10 border-yellow-500/40' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className="text-sm font-black text-zinc-500 w-5 shrink-0">{i + 1}</div>
                  {isWinner && <Trophy size={14} className="text-yellow-400 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${isWinner ? 'text-yellow-300' : 'text-zinc-200'}`}>
                      {c.content?.headline || c.name || '—'}
                    </div>
                    {uplift && <div className="text-[10px] text-emerald-400">{uplift}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    {c.performance?.ctr && <div className={`text-sm font-bold ${isWinner ? 'text-yellow-400' : 'text-zinc-300'}`}>{c.performance.ctr}%</div>}
                    {c.performance?.cpa && <div className="text-[10px] text-zinc-500">{c.performance.cpa}€</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {winner && (
            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 mb-6">
              <div className="text-xs text-indigo-300 font-semibold mb-1">Winner identifié</div>
              <div className="text-sm text-zinc-200 font-semibold mb-3">
                {winner.content?.headline || winner.name || 'Créative'}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onIterate(winner)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">
                  <RefreshCw size={12} /> Itérer sur ce winner
                </button>
                <button onClick={onNext}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors">
                  Nouvelle créative <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <button onClick={onNext} className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-colors">
        Continuer <ArrowRight size={16} />
      </button>
    </div>
  );
}

// Step 3: Generate
function StepGenerate({ winner, onGoIterate, onGoCreate, onNext }) {
  const testedVars = []; // Would need to be computed from batch data
  const nextVar = VARIABLE_HIERARCHY.find(v => !testedVars.includes(v)) || 'headline';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">Générer le prochain batch</h2>
        <p className="text-sm text-zinc-400">Que veux-tu faire ensuite ?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={onGoIterate}
          className="flex flex-col items-center gap-3 p-5 bg-violet-900/20 border-2 border-violet-500/40 hover:border-violet-400/70 rounded-2xl transition-all group">
          <div className="w-12 h-12 rounded-xl bg-violet-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <RefreshCw size={22} className="text-violet-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-200">Itérer sur le winner</div>
            {winner && (
              <div className="text-xs text-zinc-500 mt-1">
                Tester les {VARIABLE_LABELS[nextVar]}
                <span className="block text-violet-400">{VARIABLE_ICONS[nextVar]}</span>
              </div>
            )}
          </div>
        </button>

        <button onClick={onGoCreate}
          className="flex flex-col items-center gap-3 p-5 bg-indigo-900/20 border-2 border-indigo-500/40 hover:border-indigo-400/70 rounded-2xl transition-all group">
          <div className="w-12 h-12 rounded-xl bg-indigo-900/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus size={22} className="text-indigo-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-zinc-200">Nouvelle créative</div>
            <div className="text-xs text-zinc-500 mt-1">Uploader une ad concurrente</div>
          </div>
        </button>
      </div>

      <button onClick={onNext} className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm rounded-xl transition-colors">
        Passer →
      </button>
    </div>
  );
}

// Step 4: Export & recap
function StepExport({ sessionData, onDone }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-100 mb-1">Export & Récap</h2>
        <p className="text-sm text-zinc-400">Session terminée.</p>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="text-sm font-bold text-emerald-300">Session complétée</span>
        </div>
        <div className="space-y-1 text-xs text-zinc-400">
          {sessionData.updated > 0 && <div>• {sessionData.updated} résultat{sessionData.updated > 1 ? 's' : ''} mis à jour</div>}
          {sessionData.winner && <div>• Winner identifié : "{sessionData.winner.content?.headline || sessionData.winner.name}"</div>}
          {sessionData.nextTest && <div>• Prochain test suggéré : {VARIABLE_ICONS[sessionData.nextTest]} {VARIABLE_LABELS[sessionData.nextTest]}</div>}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <button onClick={() => toast.success('Export ZIP — fonctionnalité disponible dans la bibliothèque')}
          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-colors">
          <Download size={16} /> Exporter les nouvelles créatives (ZIP)
        </button>
      </div>

      <button onClick={onDone}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-colors">
        <CheckCircle2 size={16} /> Terminer la session
      </button>
    </div>
  );
}

export default function QuickSessionPage({ onNavigate }) {
  const [step, setStep] = useState(0);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState(null);
  const [sortBy, setSortBy] = useState('ctr');
  const [updatedCount, setUpdatedCount] = useState(0);
  const [nextTest, setNextTest] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/creatives');
      setCreatives(data);
    } catch { toast.error('Erreur de chargement'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const testing = creatives.filter(c => c.performance?.status === 'testing');
  const withResults = creatives.filter(c => c.performance?.ctr != null || c.performance?.status);

  const handleUpdate = (c) => {
    setCreatives(prev => prev.map(x => x.id === (c?.id) ? { ...x, ...c } : x));
    setUpdatedCount(n => n + 1);
  };

  const handleWinnerSelected = (w) => {
    setWinner(w);
    const tested = creatives.filter(c => c.parent_creative_id === w?.id).map(c => c.test_variable).filter(Boolean);
    const next = VARIABLE_HIERARCHY.find(v => !tested.includes(v));
    setNextTest(next);
  };

  const sessionData = { updated: updatedCount, winner, nextTest };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => onNavigate?.('dashboard')} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-amber-900/30 border border-amber-700/30 flex items-center justify-center">
            <Zap size={17} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Session rapide</h1>
            <p className="text-xs text-zinc-500">Mettre à jour, analyser et générer en 15 min</p>
          </div>
        </div>
        <StepIndicator current={step} />
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-zinc-600" /></div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {step === 0 && (
              <StepUpdate
                testing={testing}
                onUpdate={handleUpdate}
                onNext={() => setStep(1)}
                onSkip={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <StepWinner
                creatives={creatives}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onNext={() => setStep(2)}
                onIterate={(w) => { handleWinnerSelected(w); onNavigate?.('iterate'); }}
              />
            )}
            {step === 2 && (
              <StepGenerate
                winner={winner}
                onGoIterate={() => onNavigate?.('iterate')}
                onGoCreate={() => onNavigate?.('ai-creator')}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepExport
                sessionData={sessionData}
                onDone={() => onNavigate?.('dashboard')}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
