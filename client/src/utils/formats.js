export const FORMAT_CATEGORIES = [
  {
    id: 'facebook_instagram',
    label: 'Facebook / Instagram',
    icon: '📱',
    formats: [
      {
        id: 'fb_feed_square',
        label: 'Feed carré',
        width: 1080,
        height: 1080,
        description: 'Feed Facebook & Instagram',
        tags: ['facebook', 'instagram', 'feed'],
      },
      {
        id: 'fb_feed_portrait',
        label: 'Feed portrait',
        width: 1080,
        height: 1350,
        description: 'Feed portrait — recommandé',
        recommended: true,
        tags: ['facebook', 'instagram', 'feed'],
      },
      {
        id: 'fb_story',
        label: 'Story / Reel',
        width: 1080,
        height: 1920,
        description: 'Stories & Reels Instagram / Facebook',
        tags: ['facebook', 'instagram', 'story', 'reel'],
      },
      {
        id: 'fb_carousel',
        label: 'Carrousel',
        width: 1080,
        height: 1080,
        description: 'Slide de carrousel',
        tags: ['facebook', 'instagram', 'carousel'],
      },
    ],
  },
  {
    id: 'ecommerce',
    label: 'Site e-commerce',
    icon: '🛒',
    formats: [
      {
        id: 'hero_desktop',
        label: 'Hero desktop',
        width: 1920,
        height: 700,
        description: 'Bannière hero desktop',
        tags: ['ecommerce', 'hero', 'desktop'],
      },
      {
        id: 'hero_mobile',
        label: 'Hero mobile',
        width: 750,
        height: 1000,
        description: 'Bannière hero mobile',
        tags: ['ecommerce', 'hero', 'mobile'],
      },
      {
        id: 'promo_banner',
        label: 'Bannière promo',
        width: 1200,
        height: 400,
        description: 'Bannière promotionnelle',
        tags: ['ecommerce', 'promo', 'banner'],
      },
      {
        id: 'category_banner',
        label: 'Bannière catégorie',
        width: 1920,
        height: 500,
        description: 'Bannière de catégorie',
        tags: ['ecommerce', 'category'],
      },
      {
        id: 'product_card',
        label: 'Card produit',
        width: 800,
        height: 800,
        description: 'Carte produit carrée',
        tags: ['ecommerce', 'product'],
      },
      {
        id: 'product_card_v',
        label: 'Card produit verticale',
        width: 600,
        height: 900,
        description: 'Carte produit verticale',
        tags: ['ecommerce', 'product'],
      },
      {
        id: 'popup_promo',
        label: 'Pop-up promo',
        width: 600,
        height: 800,
        description: 'Pop-up promotionnel',
        tags: ['ecommerce', 'popup'],
      },
      {
        id: 'email_header',
        label: 'Email header',
        width: 600,
        height: 300,
        description: 'En-tête d\'email',
        tags: ['email', 'header'],
      },
    ],
  },
  {
    id: 'autres',
    label: 'Autres',
    icon: '🌐',
    formats: [
      {
        id: 'open_graph',
        label: 'Open Graph',
        width: 1200,
        height: 630,
        description: 'Partage social (SEO)',
        tags: ['social', 'seo'],
      },
      {
        id: 'pinterest',
        label: 'Pinterest',
        width: 1000,
        height: 1500,
        description: 'Épingle Pinterest',
        tags: ['pinterest'],
      },
      {
        id: 'google_medium',
        label: 'Google Display Medium',
        width: 300,
        height: 250,
        description: 'Google Display Rectangle',
        tags: ['google', 'display'],
      },
      {
        id: 'google_leaderboard',
        label: 'Google Leaderboard',
        width: 728,
        height: 90,
        description: 'Google Display Leaderboard',
        tags: ['google', 'display'],
      },
      {
        id: 'google_skyscraper',
        label: 'Google Skyscraper',
        width: 160,
        height: 600,
        description: 'Google Display Skyscraper',
        tags: ['google', 'display'],
      },
    ],
  },
];

export const DEFAULT_FORMAT = FORMAT_CATEGORIES[0].formats[1]; // fb_feed_portrait 1080×1350

export function getFormatById(id) {
  for (const cat of FORMAT_CATEGORIES) {
    const found = cat.formats.find(f => f.id === id);
    if (found) return found;
  }
  return null;
}

export function getRatioLabel(width, height) {
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const d = gcd(width, height);
  return `${width / d}:${height / d}`;
}

export function getOrientationLabel(width, height) {
  if (width === height) return 'Carré';
  if (width > height) return 'Paysage';
  return 'Portrait';
}
