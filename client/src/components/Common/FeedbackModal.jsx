import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Trophy, Zap, TrendingDown, Clock, Ban, Loader2, BarChart2 } from 'lucide-react';

const STATUSES = [
  { id: 'winner',      icon: '🏆', label: 'Winner',    color: 'border-yellow-500/60 bg-yellow-900/20 text-yellow-300' },
  { id: 'potential',   icon: '⚡', label: 'Potentiel', color: 'border-blue-500/60 bg-blue-900/20 text-blue-300' },
  { id: 'loser',       icon: '❌', label: 'Loser',     color: 'border-red-500/60 bg-red-900/20 text-red-300' },
  { id: 'testing',     icon: '⏳', label: 'En test',   color: 'border-amber-500/60 bg-amber-900/20 text-amber-300' },
  { id: 'not_launched',icon: '🚫', label: 'Pas lancé', color: 'border-zinc-600 bg-zinc-800 text-zinc-400' },
];

const PLATFORMS = ['facebook', 'instagram', 'les deux'];
const PLACEMENTS = ['Feed', 'Story', 'Reel', 'Explore', 'Bannière'];

export default function FeedbackModal({ creative, onClose, onSaved }) {
  const existing = creative?.performance || {};
  const [status, setStatus] = useState(existing.status || '');
  const [ctr, setCtr] = useState(existing.ctr != null ? String(existing.ctr) : '');
  const [cpa, setCpa] = useState(existing.cpa != null ? String(existing.cpa) : '');
  const [budget, setBudget] = useState(existing.budget_spent != null ? String(existing.budget_spent) : '');
  const [roas, setRoas] = useState(existing.roas != null ? String(existing.roas) : '');
  const [cpm, setCpm] = useState(existing.cpm != null ? String(existing.cpm) : '');
  const [impressions, setImpressions] = useState(existing.impressions != null ? String(existing.impressions) : '');
  const [platform, setPlatform] = useState(existing.platform || '');
  const [placement, setPlacement] = useState(existing.placement || '');
  const [duration, setDuration] = useState(existing.test_duration_days != null ? String(existing.test_duration_days) : '');
  const [notes, setNotes] = useState(existing.notes || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!status) return toast.error('Sélectionne un statut');
    setSaving(true);
    try {
      const performance = {
        status,
        ctr: ctr ? parseFloat(ctr) : null,
        cpa: cpa ? parseFloat(cpa) : null,
        budget_spent: budget ? parseFloat(budget) : null,
        roas: roas ? parseFloat(roas) : null,
        cpm: cpm ? parseFloat(cpm) : null,
        impressions: impressions ? parseInt(impressions) : null,
        platform: platform || null,
        placement: placement || null,
        test_duration_days: duration ? parseInt(duration) : null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      };
      await axios.put(`/api/creatives/${creative.id}`, { performance });
      onSaved?.();
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-zinc-100">Résultats</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500"><X size={15} /></button>
        </div>

        {/* Creative name */}
        <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="text-xs text-zinc-400 truncate">{creative?.content?.headline || creative?.name || 'Créative'}</div>
        </div>

        <div className="p-5 space-y-4">
          {/* Status — required */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
              Statut <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                    status === s.id ? s.color : 'border-zinc-800 text-zinc-600 hover:border-zinc-600'
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="text-[9px] font-semibold leading-tight">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CTR + CPA — primary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">CTR (%)</label>
              <input
                type="number" step="0.1" min="0" max="100"
                value={ctr} onChange={e => setCtr(e.target.value)}
                placeholder="2.3"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">CPA (€)</label>
              <input
                type="number" step="0.01" min="0"
                value={cpa} onChange={e => setCpa(e.target.value)}
                placeholder="12.50"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showAdvanced ? '▲' : '▼'} Champs optionnels (budget, ROAS, plateforme…)
          </button>

          {showAdvanced && (
            <div className="space-y-3 border-t border-zinc-800 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Budget dépensé (€)</label>
                  <input type="number" step="1" min="0" value={budget} onChange={e => setBudget(e.target.value)} placeholder="25"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">ROAS</label>
                  <input type="number" step="0.1" min="0" value={roas} onChange={e => setRoas(e.target.value)} placeholder="3.5"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">CPM (€)</label>
                  <input type="number" step="0.1" min="0" value={cpm} onChange={e => setCpm(e.target.value)} placeholder="8.00"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Impressions</label>
                  <input type="number" step="1" min="0" value={impressions} onChange={e => setImpressions(e.target.value)} placeholder="10000"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Durée test (jours)</label>
                  <input type="number" step="1" min="0" value={duration} onChange={e => setDuration(e.target.value)} placeholder="3"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Plateforme</label>
                  <select value={platform} onChange={e => setPlatform(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-indigo-500 appearance-none">
                    <option value="">—</option>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Placement</label>
                  <select value={placement} onChange={e => setPlacement(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-400 focus:outline-none focus:border-indigo-500 appearance-none">
                    <option value="">—</option>
                    {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Observations, contexte…"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-zinc-800">
          <button onClick={onClose} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-colors">
            Annuler
          </button>
          <button onClick={handleSave} disabled={!status || saving}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
              status && !saving ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</> : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
