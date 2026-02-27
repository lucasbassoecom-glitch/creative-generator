import {
  LayoutDashboard,
  Users,
  Package,
  ScanSearch,
  Sparkles,
  BookImage,
  Layers,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader,
  LayoutTemplate,
} from 'lucide-react';
import FormatBadge from './FormatBadge';
import { usePersona } from '../../context/PersonaContext';
import { useProduct } from '../../context/ProductContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'separator1', type: 'separator', label: 'CRÉATION', group: 'create' },
  { id: 'formats', label: 'Formats', icon: LayoutTemplate, group: 'create' },
  { id: 'personas', label: 'Personas', icon: Users, group: 'create' },
  { id: 'products', label: 'Produits', icon: Package, group: 'create' },
  { id: 'templates', label: 'Templates concurrents', icon: ScanSearch, group: 'create' },
  { id: 'generator', label: 'Générateur', icon: Sparkles, group: 'create', accent: true },
  { id: 'separator2', type: 'separator', label: 'GESTION', group: 'manage' },
  { id: 'library', label: 'Bibliothèque', icon: BookImage, group: 'manage' },
  { id: 'batch', label: 'Batch & Export', icon: Layers, group: 'manage' },
];

function PersonaBadge({ onNavigate }) {
  const { activePersonas } = usePersona();
  if (activePersonas.length === 0) return (
    <button onClick={() => onNavigate('personas')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/40 border border-dashed border-zinc-800 hover:border-zinc-700 transition-all text-zinc-600 hover:text-zinc-400">
      <Users size={12} />
      <span className="text-[10px]">Aucun persona actif</span>
    </button>
  );
  return (
    <div className="flex flex-col gap-1">
      {activePersonas.map(p => (
        <button key={p.id} onClick={() => onNavigate('personas')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-900/20 border border-blue-800/40 hover:border-blue-700/60 transition-all">
          <Users size={12} className="text-blue-400 shrink-0" />
          <span className="text-[10px] font-semibold text-blue-300 truncate">{p.name}</span>
        </button>
      ))}
    </div>
  );
}

function ProductBadge({ onNavigate }) {
  const { activeProduct } = useProduct();
  if (!activeProduct) return (
    <button onClick={() => onNavigate('products')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/40 border border-dashed border-zinc-800 hover:border-zinc-700 transition-all text-zinc-600 hover:text-zinc-400">
      <Package size={12} />
      <span className="text-[10px]">Aucun produit actif</span>
    </button>
  );
  return (
    <button onClick={() => onNavigate('products')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/20 border border-emerald-800/40 hover:border-emerald-700/60 transition-all">
      {activeProduct.packshot ? (
        <img src={activeProduct.packshot} alt="" className="w-5 h-5 object-contain shrink-0" />
      ) : (
        <Package size={12} className="text-emerald-400 shrink-0" />
      )}
      <div className="flex-1 min-w-0 text-left">
        <div className="text-[10px] font-semibold text-emerald-300 truncate leading-none">{activeProduct.name}</div>
        {activeProduct.brand && <div className="text-[9px] text-emerald-600 mt-0.5">{activeProduct.brand}</div>}
      </div>
    </button>
  );
}

export default function Sidebar({ currentPage, onNavigate, apiStatus }) {
  return (
    <aside className="w-60 shrink-0 flex flex-col bg-[#18181b] border-r border-zinc-800 h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-100 leading-none">Creative</div>
            <div className="text-xs text-indigo-400 font-medium">Generator</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          if (item.type === 'separator') {
            return (
              <div key={item.id} className="pt-4 pb-1.5 px-2">
                <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
                  {item.label}
                </span>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? item.accent
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                    : 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
              }`}
            >
              <Icon
                size={16}
                className={isActive ? (item.accent ? 'text-white' : 'text-indigo-400') : 'text-zinc-500 group-hover:text-zinc-300'}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Sélections actives */}
      <div className="px-3 py-3 border-t border-zinc-800 space-y-2">
        <div>
          <div className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest mb-1 px-1">Persona</div>
          <PersonaBadge onNavigate={onNavigate} />
        </div>
        <div>
          <div className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest mb-1 px-1">Produit</div>
          <ProductBadge onNavigate={onNavigate} />
        </div>
        <div>
          <div className="text-[9px] font-semibold text-zinc-600 uppercase tracking-widest mb-1 px-1">Format</div>
          <FormatBadge />
        </div>
      </div>

      {/* API Status */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          {apiStatus === null && (
            <>
              <Loader size={12} className="text-zinc-500 animate-spin" />
              <span className="text-zinc-500">Connexion...</span>
            </>
          )}
          {apiStatus?.status === 'ok' && (
            <>
              <CheckCircle size={12} className={apiStatus.anthropic ? 'text-green-400' : 'text-yellow-400'} />
              <span className={apiStatus.anthropic ? 'text-green-400' : 'text-yellow-400'}>
                {apiStatus.anthropic ? 'API configurée' : 'Clé API manquante'}
              </span>
            </>
          )}
          {apiStatus?.status === 'error' && (
            <>
              <AlertCircle size={12} className="text-red-400" />
              <span className="text-red-400">Serveur hors ligne</span>
            </>
          )}
        </div>
        <div className="mt-2 text-[10px] text-zinc-600">
          localhost:3000 → :3001
        </div>
      </div>
    </aside>
  );
}
