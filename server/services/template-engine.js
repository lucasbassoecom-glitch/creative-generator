/**
 * Template Engine — converts a creative brief JSON into HTML/CSS
 * Full implementation in step 6
 */

const GOOGLE_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;600;700;800;900&family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap';

function buildBackground(bg) {
  if (!bg) return 'background: #1a1a2e;';
  switch (bg.type) {
    case 'solid':
      return `background: ${bg.color || '#1a1a2e'};`;
    case 'gradient':
      return `background: linear-gradient(${bg.direction || 'to bottom'}, ${(bg.colors || ['#1a1a2e', '#16213e']).join(', ')});`;
    case 'image':
      return `background: url('${bg.url}') center/cover no-repeat; background-color: ${bg.fallback || '#1a1a2e'};`;
    default:
      return `background: #1a1a2e;`;
  }
}

function buildElementStyle(style = {}) {
  const rules = [];
  if (style.fontFamily) rules.push(`font-family: '${style.fontFamily}', sans-serif`);
  if (style.fontSize) rules.push(`font-size: ${style.fontSize}`);
  if (style.fontWeight) rules.push(`font-weight: ${style.fontWeight}`);
  if (style.color) rules.push(`color: ${style.color}`);
  if (style.textTransform) rules.push(`text-transform: ${style.textTransform}`);
  if (style.textAlign) rules.push(`text-align: ${style.textAlign}`);
  if (style.letterSpacing) rules.push(`letter-spacing: ${style.letterSpacing}`);
  if (style.lineHeight) rules.push(`line-height: ${style.lineHeight}`);
  if (style.backgroundColor) rules.push(`background-color: ${style.backgroundColor}`);
  if (style.borderRadius) rules.push(`border-radius: ${style.borderRadius}`);
  if (style.padding) rules.push(`padding: ${style.padding}`);
  if (style.boxShadow) rules.push(`box-shadow: ${style.boxShadow}`);
  if (style.textShadow) rules.push(`text-shadow: ${style.textShadow}`);
  if (style.border) rules.push(`border: ${style.border}`);
  if (style.opacity !== undefined) rules.push(`opacity: ${style.opacity}`);
  return rules.join('; ');
}

function buildPosition(pos = {}, size = {}) {
  const rules = ['position: absolute'];
  const xVal = pos.x || 'center';
  const yVal = pos.y || 'center';

  if (xVal === 'center') {
    rules.push('left: 50%');
    rules.push('transform: translateX(-50%)');
  } else if (xVal === 'left') {
    rules.push('left: 5%');
  } else if (xVal === 'right') {
    rules.push('right: 5%');
  } else {
    rules.push(`left: ${xVal}`);
  }

  if (yVal === 'center') {
    // Handle centering carefully to avoid conflicting transforms
    const existingTransform = rules.find(r => r.includes('transform'));
    if (existingTransform) {
      const idx = rules.indexOf(existingTransform);
      rules[idx] = 'transform: translate(-50%, -50%)';
      rules.push('top: 50%');
    } else {
      rules.push('top: 50%');
      rules.push('transform: translateY(-50%)');
    }
  } else if (yVal === 'top') {
    rules.push('top: 5%');
  } else if (yVal === 'bottom') {
    rules.push('bottom: 5%');
  } else {
    rules.push(`top: ${yVal}`);
  }

  if (size.width) rules.push(`width: ${size.width}`);
  if (size.height) rules.push(`height: ${size.height}`);
  if (size.maxWidth) rules.push(`max-width: ${size.maxWidth}`);

  return rules.join('; ');
}

function renderElement(el, productImageUrl) {
  const posStyle = buildPosition(el.position, el.size);
  const elStyle = buildElementStyle(el.style || {});

  switch (el.type) {
    case 'headline':
    case 'subheadline':
    case 'body':
    case 'text':
      return `<div style="${posStyle}; ${elStyle}; text-align: center; width: 90%; max-width: 90%;" data-element="${el.type}" data-id="${el.id || el.type}">${el.content || ''}</div>`;

    case 'cta_button':
      return `<div style="${posStyle};" data-element="cta_button" data-id="${el.id || 'cta'}">
        <button style="${elStyle}; cursor: pointer; display: inline-block;">${el.content || 'Découvrir'}</button>
      </div>`;

    case 'product_image':
      if (!productImageUrl) return '';
      return `<div style="${posStyle}; text-align: center;" data-element="product_image">
        <img src="${productImageUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 20px 40px rgba(0,0,0,0.4));" />
      </div>`;

    case 'badge':
      return `<div style="${posStyle}; ${elStyle}; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: 800;" data-element="badge" data-id="${el.id || 'badge'}">${el.content || ''}</div>`;

    case 'divider':
      return `<div style="${posStyle}; ${elStyle}; height: ${el.style?.height || '2px'}; background: ${el.style?.color || '#fff'};" data-element="divider"></div>`;

    case 'list': {
      const items = (el.items || []).map(item => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">${item.icon ? `<span>${item.icon}</span>` : ''}<span>${item.text}</span></div>`).join('');
      return `<div style="${posStyle}; ${elStyle}; width: 85%;" data-element="list">${items}</div>`;
    }

    case 'testimonial':
      return `<div style="${posStyle}; ${elStyle}; text-align: center; width: 85%; padding: 16px; background: rgba(255,255,255,0.08); border-radius: 12px;" data-element="testimonial">
        <div style="font-size: 1.1em; margin-bottom: 8px;">"${el.quote || ''}"</div>
        <div style="font-size: 0.8em; opacity: 0.7;">— ${el.author || ''}</div>
        ${el.rating ? `<div style="color: #fbbf24; margin-top: 4px;">${'★'.repeat(el.rating)}</div>` : ''}
      </div>`;

    default:
      if (el.content) {
        return `<div style="${posStyle}; ${elStyle};" data-element="${el.type}">${el.content}</div>`;
      }
      return '';
  }
}

/**
 * Main function: converts a creative brief JSON into a complete HTML page
 */
function briefToHTML(brief, { productImageUrl = null, width = 1080, height = 1080 } = {}) {
  const bg = buildBackground(brief.background);
  const elementsHTML = (brief.elements || [])
    .map(el => renderElement(el, productImageUrl))
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="${GOOGLE_FONTS_URL}" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
    .canvas {
      width: ${width}px;
      height: ${height}px;
      position: relative;
      overflow: hidden;
      ${bg}
    }
  </style>
</head>
<body>
  <div class="canvas">
    ${elementsHTML}
  </div>
</body>
</html>`;
}

module.exports = { briefToHTML, buildBackground, buildElementStyle };
