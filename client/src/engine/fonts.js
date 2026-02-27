export const GOOGLE_FONTS = [
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', sans-serif",
    weights: '400;600;700;800;900',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', sans-serif",
    weights: '400;600;700;800;900',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    weights: '400;600;700;800;900',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap',
  },
  {
    id: 'oswald',
    name: 'Oswald',
    family: "'Oswald', sans-serif",
    weights: '400;500;600;700',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap',
  },
  {
    id: 'raleway',
    name: 'Raleway',
    family: "'Raleway', sans-serif",
    weights: '400;600;700;800;900',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800;900&display=swap',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    family: "'Nunito', sans-serif",
    weights: '400;600;700;800;900',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    weights: '400;700;800;900',
    category: 'serif',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800;900&display=swap',
  },
  {
    id: 'dm_sans',
    name: 'DM Sans',
    family: "'DM Sans', sans-serif",
    weights: '400;500;700',
    category: 'sans-serif',
    url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap',
  },
];

export const DEFAULT_FONT = GOOGLE_FONTS[0]; // Inter

export function getFontById(id) {
  return GOOGLE_FONTS.find(f => f.id === id) || DEFAULT_FONT;
}
