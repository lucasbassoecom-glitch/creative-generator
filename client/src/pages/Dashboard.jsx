import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Plus, RefreshCw, Zap, Trophy, Clock, ArrowRight,
  TrendingUp, Target, BarChart2, Sparkles, Package,
  Users, BookImage, ScanSearch, ChevronRight, AlertCircle,
} from 'lucide-react';

const VARIABLE_HIERARCHY = ['headline', 'colors', 'angle', 'structure', 'cta'];
const VARIABLE_LABELS = {
  headline: 'Headlines', colors: 'Couleurs', angle: 'Angles', structure: 'Structure', cta: 'CTA',
};
const VARIABLE_ICONS = { headline: '🔤', colors: '🎨', angle: '🎯', structure: '📐', cta: '🔁' };

const PERF_STATUS = {
  winner:      { label: 'Winner',    color: 'text-yellow-400', bg: 'bg-yellow-900/20', dot: 'bg-yellow-400' },
  potential:   { label: 'Potentiel', color: 'text-blue-400',   bg: 'bg-blue-900/20',   dot: 'bg-blue-400' },
  loser:       { label: 'Loser',     color: 'text-red-400',    bg: 'bg-red-900/20',     dot: 'bg-red-400' },
  testing:     { label: 'En test',   color: 'text-amber-400',  bg: 'bg-amber-900/20',  dot: 'bg-amber-400' },
  not_launched:{ label: 'Pas lancé', color: 'text-zinc-500',   bg: 'bg-zinc-800',       dot: 'bg-zinc-600' },
};

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'à l\'instant';
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-zinc-800 rounded w-2/3 mb-2" />
      <div className="h-5 bg-zinc-800 rounded w-1/2 mb-1" />
      <div className="h-3 bg-zinc-800 rounded w-1/3" />
    </div>
  );
}

function PerfBadge({ status }) {
  const cfg = PERF_STATUS[status];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function Dashboard({ onNavigate }) {
  const [creatives, setCreatives] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiCost, setApiCost] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: c }, { data: s }] = await Promise.all([
        axios.get('/api/creatives'),
        axios.get('/api/analytics/stats'),
      ]);
      setCreatives(c);
      setStats(s);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Derived data
  const testing = creatives.filter(c => c.performance?.status === 'testing');
  const withResults = creatives.filter(c => c.performance?.ctr != null);
  const winner = creatives
    .filter(c => c.performance?.status === 'winner')
    .sort((a, b) => (parseFloat(b.performance?.ctr) || 0) - (parseFloat(a.performance?.ctr) || 0))[0]
    || withResults.sort((a, b) => (parseFloat(b.performance?.ctr) || 0) - (parseFloat(a.performance?.ctr) || 0))[0];

  const recent = [...creatives].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);

  // Next test suggestion
  const nextTestSuggestion = (() => {
    if (!winner) return null;
    const testedVars = creatives
      .filter(c => c.parent_creative_id === winner.id || c.source_creative_id === winner.id)
      .map(c => c.test_variable)
      .filter(Boolean);
    const nextVar = VARIABLE_HIERARCHY.find(v => !testedVars.includes(v));
    if (!nextVar) return null;
    const prevVar = testedVars[testedVars.length - 1];
    return { variable: nextVar, prevVariable: prevVar, winnerName: winner.name };
  })();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
            <p className="text-sm text-zinc-500">Ton atelier créatif quotidien</p>
          </div>
        </div>
        {stats && stats.tested > 0 && (
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span><span className="text-zinc-200 font-semibold">{stats.total}</span> créatives</span>
            <span><span className="text-zinc-200 font-semibold">{stats.tested}</span> testées</span>
            {stats.win_rate > 0 && <span><span className="text-yellow-400 font-semibold">{stats.win_rate}%</span> win rate</span>}
          </div>
        )}
      </div>

      {/* 3 Primary CTAs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => onNavigate('ai-creator')}
          className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all group shadow-lg shadow-indigo-900/30"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus size={22} className="text-white" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base leading-tight">Nouvelle créative</div>
            <div className="text-xs text-indigo-200 mt-0.5">Analyser + générer 4 variantes</div>
          </div>
          <ArrowRight size={16} className="ml-auto opacity-60" />
        </button>

        <button
          onClick={() => onNavigate('iterate')}
          className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-900 border-2 border-violet-500/40 hover:border-violet-400/70 hover:bg-violet-950/20 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-900/40 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <RefreshCw size={22} className="text-violet-400" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base text-zinc-100 leading-tight">Itérer sur un winner</div>
            <div className="text-xs text-zinc-500 mt-0.5">Tester une seule variable à la fois</div>
          </div>
          <ArrowRight size={16} className="ml-auto text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>

        <button
          onClick={() => onNavigate('quick-session')}
          className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-900 border-2 border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-950/10 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-900/30 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Zap size={22} className="text-amber-400" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base text-zinc-100 leading-tight">Session rapide</div>
            <div className="text-xs text-zinc-500 mt-0.5">Mettre à jour + générer en 15 min</div>
          </div>
          <ArrowRight size={16} className="ml-auto text-zinc-600 group-hover:text-zinc-400 transition-colors" />
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center gap-3 mb-8 text-[10px] text-zinc-600">
        <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500">N</kbd> Nouvelle créative
        <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500">I</kbd> Itérer
        <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500">S</kbd> Session rapide
        <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500">A</kbd> Analytics
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: En cours + Winner */}
        <div className="col-span-2 space-y-6">

          {/* En cours */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-400" />
                <span className="text-sm font-semibold text-zinc-200">En test</span>
                {testing.length > 0 && (
                  <span className="text-xs font-bold text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full">{testing.length}</span>
                )}
              </div>
              {testing.length > 0 && (
                <button onClick={() => onNavigate('library')} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Mettre à jour →
                </button>
              )}
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2].map(i => <SkeletonCard key={i} />)}</div>
            ) : testing.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
                <Clock size={20} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-600">Aucune créative en test</p>
                <p className="text-[10px] text-zinc-700 mt-1">Lance des créatives et entre les résultats dans la bibliothèque</p>
              </div>
            ) : (
              <div className="space-y-2">
                {testing.slice(0, 4).map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-xl border border-zinc-800">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-zinc-200 truncate">{c.name || c.content?.headline || 'Sans nom'}</div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {c.test_variable && <span className="mr-2">{VARIABLE_ICONS[c.test_variable]} {VARIABLE_LABELS[c.test_variable]}</span>}
                        {formatDate(c.updatedAt || c.createdAt)}
                      </div>
                    </div>
                    {c.performance?.ctr && (
                      <span className="text-xs font-bold text-amber-300">{c.performance.ctr}%</span>
                    )}
                  </div>
                ))}
                {testing.length > 4 && (
                  <button onClick={() => onNavigate('library')} className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400 py-1 transition-colors">
                    +{testing.length - 4} autres
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Winner actuel */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-yellow-400" />
              <span className="text-sm font-semibold text-zinc-200">Winner actuel</span>
            </div>
            {loading ? <SkeletonCard /> : !winner ? (
              <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
                <Trophy size={20} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-600">Pas encore de winner</p>
                <p className="text-[10px] text-zinc-700 mt-1">Entre les résultats de tes créatives dans la bibliothèque</p>
                <button onClick={() => onNavigate('library')} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Ouvrir la bibliothèque →
                </button>
              </div>
            ) : (
              <div className="bg-zinc-800/40 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PerfBadge status={winner.performance?.status || 'winner'} />
                    </div>
                    <div className="text-sm font-bold text-zinc-100 truncate">{winner.content?.headline || winner.name || 'Creative'}</div>
                    {winner.content?.angle && <div className="text-xs text-zinc-500 mt-0.5">{VARIABLE_ICONS.angle} {winner.content.angle}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    {winner.performance?.ctr && (
                      <div>
                        <div className="text-xl font-black text-yellow-400">{winner.performance.ctr}%</div>
                        <div className="text-[9px] text-zinc-500">CTR</div>
                      </div>
                    )}
                    {winner.performance?.cpa && (
                      <div className="mt-1">
                        <div className="text-sm font-bold text-emerald-400">{winner.performance.cpa}€</div>
                        <div className="text-[9px] text-zinc-500">CPA</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onNavigate('iterate')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <RefreshCw size={12} /> Itérer dessus
                  </button>
                  <button
                    onClick={() => onNavigate('library')}
                    className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Voir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Prochain test suggéré */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={15} className="text-indigo-400" />
              <span className="text-sm font-semibold text-zinc-200">Prochain test</span>
            </div>
            {loading ? <SkeletonCard /> : !nextTestSuggestion ? (
              <div className="text-center py-6">
                <Target size={18} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-[10px] text-zinc-600 leading-relaxed">
                  {winner
                    ? 'Toutes les variables ont été testées sur ce winner. Lance une nouvelle créative.'
                    : 'Lance ta première créative et entre les résultats pour obtenir des suggestions.'}
                </p>
                <button onClick={() => onNavigate('ai-creator')} className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Nouvelle créative →
                </button>
              </div>
            ) : (
              <div>
                {nextTestSuggestion.prevVariable && (
                  <p className="text-[10px] text-zinc-500 mb-3">
                    Tu as testé les {VARIABLE_LABELS[nextTestSuggestion.prevVariable].toLowerCase()}. Prochaine étape :
                  </p>
                )}
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-3 mb-3">
                  <div className="text-lg mb-1">{VARIABLE_ICONS[nextTestSuggestion.variable]}</div>
                  <div className="text-sm font-bold text-indigo-300">
                    Tester les {VARIABLE_LABELS[nextTestSuggestion.variable].toLowerCase()}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Sur : "{nextTestSuggestion.winnerName}"
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {VARIABLE_HIERARCHY.map((v, i) => {
                    const tested = creatives.filter(c => c.parent_creative_id === winner?.id).map(c => c.test_variable).includes(v);
                    const isCurrent = v === nextTestSuggestion.variable;
                    return (
                      <div key={v} className={`flex-1 h-1 rounded-full ${tested ? 'bg-indigo-500' : isCurrent ? 'bg-indigo-300 animate-pulse' : 'bg-zinc-800'}`} title={VARIABLE_LABELS[v]} />
                    );
                  })}
                </div>
                <button
                  onClick={() => onNavigate('iterate')}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <RefreshCw size={12} /> Lancer ce test
                </button>
              </div>
            )}
          </div>

          {/* Stats rapides */}
          {stats && (stats.total > 0 || !loading) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 size={15} className="text-emerald-400" />
                  <span className="text-sm font-semibold text-zinc-200">Stats</span>
                </div>
                <button onClick={() => onNavigate('analytics')} className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  Voir tout →
                </button>
              </div>
              {loading ? <div className="space-y-2">{[1,2].map(i => <SkeletonCard key={i} />)}</div> : (
                <div className="space-y-2">
                  {[
                    { label: 'Créatives', value: stats.total, icon: BookImage, color: 'text-zinc-300' },
                    { label: 'Testées', value: stats.tested, icon: Target, color: 'text-amber-400' },
                    { label: 'Winners', value: stats.winners, icon: Trophy, color: 'text-yellow-400' },
                    stats.avg_ctr > 0 && { label: 'CTR moyen', value: `${stats.avg_ctr}%`, icon: TrendingUp, color: 'text-emerald-400' },
                    stats.avg_cpa > 0 && { label: 'CPA moyen', value: `${stats.avg_cpa}€`, icon: TrendingUp, color: 'text-blue-400' },
                  ].filter(Boolean).map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={12} className="text-zinc-600" />
                        <span className="text-xs text-zinc-500">{label}</span>
                      </div>
                      <span className={`text-xs font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activité récente */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-200">Activité récente</span>
            </div>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
            ) : recent.length === 0 ? (
              <div className="text-center py-6">
                <Sparkles size={18} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-[10px] text-zinc-600">Aucune activité</p>
                <button onClick={() => onNavigate('ai-creator')} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Créer maintenant →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recent.map(c => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-zinc-800/40 transition-colors cursor-pointer group" onClick={() => onNavigate('library')}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${PERF_STATUS[c.performance?.status]?.dot || 'bg-zinc-700'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-zinc-300 truncate">
                        {c.content?.headline || c.name || 'Créative'}
                      </div>
                      <div className="text-[9px] text-zinc-600">{formatDate(c.updatedAt || c.createdAt)}</div>
                    </div>
                    <ChevronRight size={10} className="text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom quick nav */}
      <div className="mt-8 flex items-center gap-3">
        <span className="text-[10px] text-zinc-700 uppercase tracking-wider font-semibold">Accès rapide</span>
        {[
          { label: 'Personas', page: 'personas', icon: Users },
          { label: 'Produits', page: 'products', icon: Package },
          { label: 'Templates', page: 'templates', icon: ScanSearch },
          { label: 'Bibliothèque', page: 'library', icon: BookImage },
          { label: 'Analytics', page: 'analytics', icon: BarChart2 },
        ].map(({ label, page, icon: Icon }) => (
          <button key={page} onClick={() => onNavigate(page)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg text-xs text-zinc-500 hover:text-zinc-300 transition-all">
            <Icon size={11} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
