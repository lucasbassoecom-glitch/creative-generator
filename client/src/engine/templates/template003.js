/**
 * Template 003 — Benefits Grid
 * Packshot top 45% + dark card bottom 55% with icon-grid benefits.
 * Best for: portrait, story formats.
 */
const template003 = {
  id: 'template003',
  name: 'Benefits Grid',
  description: 'Packshot haut, grille de bénéfices avec icônes',
  tags: ['benefits', 'grid', 'portrait', 'story'],
  previewBg: 'linear-gradient(135deg, #022c22, #065f46)',

  render(ctx, format) {
    const { width, height } = format;
    const isLandscape = width > height * 1.2;

    const basePx = Math.min(width, height);
    const headlineFontSize = Math.round(basePx / (isLandscape ? 13 : 10));
    const subFontSize = Math.round(headlineFontSize * 0.4);
    const brandFontSize = Math.round(headlineFontSize * 0.28);
    const benefitFontSize = Math.round(headlineFontSize * 0.33);
    const benefitLabelFontSize = Math.round(headlineFontSize * 0.25);
    const ctaFontSize = Math.round(headlineFontSize * 0.33);
    const pad = Math.round(basePx * 0.065);

    const topH = isLandscape ? Math.round(height * 0.55) : Math.round(height * 0.4);
    const bottomH = height - topH;

    // Benefit grid: up to 6 items in 2 or 3 columns
    const benefits = ctx.benefits.slice(0, 6);
    const cols = benefits.length <= 2 ? 2 : benefits.length <= 4 ? 2 : 3;

    // Benefit icon emoji mapping
    const ICONS = ['⚡', '🌿', '💪', '🔬', '✨', '🛡️'];

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${ctx.fontUrl}" rel="stylesheet">
<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    font-family: ${ctx.fontFamily};
    background: ${ctx.bgSolid};
  }
  /* ── TOP: image zone ── */
  .top {
    position: relative;
    width: 100%;
    height: ${topH}px;
    overflow: hidden;
    background: ${ctx.bg};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .top::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: ${Math.round(topH * 0.35)}px;
    background: linear-gradient(to bottom, transparent, ${ctx.bgSolid});
    pointer-events: none;
  }
  .top-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 70% at 50% 40%, ${ctx.primary}33 0%, transparent 70%);
  }
  .packshot {
    position: relative;
    z-index: 2;
    max-width: ${Math.round(width * 0.65)}px;
    max-height: ${Math.round(topH * 0.88)}px;
    object-fit: contain;
    filter: drop-shadow(0 ${Math.round(topH * 0.03)}px ${Math.round(topH * 0.08)}px rgba(0,0,0,0.6));
  }
  .packshot-placeholder {
    z-index: 2;
    font-size: ${Math.round(topH * 0.25)}px;
  }
  /* Brand pill top-right */
  .brand-pill {
    position: absolute;
    top: ${Math.round(topH * 0.07)}px;
    ${isLandscape ? 'left' : 'right'}: ${Math.round(width * 0.05)}px;
    z-index: 3;
    background: ${ctx.cardBg};
    border: 1px solid ${ctx.accent}44;
    color: ${ctx.accent};
    font-size: ${brandFontSize}px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: ${Math.round(brandFontSize * 0.4)}px ${Math.round(brandFontSize * 0.9)}px;
    border-radius: 999px;
    backdrop-filter: blur(4px);
  }
  /* Offer badge */
  .offer-badge {
    position: absolute;
    top: ${Math.round(topH * 0.07)}px;
    left: ${Math.round(width * 0.05)}px;
    z-index: 3;
    background: ${ctx.badge};
    color: ${ctx.badgeText};
    font-size: ${brandFontSize}px;
    font-weight: 900;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: ${Math.round(brandFontSize * 0.4)}px ${Math.round(brandFontSize * 0.9)}px;
    border-radius: 999px;
    transform: rotate(-3deg);
  }
  /* ── BOTTOM: text zone ── */
  .bottom {
    width: 100%;
    height: ${bottomH}px;
    background: ${ctx.bgSolid};
    padding: ${Math.round(basePx * 0.04)}px ${pad}px ${pad}px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .headline {
    font-size: ${headlineFontSize}px;
    font-weight: 900;
    line-height: 1.1;
    color: ${ctx.text};
    letter-spacing: -0.025em;
    margin-bottom: ${Math.round(height * 0.012)}px;
    text-shadow: 0 1px 10px rgba(0,0,0,0.3);
  }
  /* benefits grid */
  .benefit-grid {
    display: grid;
    grid-template-columns: repeat(${cols}, 1fr);
    gap: ${Math.round(basePx * 0.018)}px;
    flex: 1;
    align-content: start;
  }
  .benefit-card {
    background: ${ctx.cardBg};
    border: 1px solid ${ctx.accent}1a;
    border-radius: ${Math.round(basePx * 0.022)}px;
    padding: ${Math.round(benefitFontSize * 0.65)}px ${Math.round(benefitFontSize * 0.7)}px;
    display: flex;
    flex-direction: column;
    gap: ${Math.round(benefitFontSize * 0.3)}px;
  }
  .benefit-icon {
    font-size: ${Math.round(benefitFontSize * 1.1)}px;
    line-height: 1;
  }
  .benefit-text {
    font-size: ${benefitLabelFontSize}px;
    font-weight: 600;
    color: ${ctx.text};
    line-height: 1.3;
  }
  /* CTA row */
  .cta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: ${Math.round(height * 0.012)}px;
    flex-shrink: 0;
  }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: ${Math.round(height * 0.016)}px ${Math.round(width * 0.06)}px;
    background: ${ctx.cta};
    color: ${ctx.ctaText};
    border-radius: 999px;
    font-size: ${ctaFontSize}px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    box-shadow: 0 4px 20px ${ctx.primary}66;
  }
  .price-stack {
    text-align: right;
  }
  .price-current {
    font-size: ${Math.round(headlineFontSize * 0.52)}px;
    font-weight: 900;
    color: ${ctx.accent};
    line-height: 1;
  }
  .price-original {
    font-size: ${Math.round(subFontSize * 0.72)}px;
    color: ${ctx.textMuted};
    text-decoration: line-through;
    margin-top: 2px;
  }
  .certs {
    display: flex;
    gap: ${Math.round(basePx * 0.012)}px;
    flex-wrap: wrap;
    margin-top: ${Math.round(height * 0.01)}px;
  }
  .cert-badge {
    font-size: ${Math.round(benefitLabelFontSize * 0.85)}px;
    font-weight: 600;
    background: ${ctx.cardBg};
    border: 1px solid ${ctx.accent}33;
    color: ${ctx.accent};
    padding: ${Math.round(benefitLabelFontSize * 0.25)}px ${Math.round(benefitLabelFontSize * 0.65)}px;
    border-radius: 999px;
  }
</style>
</head>
<body>
  <!-- TOP: packshot -->
  <div class="top">
    <div class="top-glow"></div>
    ${ctx.brand ? `<div class="brand-pill">${ctx.brand}</div>` : ''}
    ${ctx.badgeText ? `<div class="offer-badge">${ctx.badgeText}</div>` : ''}
    ${ctx.hasPackshot
      ? `<img class="packshot" src="${ctx.packshot}" alt="${ctx.productName}">`
      : `<span class="packshot-placeholder">📦</span>`
    }
  </div>

  <!-- BOTTOM: benefits + CTA -->
  <div class="bottom">
    <div class="headline">${ctx.headline}</div>

    ${benefits.length > 0 ? `
    <div class="benefit-grid">
      ${benefits.map((b, i) => `
        <div class="benefit-card">
          <span class="benefit-icon">${ICONS[i % ICONS.length]}</span>
          <span class="benefit-text">${b}</span>
        </div>
      `).join('')}
    </div>` : ''}

    ${ctx.certifications.length > 0 ? `
    <div class="certs">
      ${ctx.certifications.slice(0, 4).map(c => `<span class="cert-badge">${c}</span>`).join('')}
    </div>` : ''}

    <div class="cta-row">
      <div class="cta">${ctx.ctaText} →</div>
      ${ctx.price ? `
      <div class="price-stack">
        <div class="price-current">${ctx.price}</div>
        ${ctx.originalPrice ? `<div class="price-original">${ctx.originalPrice}</div>` : ''}
      </div>` : ''}
    </div>
  </div>
</body>
</html>`;
  },
};

export default template003;
