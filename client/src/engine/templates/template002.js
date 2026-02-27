/**
 * Template 002 — Split Layout
 * Left: text content (offer badge, headline, benefits, CTA + price).
 * Right: full-height packshot with gradient overlay.
 * Best for: portrait, story, feed_square.
 */
const template002 = {
  id: 'template002',
  name: 'Split Vertical',
  description: 'Texte à gauche, packshot à droite avec overlay',
  tags: ['split', 'benefits', 'portrait'],
  previewBg: 'linear-gradient(135deg, #0f172a, #1e3a8a)',

  render(ctx, format) {
    const { width, height } = format;
    const isLandscape = width > height;

    // For landscape, flip to top/bottom split
    const basePx = Math.min(width, height);
    const headlineFontSize = Math.round(basePx / (isLandscape ? 14 : 11));
    const subFontSize = Math.round(headlineFontSize * 0.42);
    const brandFontSize = Math.round(headlineFontSize * 0.3);
    const ctaFontSize = Math.round(headlineFontSize * 0.35);
    const badgeFontSize = Math.round(headlineFontSize * 0.28);
    const benefitFontSize = Math.round(headlineFontSize * 0.38);
    const pad = Math.round(basePx * 0.07);

    const benefits = ctx.benefits.slice(0, isLandscape ? 2 : 4);

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
  }
  .wrap {
    display: flex;
    flex-direction: ${isLandscape ? 'column' : 'row'};
    width: 100%;
    height: 100%;
  }
  /* ── Text panel ── */
  .text-panel {
    ${isLandscape
      ? `width: 100%; height: 52%;`
      : `width: 52%; height: 100%;`
    }
    background: ${ctx.bg};
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: ${pad}px;
    position: relative;
    z-index: 2;
  }
  /* diagonal cut on right edge */
  .text-panel::after {
    content: '';
    position: absolute;
    ${isLandscape
      ? `bottom: -${Math.round(height * 0.04)}px; left: 0; right: 0; height: ${Math.round(height * 0.08)}px; background: ${ctx.bgSolid}; clip-path: polygon(0 0, 100% 50%, 100% 100%, 0 100%);`
      : `top: 0; right: -${Math.round(width * 0.04)}px; bottom: 0; width: ${Math.round(width * 0.08)}px; background: ${ctx.bgSolid}; clip-path: polygon(0 0, 0 100%, 100% 100%);`
    }
    pointer-events: none;
    z-index: 3;
  }
  /* offer badge */
  .offer-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: ${ctx.badge};
    color: ${ctx.badgeText};
    font-size: ${badgeFontSize}px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: ${Math.round(badgeFontSize * 0.4)}px ${Math.round(badgeFontSize * 0.9)}px;
    border-radius: ${Math.round(badgeFontSize * 0.35)}px;
    margin-bottom: ${Math.round(height * 0.022)}px;
    width: fit-content;
    box-shadow: 0 4px 15px ${ctx.primary}55;
  }
  .brand {
    font-size: ${brandFontSize}px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: ${ctx.accent};
    margin-bottom: ${Math.round(height * 0.015)}px;
    opacity: 0.85;
  }
  .headline {
    font-size: ${headlineFontSize}px;
    font-weight: 900;
    line-height: 1.08;
    color: ${ctx.text};
    letter-spacing: -0.025em;
    margin-bottom: ${Math.round(height * 0.018)}px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.5);
  }
  .sub {
    font-size: ${subFontSize}px;
    font-weight: 400;
    color: ${ctx.textMuted};
    line-height: 1.4;
    margin-bottom: ${Math.round(height * 0.022)}px;
  }
  /* benefits */
  .benefits {
    display: flex;
    flex-direction: column;
    gap: ${Math.round(height * 0.011)}px;
    margin-bottom: ${Math.round(height * 0.03)}px;
  }
  .benefit {
    display: flex;
    align-items: flex-start;
    gap: ${Math.round(basePx * 0.018)}px;
    font-size: ${benefitFontSize}px;
    color: ${ctx.text};
    line-height: 1.35;
  }
  .benefit-check {
    width: ${Math.round(benefitFontSize * 1.35)}px;
    height: ${Math.round(benefitFontSize * 1.35)}px;
    border-radius: 50%;
    background: ${ctx.accent}22;
    border: 1.5px solid ${ctx.accent};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
    color: ${ctx.accent};
    font-size: ${Math.round(benefitFontSize * 0.65)}px;
    font-weight: 900;
  }
  /* CTA + price row */
  .bottom-row {
    display: flex;
    align-items: center;
    gap: ${Math.round(basePx * 0.04)}px;
    flex-wrap: wrap;
  }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: ${Math.round(height * 0.018)}px ${Math.round(width * 0.055)}px;
    background: ${ctx.cta};
    color: ${ctx.ctaText};
    border-radius: ${Math.round(height * 0.045)}px;
    font-size: ${ctaFontSize}px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    box-shadow: 0 6px 25px ${ctx.primary}77;
  }
  .price-block {
    display: flex;
    flex-direction: column;
  }
  .price-current {
    font-size: ${Math.round(headlineFontSize * 0.55)}px;
    font-weight: 900;
    color: ${ctx.accent};
    line-height: 1;
  }
  .price-original {
    font-size: ${Math.round(subFontSize * 0.75)}px;
    color: ${ctx.textMuted};
    text-decoration: line-through;
    margin-top: 2px;
  }
  /* ── Image panel ── */
  .image-panel {
    ${isLandscape
      ? `width: 100%; height: 48%;`
      : `width: 48%; height: 100%;`
    }
    position: relative;
    overflow: hidden;
    background: ${ctx.bgSolid};
  }
  .image-panel img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: ${Math.round(basePx * 0.05)}px;
  }
  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${Math.round(basePx * 0.12)}px;
    color: ${ctx.accent}44;
    background: ${ctx.cardBg};
  }
  /* radial glow behind packshot */
  .image-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 80% at 60% 50%, ${ctx.primary}33 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }
  .image-panel img, .image-placeholder { position: relative; z-index: 2; }
  /* rating strip */
  .rating-strip {
    display: flex;
    align-items: center;
    gap: ${Math.round(basePx * 0.012)}px;
    font-size: ${Math.round(subFontSize * 0.75)}px;
    color: ${ctx.star};
    margin-top: ${Math.round(height * 0.012)}px;
  }
  .rating-count {
    color: ${ctx.textMuted};
    font-size: ${Math.round(subFontSize * 0.68)}px;
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="text-panel">
    ${ctx.brand ? `<div class="brand">${ctx.brand}</div>` : ''}
    ${ctx.badgeText ? `<div class="offer-badge">${ctx.badgeText}</div>` : ''}
    <div class="headline">${ctx.headline}</div>
    ${ctx.subheadline ? `<div class="sub">${ctx.subheadline}</div>` : ''}

    ${benefits.length > 0 ? `
    <div class="benefits">
      ${benefits.map(b => `
        <div class="benefit">
          <div class="benefit-check">✓</div>
          <span>${b}</span>
        </div>
      `).join('')}
    </div>` : ''}

    <div class="bottom-row">
      <div class="cta">${ctx.ctaText} →</div>
      ${ctx.price ? `
      <div class="price-block">
        <span class="price-current">${ctx.price}</span>
        ${ctx.originalPrice ? `<span class="price-original">${ctx.originalPrice}</span>` : ''}
      </div>` : ''}
    </div>

    ${ctx.hasRating ? `
    <div class="rating-strip">
      <span>${ctx.stars}</span>
      ${ctx.reviewCount ? `<span class="rating-count">(${ctx.reviewCount} avis)</span>` : ''}
    </div>` : ''}
  </div>

  <div class="image-panel">
    ${ctx.hasPackshot
      ? `<img src="${ctx.packshot}" alt="${ctx.productName}">`
      : `<div class="image-placeholder">📦</div>`
    }
  </div>
</div>
</body>
</html>`;
  },
};

export default template002;
