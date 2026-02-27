import { useEffect, useState } from 'react';
import { Sparkles, Users, Package, ScanSearch, Layers, BookImage, ArrowRight, Zap } from 'lucide-react';
import axios from 'axios';

const STAT_CARDS = [
  { label: 'Personas', key: 'personas', icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  { label: 'Produits', key: 'products', icon: Package, color: 'text-emerald-400', bg: 'bg-emerald-900/20' },
  { label: 'Templates', key: 'templates', icon: ScanSearch, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  { label: 'Créatives', key: 'creatives', icon: BookImage, color: 'text-orange-400', bg: 'bg-orange-900/20' },
];

const QUICK_ACTIONS = [
  { label: 'Nouveau persona', page: 'personas', icon: Users, description: 'Uploader et parser un document persona' },
  { label: 'Nouveau produit', page: 'products', icon: Package, description: 'Ajouter un produit avec son packshot' },
  { label: 'Analyser un concurrent', page: 'templates', icon: ScanSearch, description: 'Analyser une créative concurrente' },
  { label: 'Générer des créatives', page: 'generator', icon: Sparkles, description: 'Créer 4 variantes en un clic', accent: true },
];

export default function Dashboard({ onNavigate }) {
  const [counts, setCounts] = useState({ personas: 0, products: 0, templates: 0, creatives: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/personas'),
      axios.get('/api/products'),
      axios.get('/api/templates'),
      axios.get('/api/creatives'),
    ])
      .then(([p, pr, t, c]) => {
        setCounts({
          personas: p.data.length,
          products: pr.data.length,
          templates: t.data.length,
          creatives: c.data.length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Creative Generator</h1>
            <p className="text-sm text-zinc-500">Générateur de créatives publicitaires IA</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, key, icon: Icon, color, bg }) => (
          <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <div className="text-2xl font-bold text-zinc-100">
              {loading ? <span className="text-zinc-600">—</span> : counts[key]}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ label, page, icon: Icon, description, accent }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all group ${
                accent
                  ? 'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/20 hover:border-indigo-500/60'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                accent ? 'bg-indigo-600' : 'bg-zinc-800'
              }`}>
                <Icon size={18} className={accent ? 'text-white' : 'text-zinc-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${accent ? 'text-indigo-300' : 'text-zinc-200'}`}>{label}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
              </div>
              <ArrowRight size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Getting started */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-400" />
          Workflow recommandé
        </h2>
        <ol className="space-y-3">
          {[
            { num: '1', text: 'Créer un persona → uploader votre document cible', page: 'personas' },
            { num: '2', text: 'Ajouter votre produit → packshot + informations', page: 'products' },
            { num: '3', text: 'Analyser un concurrent → créative de référence', page: 'templates' },
            { num: '4', text: 'Générer → 4 variantes créatives en un clic', page: 'generator' },
          ].map(({ num, text, page }) => (
            <li key={num} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-zinc-400">{num}</span>
              </div>
              <span className="text-sm text-zinc-400">{text}</span>
              <button
                onClick={() => onNavigate(page)}
                className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Ouvrir →
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
