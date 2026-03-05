import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  BarChart2, TrendingUp, Trophy, Target, Loader2, Brain,
  RefreshCw, ChevronDown, ChevronUp, AlertCircle, Info,
  ArrowLeft, Lightbulb, CheckCircle2,
} from 'lucide-react';

const CONFIDENCE_CFG = {
  'faible': { label: 'Faible confiance', color: 'text-amber-400', bg: 'bg-amber-900/20' },
  'moyen':  { label: 'Confiance moyenne', color: 'text-blue-400',  bg: 'bg-blue-900/20' },
  'élevé':  { label: 'Confiance élevée', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  'high':   { label: 'Confiance élevée', color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  'medium': { label: 'Confiance moyenne', color: 'text-blue-400',  bg: 'bg-blue-900/20' },
  'low':    { label: 'Faible confiance', color: 'text-amber-400', bg: 'bg-amber-900/20' },
  'none':   { label: 'Données insuffisantes', color: 'text-zinc-500', bg: 'bg-zinc-800' },
};

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-zinc-500">{label}</span>
        {Icon && <Icon size={14} className={color || 'text-zinc-600'} />}
      </div>
      <div className={`text-2xl font-black ${color || 'text-zinc-200'}`}>{value ?? '—'}</div>
      {sub && <div className="text-[10px] text-zinc-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function InsightCard({ insight }) {
  const conf = CONFIDENCE_CFG[insight.confidence] || CONFIDENCE_CFG['none'];
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{insight.icon || '💡'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-zinc-200 mb-1">{insight.label || insight.finding}</div>
          <div className="text-xs text-zinc-500 mb-2">{insight.detail || insight.action}</div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>
              {conf.label}
            </span>
            {insight.sample && (
              <span className="text-[9px] text-zinc-600">{insight.sample} créatives</span>
            )}
            {insight.sample_size && (
              <span className="text-[9px] text-zinc-600">{insight.sample_size} créatives</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisReport({ analysis }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!analysis) return null;

  const categoryLabels = {
    headlines: '🔤 Headlines', angles: '🎯 Angles', couleurs: '🎨 Couleurs',
    structure: '📐 Structure', framework: '📋 Frameworks', format: '📱 Formats',
    combinaisons: '🏆 Combinaisons gagnantes',
  };

  return (
    <div className="space-y-6">
      {analysis.summary && (
        <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Brain size={16} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-200 leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      )}

      {analysis.insights?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Insights</h3>
          <div className="space-y-3">
            {analysis.insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        </div>
      )}

      {analysis.winning_combinations?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Combinaisons gagnantes</h3>
          <div className="grid grid-cols-2 gap-3">
            {analysis.winning_combinations.map((c, i) => (
              <div key={i} className="bg-zinc-900 border border-yellow-500/20 rounded-xl p-3">
                <div className="text-xs font-semibold text-zinc-200 mb-1">{c.description}</div>
                <div className="flex gap-3 text-[10px]">
                  {c.ctr_avg && <span className="text-emerald-400">CTR {c.ctr_avg}%</span>}
                  {c.cpa_avg && <span className="text-blue-400">CPA {c.cpa_avg}€</span>}
                  {c.count && <span className="text-zinc-500">{c.count} créatives</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analysis.recommendations?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recommandations prioritaires</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((r, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">{r.priority || i + 1}</div>
                  <div>
                    <div className="text-sm font-bold text-zinc-200 mb-1">{r.title}</div>
                    <div className="text-xs text-zinc-400 mb-2 leading-relaxed">{r.brief}</div>
                    {r.rationale && <div className="text-[10px] text-zinc-600 italic">{r.rationale}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState({ insights: [], count: 0, confidence: 'none' });
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: s }, { data: ins }, { data: analytics }] = await Promise.all([
        axios.get('/api/analytics/stats'),
        axios.get('/api/analytics/insights'),
        axios.get('/api/analytics'),
      ]);
      setStats(s);
      setInsights(ins);
      if (analytics.analysis_history?.length > 0) {
        setLastAnalysis(analytics.analysis_history[0]);
      }
    } catch { toast.error('Erreur de chargement'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAnalyze = async () => {
    if (stats?.with_results < 10) {
      return toast.error(`Il te faut au moins 10 créatives testées (tu en as ${stats?.with_results || 0})`);
    }
    setAnalyzing(true);
    try {
      const { data } = await axios.post('/api/analytics/analyze');
      if (!data.success) throw new Error(data.error || 'Erreur');
      setLastAnalysis({ date: new Date().toISOString(), analysis: data.analysis, creatives_count: data.creatives_count });
      toast.success('Analyse terminée');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Erreur');
    } finally {
      setAnalyzing(false);
    }
  };

  const minRequired = 30;
  const hasEnough = stats?.with_results >= minRequired;
  const needMore = minRequired - (stats?.with_results || 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-zinc-800/60 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate?.('dashboard')} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="w-9 h-9 rounded-xl bg-emerald-900/30 border border-emerald-700/30 flex items-center justify-center">
            <BarChart2 size={17} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Analytics</h1>
            <p className="text-xs text-zinc-500">Performance & patterns de tes créatives</p>
          </div>
          <button onClick={load} className="ml-auto p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors" title="Actualiser">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-zinc-600" /></div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Stats overview */}
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Vue d'ensemble</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Créatives" value={stats?.total || 0} icon={BarChart2} color="text-zinc-200" />
                <StatCard label="Testées" value={stats?.tested || 0} sub={`sur ${stats?.total || 0}`} icon={Target} color="text-amber-400" />
                <StatCard label="Winners" value={stats?.winners || 0} sub={stats?.win_rate > 0 ? `${stats.win_rate}% win rate` : undefined} icon={Trophy} color="text-yellow-400" />
                <StatCard label="CTR moyen" value={stats?.avg_ctr > 0 ? `${stats.avg_ctr}%` : '—'} sub={stats?.avg_cpa > 0 ? `CPA ${stats.avg_cpa}€` : undefined} icon={TrendingUp} color="text-emerald-400" />
              </div>
            </div>

            {/* Top performers */}
            {stats?.top_by_ctr?.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Top performances</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs text-zinc-500 mb-2">Meilleur CTR</h3>
                    <div className="space-y-2">
                      {stats.top_by_ctr.slice(0, 3).map((c, i) => (
                        <div key={c.id} className="flex items-center gap-2 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                          <span className="text-[10px] font-black text-zinc-500 w-4">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-zinc-200 truncate">{c.content?.headline || c.name || '—'}</div>
                          </div>
                          <span className="text-xs font-bold text-emerald-400 shrink-0">{c.performance.ctr}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {stats.top_by_cpa?.length > 0 && (
                    <div>
                      <h3 className="text-xs text-zinc-500 mb-2">Meilleur CPA</h3>
                      <div className="space-y-2">
                        {stats.top_by_cpa.slice(0, 3).map((c, i) => (
                          <div key={c.id} className="flex items-center gap-2 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                            <span className="text-[10px] font-black text-zinc-500 w-4">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-zinc-200 truncate">{c.content?.headline || c.name || '—'}</div>
                            </div>
                            <span className="text-xs font-bold text-blue-400 shrink-0">{c.performance.cpa}€</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Automatic insights */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Insights automatiques</h2>
                <span className="text-[10px] text-zinc-600">{insights.count} créatives analysées</span>
              </div>

              {insights.count < insights.min_required && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Info size={14} className="text-zinc-500 shrink-0" />
                    <span>
                      {insights.count < 3
                        ? 'Aucune donnée disponible. Entre les résultats de tes créatives dans la bibliothèque.'
                        : `Données partielles — ${insights.min_required - insights.count} créatives testées de plus pour des insights fiables.`}
                    </span>
                  </div>
                </div>
              )}

              {insights.insights?.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {insights.insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
                </div>
              ) : insights.count >= 3 ? (
                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-xl">
                  <Lightbulb size={20} className="text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-600">Pas encore assez de diversité pour générer des insights.</p>
                </div>
              ) : null}
            </div>

            {/* Claude full analysis */}
            <div>
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">Analyse approfondie (Claude)</h2>

              {!hasEnough ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
                  <Brain size={24} className="text-zinc-600 mx-auto mb-3" />
                  <div className="text-sm font-semibold text-zinc-300 mb-2">
                    Analyse disponible à partir de {minRequired} créatives testées
                  </div>
                  <div className="text-xs text-zinc-500 mb-4">
                    Il te faut encore <span className="text-indigo-400 font-bold">{Math.max(0, needMore)} créative{needMore > 1 ? 's' : ''} testée{needMore > 1 ? 's' : ''}</span> pour une analyse fiable.
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((stats?.with_results || 0) / minRequired) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-600">{stats?.with_results || 0} / {minRequired}</div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-60 mb-6"
                  >
                    {analyzing
                      ? <><Loader2 size={16} className="animate-spin" /> Analyse en cours…</>
                      : <><Brain size={16} /> Analyser mes patterns</>}
                  </button>

                  {lastAnalysis && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-zinc-500">
                          Dernière analyse : {new Date(lastAnalysis.date).toLocaleDateString('fr-FR')} · {lastAnalysis.creatives_count} créatives
                        </span>
                      </div>
                      <AnalysisReport analysis={lastAnalysis.analysis} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
