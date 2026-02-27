import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Package, Plus, Upload, Trash2, Edit3, X, Check,
  Loader2, Star, ImagePlus, ChevronDown, ChevronUp,
  Tag, Award, BarChart2, Eye, ArrowUp, ArrowDown
} from 'lucide-react';
import { useProduct } from '../context/ProductContext';

// ─── Image uploader ───────────────────────────────────────────────────────────
function ImageUploader({ label, value, onChange, hint, accept = 'image/*' }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Fichier image requis (PNG, JPG, WEBP)');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axios.post('/api/upload/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.path);
      toast.success('Image uploadée');
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    upload(e.dataTransfer.files[0]);
  };

  return (
    <div>
      {label && <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">{label}</label>}
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="product"
            className="w-full h-40 object-contain bg-zinc-800/60 rounded-xl border border-zinc-700"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg"
            >
              Changer
            </button>
            <button
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-zinc-700 text-white text-xs font-medium rounded-lg"
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
            dragOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
          }`}
        >
          {uploading ? (
            <Loader2 size={20} className="text-indigo-400 animate-spin" />
          ) : (
            <>
              <ImagePlus size={20} className="text-zinc-500" />
              <span className="text-xs text-zinc-500">{hint || 'Glisse une image ou clique'}</span>
            </>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => upload(e.target.files[0])}
      />
    </div>
  );
}

// ─── Multi-image gallery uploader ─────────────────────────────────────────────
function GalleryUploader({ images = [], onChange }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const results = [];
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        const { data } = await axios.post('/api/upload/products', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        results.push(data.path);
      }
      onChange([...images, ...results]);
      toast.success(`${results.length} image${results.length > 1 ? 's' : ''} ajoutée${results.length > 1 ? 's' : ''}`);
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-2">
        Photos additionnelles
      </label>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative group aspect-square">
            <img src={img} alt="" className="w-full h-full object-contain bg-zinc-800/60 rounded-lg border border-zinc-700" />
            <button
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        ))}
        <label className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${uploading ? 'border-indigo-500' : 'border-zinc-700 hover:border-zinc-600'}`}>
          {uploading ? <Loader2 size={16} className="text-indigo-400 animate-spin" /> : <Plus size={16} className="text-zinc-500" />}
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => upload(Array.from(e.target.files))} />
        </label>
      </div>
    </div>
  );
}

// ─── Sortable list (benefits / USPs) ─────────────────────────────────────────
function SortableList({ items = [], onChange, placeholder, color = 'bg-indigo-500' }) {
  const move = (i, dir) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div className="flex flex-col gap-0.5 shrink-0">
            <button onClick={() => move(i, -1)} disabled={i === 0} className="disabled:opacity-20 text-zinc-600 hover:text-zinc-400"><ArrowUp size={10} /></button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="disabled:opacity-20 text-zinc-600 hover:text-zinc-400"><ArrowDown size={10} /></button>
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
          <input
            value={item}
            onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            placeholder={placeholder}
            className="flex-1 bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none transition-colors"
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all shrink-0">
            <X size={11} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ''])} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
        <Plus size={12} /> Ajouter
      </button>
    </div>
  );
}

// ─── Star rating input ────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onClick={() => onChange(i === value ? 0 : i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={18}
            className={i <= display ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="text-xs text-zinc-400 ml-1">{value.toFixed(1)}/5</span>
      )}
    </div>
  );
}

// ─── Product editor ───────────────────────────────────────────────────────────
function ProductEditor({ product, onSave, onCancel, isNew }) {
  const [data, setData] = useState(product);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState({ pricing: true, benefits: true, usps: false, certifications: false, reviews: false });

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!data.name?.trim()) return toast.error('Le nom du produit est requis');
    if (!data.brand?.trim()) return toast.error('Le nom de la marque est requis');
    setSaving(true);
    try { await onSave(data); } finally { setSaving(false); }
  };

  const Section = ({ k, label, icon: Icon, children }) => (
    <div className="border-t border-zinc-800 pt-4">
      <button onClick={() => setOpen(p => ({ ...p, [k]: !p[k] }))} className="w-full flex items-center justify-between py-1 mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} className="text-zinc-500" />}
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
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
          <div className="text-sm font-bold text-zinc-100">{isNew ? 'Nouveau produit' : 'Éditer le produit'}</div>
          <div className="text-xs text-zinc-500">Remplis les informations de ton produit</div>
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

        {/* Packshot */}
        <ImageUploader
          label="Packshot principal *"
          value={data.packshot}
          onChange={v => update('packshot', v)}
          hint="PNG fond transparent recommandé"
        />

        {/* Identity */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Nom du produit *</label>
              <input value={data.name || ''} onChange={e => update('name', e.target.value)} placeholder="Ex: Boost Énergie Pro" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Marque *</label>
              <input value={data.brand || ''} onChange={e => update('brand', e.target.value)} placeholder="Ex: VitalPure" className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 block mb-1">Tagline / claim principal</label>
            <input value={data.tagline || ''} onChange={e => update('tagline', e.target.value)} placeholder="Ex: Retrouvez votre énergie en 7 jours" className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none transition-colors" />
          </div>
        </div>

        {/* Pricing */}
        <Section k="pricing" label="Prix & offre" icon={Tag}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Prix actuel</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">€</span>
                  <input
                    type="number" step="0.01" value={data.price || ''} onChange={e => update('price', e.target.value)}
                    placeholder="49.90"
                    className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg pl-7 pr-3 py-2 text-sm text-zinc-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Prix barré</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">€</span>
                  <input
                    type="number" step="0.01" value={data.originalPrice || ''} onChange={e => update('originalPrice', e.target.value)}
                    placeholder="69.90"
                    className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg pl-7 pr-3 py-2 text-sm text-zinc-300 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 block mb-1">Offre en cours</label>
              <input value={data.offer || ''} onChange={e => update('offer', e.target.value)} placeholder="Ex: -30% + livraison gratuite, Lot 3 pour 2..." className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none transition-colors" />
            </div>
          </div>
        </Section>

        {/* Benefits */}
        <Section k="benefits" label="Bénéfices principaux" icon={BarChart2}>
          <SortableList
            items={data.benefits || []}
            onChange={v => update('benefits', v)}
            placeholder="Ex: Réduit la fatigue en 7 jours"
            color="bg-emerald-500"
          />
        </Section>

        {/* USPs */}
        <Section k="usps" label="USPs (arguments uniques)" icon={Award}>
          <SortableList
            items={data.usps || []}
            onChange={v => update('usps', v)}
            placeholder="Ex: Formule brevetée 100% naturelle"
            color="bg-blue-500"
          />
        </Section>

        {/* Certifications */}
        <Section k="certifications" label="Certifications & labels">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {['Bio', 'Vegan', 'Made in France', 'Sans gluten', 'Sans lactose', 'GMP', 'Halal', 'Kosher'].map(cert => (
                <button
                  key={cert}
                  onClick={() => {
                    const certs = data.certifications || [];
                    const exists = certs.includes(cert);
                    update('certifications', exists ? certs.filter(c => c !== cert) : [...certs, cert]);
                  }}
                  className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                    (data.certifications || []).includes(cert)
                      ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300'
                      : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  {cert}
                </button>
              ))}
            </div>
            <input
              placeholder="Autre certification (appuyer sur Entrée)"
              className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none transition-colors"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  update('certifications', [...(data.certifications || []), e.target.value.trim()]);
                  e.target.value = '';
                }
              }}
            />
          </div>
        </Section>

        {/* Reviews */}
        <Section k="reviews" label="Avis & évaluations" icon={Star}>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 block mb-2">Note moyenne</label>
              <StarRating
                value={parseFloat(data.rating) || 0}
                onChange={v => update('rating', v)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">Nombre d'avis</label>
                <input type="number" value={data.reviewCount || ''} onChange={e => update('reviewCount', e.target.value)} placeholder="Ex: 1247" className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 block mb-1">% recommandent</label>
                <input type="number" min="0" max="100" value={data.recommendRate || ''} onChange={e => update('recommendRate', e.target.value)} placeholder="Ex: 97" className="w-full bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none transition-colors" />
              </div>
            </div>
          </div>
        </Section>

        {/* Gallery */}
        <div className="border-t border-zinc-800 pt-4">
          <GalleryUploader
            images={data.gallery || []}
            onChange={v => update('gallery', v)}
          />
        </div>

      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onEdit, onDelete, isActive, onToggle }) {
  const discount = product.price && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden transition-all ${isActive ? 'border-emerald-500/60 ring-1 ring-emerald-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
      {/* Packshot */}
      <div className="h-32 bg-zinc-800/50 flex items-center justify-center relative">
        {product.packshot ? (
          <img src={product.packshot} alt={product.name} className="h-full w-full object-contain p-3" />
        ) : (
          <Package size={32} className="text-zinc-600" />
        )}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            -{discount}%
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 right-2 bg-emerald-600 rounded-full p-1">
            <Check size={10} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-zinc-200 truncate">{product.name}</div>
            <div className="text-[10px] text-zinc-500">{product.brand}</div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => onToggle(product)} title={isActive ? 'Désactiver' : 'Activer pour le générateur'}
              className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-emerald-600/20 text-emerald-400' : 'hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300'}`}>
              {isActive ? <Check size={12} /> : <Eye size={12} />}
            </button>
            <button onClick={() => onEdit(product)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-all"><Edit3 size={12} /></button>
            <button onClick={() => onDelete(product.id)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-red-400 transition-all"><Trash2 size={12} /></button>
          </div>
        </div>

        {/* Tagline */}
        {product.tagline && (
          <p className="text-[11px] text-zinc-500 italic mb-2 truncate">"{product.tagline}"</p>
        )}

        {/* Price */}
        {product.price && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-zinc-200">{parseFloat(product.price).toFixed(2)}€</span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-600 line-through">{parseFloat(product.originalPrice).toFixed(2)}€</span>
            )}
            {product.offer && (
              <span className="text-[10px] text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded-full">{product.offer}</span>
            )}
          </div>
        )}

        {/* Benefits preview */}
        {product.benefits?.slice(0, 3).map((b, i) => (
          <div key={i} className="flex items-center gap-1.5 mb-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[10px] text-zinc-500 truncate">{b}</span>
          </div>
        ))}

        {/* Certifications */}
        {product.certifications?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-zinc-800">
            {product.certifications.slice(0, 4).map(c => (
              <span key={c} className="text-[9px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">{c}</span>
            ))}
            {product.certifications.length > 4 && (
              <span className="text-[9px] text-zinc-600">+{product.certifications.length - 4}</span>
            )}
          </div>
        )}

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800">
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] text-zinc-400 font-medium">{parseFloat(product.rating).toFixed(1)}</span>
            {product.reviewCount && <span className="text-[10px] text-zinc-600">({product.reviewCount} avis)</span>}
          </div>
        )}
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = {
  name: '', brand: '', tagline: '',
  packshot: '', gallery: [],
  price: '', originalPrice: '', offer: '',
  benefits: [''], usps: [''],
  certifications: [],
  rating: 0, reviewCount: '', recommendRate: '',
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { activeProduct, setActiveProduct } = useProduct();

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleNew = () => { setEditingProduct({ ...EMPTY_PRODUCT }); setPanel(true); };
  const handleEdit = (p) => { setEditingProduct(p); setPanel(true); };
  const closePanel = () => { setPanel(false); setEditingProduct(null); };

  const handleSave = async (data) => {
    try {
      if (data.id) {
        const { data: updated } = await axios.put(`/api/products/${data.id}`, data);
        if (activeProduct?.id === data.id) setActiveProduct(updated);
        toast.success('Produit mis à jour');
      } else {
        await axios.post('/api/products', data);
        toast.success('Produit créé !');
      }
      await fetchProducts();
      closePanel();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
      throw new Error('save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await axios.delete(`/api/products/${id}`);
      if (activeProduct?.id === id) setActiveProduct(null);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produit supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggle = (product) => {
    if (activeProduct?.id === product.id) {
      setActiveProduct(null);
    } else {
      setActiveProduct(product);
      toast.success(`Produit actif : ${product.name}`);
    }
  };

  return (
    <div className="flex h-full">
      {/* Main list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <Package size={17} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-zinc-100">Produits</h1>
                <p className="text-sm text-zinc-500">
                  {products.length} produit{products.length > 1 ? 's' : ''} enregistré{products.length > 1 ? 's' : ''}
                  {activeProduct && <span className="text-emerald-400 ml-2">· {activeProduct.name} actif</span>}
                </p>
              </div>
            </div>
            <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
              <Plus size={15} /> Nouveau produit
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="text-zinc-600 animate-spin" />
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-zinc-500" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">Aucun produit pour l'instant</h3>
              <p className="text-xs text-zinc-600 mb-5">
                Ajoute ton premier produit avec son packshot,<br />ses bénéfices et ses informations de prix.
              </p>
              <button onClick={handleNew} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors">
                <Plus size={15} /> Ajouter un produit
              </button>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isActive={activeProduct?.id === p.id}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      {panel && editingProduct && (
        <div className="w-[480px] shrink-0 border-l border-zinc-800 bg-[#18181b] flex flex-col overflow-hidden">
          <ProductEditor
            product={editingProduct}
            isNew={!editingProduct.id}
            onSave={handleSave}
            onCancel={closePanel}
          />
        </div>
      )}
    </div>
  );
}
