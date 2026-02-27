/**
 * Template 004 — Social Proof / Testimonial
 * Large verbatim quote, star rating, product visual, CTA.
 * Best for: square, portrait feeds.
 */
const template004 = {
  id: 'template004',
  name: 'Social Proof',
  description: 'Citation client, étoiles, preuve sociale percutante',
  tags: ['testimonial', 'social-proof', 'square', 'portrait'],
  previewBg: 'linear-gradient(135deg, #1c0a00, #7c2d12)',

  render(ctx, format) {
    const { width, height } = format;
    const isLandscape = width > height;

    const basePx = Math.min(width, height);
    const quoteFontSize = Math.round(basePx / (isLandscape ? 10 : 7.5));
    const quoteMarkSize = Math.round(quoteFontSize * 3.5);
    const authorFontSize = Math.round(quoteFontSize * 0.48);
    const brandFontSize = Math.round(quoteFontSize * 0.36);
    const ctaFontSize = Math.round(quoteFontSize * 0.38);
    const headlineFontSize = Math.round(quoteFontSize * 0.85);
    const pad = Math.round(basePx * 0.08);
    const starFontSize = Math.round(quoteFontSize * 0.65);

    // Use verbatim if available, otherwise generate from pain point
    const quote = ctx.verbatim || ctx.subheadline || `"${ctx.headline}"`;
    const cleanQuote = quote.replace(/^["«]|["»]$/g, '').trim();

    // Packshot position: right side column for landscape, bottom-right for portrait
    const packshotSize = isLandscape
      ? Math.round(height * 0.55)
      : Math.round(width * 0.38);

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
    align-items: ${isLandscape ? 'center' : 'flex-start'};
    padding: ${pad}px;
    gap: ${Math.round(basePx * 0.04)}px;
  }
  /* background ambient glow */
  .wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 80% at 30% 50%, ${ctx.primary}1a 0%, transparent 65%);
    pointer-events: none;
  }
  /* ── Left / main content ── */
  .content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    ${isLandscape
      ? `flex: 1; height: 100%; justify-content: center;`
      : `width: 100%; flex: 1;`
    }
  }
  /* Brand */
  .brand {
    font-size: ${brandFontSize}px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${ctx.accent};
    opacity: 0.85;
    margin-bottom: ${Math.round(height * 0.025)}px;
  }
  /* Star rating row */
  .stars-row {
    display: flex;
    align-items: center;
    gap: ${Math.round(basePx * 0.015)}px;
    margin-bottom: ${Math.round(height * 0.022)}px;
  }
  .stars {
    font-size: ${starFontSize}px;
    color: ${ctx.star};
    letter-spacing: 2px;
  }
  .review-count {
    font-size: ${Math.round(starFontSize * 0.65)}px;
    color: ${ctx.textMuted};
    font-weight: 500;
  }
  /* Quote mark */
  .quote-mark {
    font-size: ${quoteMarkSize}px;
    line-height: 0.6;
    color: ${ctx.accent};
    opacity: 0.35;
    font-family: Georgia, serif;
    margin-bottom: ${Math.round(height * 0.01)}px;
    display: block;
  }
  /* Quote text */
  .quote {
    font-size: ${quoteFontSize}px;
    font-weight: 700;
    line-height: 1.25;
    color: ${ctx.text};
    letter-spacing: -0.01em;
    margin-bottom: ${Math.round(height * 0.025)}px;
    flex: 1;
  }
  /* Author */
  .author {
    display: flex;
    align-items: center;
    gap: ${Math.round(basePx * 0.025)}px;
    margin-bottom: ${Math.round(height * 0.025)}px;
  }
  .author-avatar {
    width: ${Math.round(authorFontSize * 2.2)}px;
    height: ${Math.round(authorFontSize * 2.2)}px;
    border-radius: 50%;
    background: ${ctx.cardBg};
    border: 2px solid ${ctx.accent}55;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${Math.round(authorFontSize * 0.9)}px;
    flex-shrink: 0;
  }
  .author-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .author-name {
    font-size: ${authorFontSize}px;
    font-weight: 700;
    color: ${ctx.text};
  }
  .author-meta {
    font-size: ${Math.round(authorFontSize * 0.75)}px;
    color: ${ctx.textMuted};
  }
  /* Headline / product claim */
  .claim {
    font-size: ${headlineFontSize}px;
    font-weight: 800;
    line-height: 1.15;
    color: ${ctx.text};
    letter-spacing: -0.02em;
    margin-bottom: ${Math.round(height * 0.025)}px;
  }
  /* Separator */
  .separator {
    width: ${Math.round(basePx * 0.06)}px;
    height: 3px;
    background: ${ctx.accent};
    border-radius: 2px;
    margin-bottom: ${Math.round(height * 0.022)}px;
    opacity: 0.7;
  }
  /* CTA + price */
  .cta-row {
    display: flex;
    align-items: center;
    gap: ${Math.round(basePx * 0.035)}px;
    flex-shrink: 0;
  }
  .cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: ${Math.round(height * 0.018)}px ${Math.round(width * 0.055)}px;
    background: ${ctx.cta};
    color: ${ctx.ctaText};
    border-radius: 999px;
    font-size: ${ctaFontSize}px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    box-shadow: 0 4px 20px ${ctx.primary}66;
  }
  .price-block {
    display: flex;
    flex-direction: column;
  }
  .price-current {
    font-size: ${Math.round(headlineFontSize * 0.65)}px;
    font-weight: 900;
    color: ${ctx.accent};
    line-height: 1;
  }
  .price-original {
    font-size: ${Math.round(ctaFontSize * 0.75)}px;
    color: ${ctx.textMuted};
    text-decoration: line-through;
    margin-top: 2px;
  }
  /* ── Right: packshot ── */
  .visual {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    ${isLandscape
      ? `width: ${packshotSize}px; height: 100%;`
      : `width: 100%; height: ${Math.round(height * 0.3)}px; align-self: flex-end;`
    }
  }
  .visual img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 ${Math.round(basePx * 0.02)}px ${Math.round(basePx * 0.06)}px rgba(0,0,0,0.5));
  }
  .visual-placeholder {
    font-size: ${Math.round(packshotSize * 0.25)}px;
    opacity: 0.3;
  }
  /* discount badge */
  .discount-badge {
    position: absolute;
    top: ${Math.round(height * 0.02)}px;
    right: ${Math.round(width * 0.02)}px;
    width: ${Math.round(basePx * 0.13)}px;
    height: ${Math.round(basePx * 0.13)}px;
    border-radius: 50%;
    background: ${ctx.badge};
    color: ${ctx.badgeText};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${Math.round(basePx * 0.033)}px;
    font-weight: 900;
    text-align: center;
    line-height: 1.1;
    box-shadow: 0 4px 15px ${ctx.primary}66;
    transform: rotate(-10deg);
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="content">
    ${ctx.brand ? `<div class="brand">${ctx.brand}</div>` : ''}

    <div class="stars-row">
      ${ctx.hasRating
        ? `<span class="stars">${ctx.stars}</span>
           ${ctx.reviewCount ? `<span class="review-count">${ctx.reviewCount} avis clients</span>` : ''}`
        : `<span class="stars">★★★★★</span>
           <span class="review-count">Approuvé par nos clients</span>`
      }
    </div>

    <span class="quote-mark">"</span>
    <div class="quote">${cleanQuote}</div>

    ${ctx.personaName ? `
    <div class="author">
      <div class="author-avatar">👤</div>
      <div class="author-info">
        <span class="author-name">${ctx.personaName}</span>
        <span class="author-meta">Cliente vérifiée</span>
      </div>
    </div>` : ''}

    <div class="separator"></div>
    <div class="claim">${ctx.headline}</div>

    <div class="cta-row">
      <div class="cta">${ctx.ctaText} →</div>
      ${ctx.price ? `
      <div class="price-block">
        <span class="price-current">${ctx.price}</span>
        ${ctx.originalPrice ? `<span class="price-original">${ctx.originalPrice}</span>` : ''}
      </div>` : ''}
    </div>
  </div>

  <div class="visual">
    ${ctx.hasPackshot
      ? `<img src="${ctx.packshot}" alt="${ctx.productName}">`
      : `<span class="visual-placeholder">📦</span>`
    }
    ${ctx.badgeText ? `<div class="discount-badge">${ctx.badgeText}</div>` : ''}
  </div>
</div>
</body>
</html>`;
  },
};

export default template004;
