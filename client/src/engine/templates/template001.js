/**
 * Template 001 — Hero Centré
 * Product packshot dominates center. Strong headline + tagline + CTA.
 * Adapts to all formats (portrait, square, landscape).
 */
const template001 = {
  id: 'template001',
  name: 'Hero Centré',
  description: 'Packshot dominant, headline fort, CTA impactant',
  tags: ['hero', 'product', 'all-formats'],
  previewBg: 'linear-gradient(135deg, #1e1b4b, #3b0764)',

  render(ctx, format) {
    const { width, height } = format;
    const isPortrait = height > width;
    const isLandscape = width > height * 1.5;
    const isSquare = Math.abs(width - height) < 100;

    // Adaptive sizing
    const baseFontSize = Math.min(width, height) / 20;
    const headlineFontSize = isLandscape
      ? Math.round(width / 18)
      : Math.round(baseFontSize * 2.2);
    const subFontSize = Math.round(headlineFontSize * 0.42);
    const brandFontSize = Math.round(headlineFontSize * 0.3);
    const ctaFontSize = Math.round(headlineFontSize * 0.35);
    const ctaPadV = Math.round(height * 0.018);
    const ctaPadH = Math.round(width * 0.06);
    const packshotMaxH = isLandscape
      ? Math.round(height * 0.65)
      : isSquare
        ? Math.round(height * 0.48)
        : Math.round(height * 0.44);

    const badgeSize = Math.round(Math.min(width, height) * 0.13);
    const hasBadge = !!ctx.badgeText;
    const hasBenefits = ctx.benefits.length > 0;
    const displayBenefits = ctx.benefits.slice(0, isPortrait ? 3 : 2);

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
    background: ${ctx.bg};
  }
  .wrap {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: ${isLandscape ? 'row' : 'column'};
    align-items: center;
    justify-content: ${isLandscape ? 'space-between' : 'space-evenly'};
    padding: ${Math.round(height * 0.055)}px ${Math.round(width * 0.07)}px;
  }
  /* Background radial glow */
  .wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 50%, ${ctx.primary}22 0%, transparent 70%);
    pointer-events: none;
  }
  /* Brand */
  .brand {
    ${isLandscape ? '' : 'width: 100%;'}
    text-align: ${isLandscape ? 'left' : 'center'};
    font-size: ${brandFontSize}px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${ctx.accent};
    opacity: 0.9;
    margin-bottom: ${isLandscape ? '0' : Math.round(height * 0.02) + 'px'};
  }
  /* Packshot zone */
  .packshot-zone {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    ${isLandscape
      ? `width: 42%; height: 100%;`
      : `width: 100%; height: ${packshotMaxH}px;`
    }
    order: ${isLandscape ? 2 : 1};
    flex-shrink: 0;
  }
  .packshot-zone img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 ${Math.round(height * 0.025)}px ${Math.round(height * 0.05)}px rgba(0,0,0,0.55));
  }
  .packshot-placeholder {
    width: ${Math.round(Math.min(width, height) * 0.3)}px;
    height: ${Math.round(Math.min(width, height) * 0.3)}px;
    border-radius: 50%;
    background: ${ctx.cardBg};
    border: 2px dashed ${ctx.accent}44;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${Math.round(Math.min(width, height) * 0.1)}px;
  }
  /* Badge */
  .badge {
    position: absolute;
    top: ${Math.round(isLandscape ? height * 0.05 : height * 0.01)}px;
    right: ${Math.round(width * 0.01)}px;
    width: ${badgeSize}px;
    height: ${badgeSize}px;
    border-radius: 50%;
    background: ${ctx.badge};
    color: ${ctx.badgeText};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${Math.round(badgeSize * 0.26)}px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    text-align: center;
    padding: 4px;
    box-shadow: 0 4px 20px ${ctx.primary}88;
    transform: rotate(-12deg);
    line-height: 1.1;
  }
  /* Text zone */
  .text-zone {
    ${isLandscape
      ? `width: 52%; height: 100%; display: flex; flex-direction: column; justify-content: center; order: 1;`
      : `width: 100%; text-align: center; order: 2;`
    }
  }
  .headline {
    font-size: ${headlineFontSize}px;
    font-weight: 900;
    line-height: 1.1;
    color: ${ctx.text};
    letter-spacing: -0.02em;
    margin-bottom: ${Math.round(height * 0.015)}px;
    text-shadow: 0 2px 20px rgba(0,0,0,0.4);
  }
  .sub {
    font-size: ${subFontSize}px;
    font-weight: 400;
    line-height: 1.4;
    color: ${ctx.textMuted};
    margin-bottom: ${Math.round(height * 0.025)}px;
  }
  /* Benefits */
  .benefits {
    display: flex;
    flex-direction: column;
    gap: ${Math.round(height * 0.01)}px;
    margin-bottom: ${Math.round(height * 0.025)}px;
    ${isLandscape ? '' : 'align-items: center;'}
  }
  .benefit {
    display: flex;
    align-items: center;
    gap: ${Math.round(width * 0.015)}px;
    font-size: ${Math.round(subFontSize * 0.88)}px;
    color: ${ctx.text};
    font-weight: 500;
  }
  .benefit-dot {
    width: ${Math.round(subFontSize * 0.45)}px;
    height: ${Math.round(subFontSize * 0.45)}px;
    border-radius: 50%;
    background: ${ctx.accent};
    flex-shrink: 0;
  }
  /* CTA */
  .cta-row {
    display: flex;
    ${isLandscape ? '' : 'justify-content: center;'}
    align-items: center;
    gap: ${Math.round(width * 0.03)}px;
  }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: ${ctaPadV}px ${ctaPadH}px;
    background: ${ctx.cta};
    color: ${ctx.ctaText};
    border-radius: ${Math.round(height * 0.05)}px;
    font-size: ${ctaFontSize}px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    box-shadow: 0 6px 30px ${ctx.primary}88, 0 2px 10px rgba(0,0,0,0.3);
  }
  .cta-arrow {
    font-size: ${Math.round(ctaFontSize * 1.1)}px;
  }
  /* Price */
  .price-block {
    display: flex;
    align-items: baseline;
    gap: ${Math.round(width * 0.02)}px;
    ${isLandscape ? '' : 'justify-content: center;'}
  }
  .price-current {
    font-size: ${Math.round(headlineFontSize * 0.55)}px;
    font-weight: 900;
    color: ${ctx.accent};
  }
  .price-original {
    font-size: ${Math.round(headlineFontSize * 0.3)}px;
    font-weight: 400;
    color: ${ctx.textMuted};
    text-decoration: line-through;
  }
  /* Rating */
  .rating {
    display: flex;
    align-items: center;
    gap: ${Math.round(width * 0.012)}px;
    font-size: ${Math.round(subFontSize * 0.8)}px;
    color: ${ctx.star};
    ${isLandscape ? '' : 'justify-content: center;'}
    margin-top: ${Math.round(height * 0.01)}px;
  }
  .rating-count {
    color: ${ctx.textMuted};
    font-size: ${Math.round(subFontSize * 0.7)}px;
  }
</style>
</head>
<body>
<div class="wrap">
  ${!isLandscape ? `<div class="brand">${ctx.brand || ctx.productName}</div>` : ''}

  <div class="packshot-zone">
    ${ctx.hasPackshot
      ? `<img src="${ctx.packshot}" alt="${ctx.productName}">`
      : `<div class="packshot-placeholder">📦</div>`
    }
    ${hasBadge ? `<div class="badge">${ctx.badgeText}</div>` : ''}
  </div>

  <div class="text-zone">
    ${isLandscape ? `<div class="brand">${ctx.brand || ctx.productName}</div>` : ''}
    <div class="headline">${ctx.headline}</div>
    ${ctx.subheadline ? `<div class="sub">${ctx.subheadline}</div>` : ''}

    ${hasBenefits ? `
    <div class="benefits">
      ${displayBenefits.map(b => `
        <div class="benefit">
          <div class="benefit-dot"></div>
          <span>${b}</span>
        </div>
      `).join('')}
    </div>` : ''}

    <div class="cta-row">
      ${ctx.price ? `
      <div>
        <div class="price-block">
          <span class="price-current">${ctx.price}</span>
          ${ctx.originalPrice ? `<span class="price-original">${ctx.originalPrice}</span>` : ''}
        </div>
        ${ctx.hasRating ? `
        <div class="rating">
          <span>${ctx.stars}</span>
          ${ctx.reviewCount ? `<span class="rating-count">(${ctx.reviewCount} avis)</span>` : ''}
        </div>` : ''}
      </div>` : ''}
      <div class="cta">
        ${ctx.ctaText}
        <span class="cta-arrow">→</span>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
  },
};

export default template001;
