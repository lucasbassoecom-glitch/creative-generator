import { getFontById, DEFAULT_FONT } from './fonts';
import { getPaletteById, DEFAULT_PALETTE } from './palettes';

/**
 * Build the context object passed to every template render function.
 * Merges product + persona data with styling options and user overrides.
 */
export function buildContext({ product = {}, persona = {}, palette: paletteId, font: fontId, overrides = {} }) {
  const palette = getPaletteById(paletteId) || DEFAULT_PALETTE;
  const font = getFontById(fontId) || DEFAULT_FONT;

  // Compute discount
  const price = parseFloat(product.price) || 0;
  const originalPrice = parseFloat(product.originalPrice) || 0;
  const discount = price && originalPrice && originalPrice > price
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  // Format rating
  const rating = parseFloat(product.rating) || 0;
  const stars = rating > 0 ? '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating)) : '';

  // Primary pain point + verbatim
  const sortedPains = [...(persona.pain_points || [])].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
  const painPoint = sortedPains[0]?.text || '';
  const verbatim = persona.verbatims?.[0] || '';
  const motivation = persona.motivations?.[0] || '';

  // Default content (overridable by Claude generation in step 7)
  const headline = overrides.headline ?? (product.tagline || product.name || 'Votre produit');
  const subheadline = overrides.subheadline ?? (product.benefits?.[0] || '');
  const ctaText = overrides.ctaText ?? 'Découvrir maintenant';
  const badgeText = overrides.badgeText ?? (
    discount > 0 ? `-${discount}%` : (product.offer ? product.offer : '')
  );

  // Image URL: resolve to absolute if it starts with /uploads
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : 'http://localhost:3001';

  const resolveImg = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${baseUrl}${path}`;
  };

  const packshot = resolveImg(product.packshot || '');
  const gallery = (product.gallery || []).map(resolveImg);

  return {
    // Product
    productName: product.name || 'Produit',
    brand: product.brand || '',
    tagline: product.tagline || '',
    packshot,
    gallery,
    benefits: product.benefits?.filter(Boolean) || [],
    usps: product.usps?.filter(Boolean) || [],
    certifications: product.certifications || [],
    price: price ? `${price.toFixed(2)}€` : '',
    originalPrice: originalPrice ? `${originalPrice.toFixed(2)}€` : '',
    priceRaw: price,
    originalPriceRaw: originalPrice,
    offer: product.offer || '',
    discount,
    rating,
    stars,
    reviewCount: product.reviewCount || '',
    recommendRate: product.recommendRate || '',

    // Persona
    personaName: persona.name || '',
    painPoint,
    verbatim,
    motivation,
    awarenessLevel: persona.awareness_level || 'problem_aware',

    // Generated / editable content
    headline,
    subheadline,
    ctaText,
    badgeText,

    // Styling
    palette,
    ...palette,          // spread palette props for easy access in templates
    fontFamily: font.family,
    fontUrl: font.url,
    fontId: font.id,

    // Computed
    hasPriceOffer: discount > 0 || !!product.offer,
    hasRating: rating > 0,
    hasPackshot: !!packshot,
  };
}

/**
 * Render a template to an HTML string.
 */
export function renderTemplate(template, context, format) {
  if (!template || typeof template.render !== 'function') {
    throw new Error(`Template "${template?.id}" has no render function`);
  }
  return template.render(context, format);
}
