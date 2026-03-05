const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { chat, chatWithImages, parseJSON } = require('../services/claude-service');
const { generateImage, getSizeForFormat, getCostPerImage } = require('../services/openai-service');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HOOK_ALTERNATIVES = {
  chiffre: 'question',
  question: 'chiffre',
  douleur: 'promesse',
  promesse: 'preuve_sociale',
  preuve_sociale: 'chiffre',
  avant_apres: 'transformation',
  urgence: 'question',
  autorite: 'preuve_sociale',
  curiosite: 'promesse',
};

const ANGLE_ALTERNATIVES = {
  douleur: 'transformation',
  transformation: 'preuve_sociale',
  'preuve sociale': 'autorité',
  bénéfice: 'douleur',
  urgence: 'bénéfice',
  comparaison: 'transformation',
  aspiration: 'preuve_sociale',
  autorité: 'douleur',
};

function buildProductContext(product) {
  return [
    `Nom : ${product.name || '?'}`,
    `Marque : ${product.brand || '?'}`,
    product.tagline ? `Tagline : "${product.tagline}"` : '',
    product.price ? `Prix : ${product.price}€${product.originalPrice ? ` (barré : ${product.originalPrice}€)` : ''}` : '',
    product.offer ? `Offre spéciale : ${product.offer}` : '',
    product.benefits?.filter(Boolean).length
      ? `Bénéfices : ${product.benefits.filter(Boolean).slice(0, 5).join(' • ')}`
      : '',
    product.usps?.filter(Boolean).length
      ? `Arguments uniques (USPs) : ${product.usps.filter(Boolean).slice(0, 3).join(' • ')}`
      : '',
    product.certifications?.length
      ? `Certifications : ${product.certifications.join(', ')}`
      : '',
    product.rating > 0
      ? `Note clients : ${product.rating}/5 (${product.reviewCount || '?'} avis)`
      : '',
  ].filter(Boolean).join('\n');
}

function buildPersonaContext(persona) {
  if (!persona) return 'Pas de persona défini — vise un public large.';
  const sortedPains = [...(persona.pain_points || [])].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
  return [
    `Nom : ${persona.name}`,
    persona.demographics
      ? `Profil : ${[persona.demographics.age, persona.demographics.gender, persona.demographics.situation].filter(Boolean).join(', ')}`
      : '',
    sortedPains.length
      ? `Pain points :\n${sortedPains.slice(0, 4).map((p, i) => `  ${i + 1}. [${p.intensity}/5] ${p.text}`).join('\n')}`
      : '',
    persona.verbatims?.length
      ? `Verbatims (voix du client) : ${persona.verbatims.slice(0, 2).map(v => `"${v}"`).join(' | ')}`
      : '',
    persona.motivations?.length
      ? `Motivations d'achat : ${persona.motivations.slice(0, 3).join(' • ')}`
      : '',
    persona.tone ? `Ton de communication : ${persona.tone}` : '',
  ].filter(Boolean).join('\n');
}

// ─── POST /api/gpt-images/generate-prompts ───────────────────────────────────
// Claude generates N optimised image prompts based on the creative analysis
router.post('/generate-prompts', async (req, res) => {
  try {
    const { analysis, product, persona, formatId, count = 4 } = req.body;
    if (!analysis || !product) return res.status(400).json({ error: 'analysis and product required' });

    const size = getSizeForFormat(formatId);
    const ratio = size === '1024x1024' ? '1:1 square' : size === '1536x1024' ? '3:2 landscape' : '2:3 portrait';

    // Try to load product packshot for visual description
    let packshot = null;
    if (product.packshot) {
      try {
        const imgPath = path.join(__dirname, '../../', product.packshot);
        if (fs.existsSync(imgPath)) {
          const buf = fs.readFileSync(imgPath);
          const ext = path.extname(product.packshot).toLowerCase();
          const mt = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          packshot = { base64: buf.toString('base64'), mediaType: mt };
        }
      } catch { /* continue without packshot */ }
    }

    const productCtx = buildProductContext(product);
    const personaCtx = buildPersonaContext(persona);
    const sortedPains = [...(persona?.pain_points || [])].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
    const pain1 = sortedPains[0]?.text || 'pain point principal';
    const pain2 = sortedPains[1]?.text || pain1;

    const analysisSummary = [
      `Composition/Layout : ${analysis.layout?.composition || 'non spécifiée'}`,
      `Zones décrites : ${(analysis.layout?.zones || []).join(' | ')}`,
      `Ratio texte/image : ${analysis.layout?.text_ratio || '?'}`,
      `Background : ${analysis.background?.description || 'non spécifié'} (type: ${analysis.background?.type || '?'})`,
      `Couleurs dominantes : ${(analysis.colors?.dominant || []).join(', ') || '?'}`,
      `Couleurs secondaires : ${(analysis.colors?.secondary || []).join(', ') || '?'}`,
      `Couleurs accent : ${(analysis.colors?.accent || []).join(', ') || '?'}`,
      `Hook : ${analysis.hook?.mechanism || '?'} — "${analysis.hook?.text || '?'}"`,
      `Framework copy : ${analysis.copy_framework?.name || '?'} (${analysis.copy_framework?.full_name || ''})`,
      `Angle copywriting : ${analysis.copywriting_angle || '?'}`,
      `CTA : "${analysis.cta?.text || '?'}" — forme ${analysis.cta?.shape || '?'}, couleur ${analysis.cta?.color || '?'}, position ${analysis.cta?.position || '?'}`,
      `Typographies clés : ${(analysis.typography || []).slice(0, 3).map(t =>
        `${t.type}: "${t.content}" (${t.size_relative}, weight ${t.weight}, couleur ${t.color}, ${t.alignment}, ${t.style})`
      ).join(' | ') || '?'}`,
      `Éléments persuasion : ${(analysis.persuasion_elements || []).map(e => e.description).join(' • ') || 'aucun'}`,
      `Éléments graphiques : ${(analysis.graphic_elements || []).slice(0, 4).map(e => `${e.type} (${e.position})`).join(' • ') || 'aucun'}`,
    ].join('\n');

    const altHook = HOOK_ALTERNATIVES[analysis.hook?.mechanism] || 'question';
    const altAngle = ANGLE_ALTERNATIVES[analysis.copywriting_angle?.toLowerCase()] || 'transformation';

    const variantStrategies = [
      `- Variante 1 : Réplication fidèle — même structure exacte, même angle "${analysis.copywriting_angle || 'détecté'}", copy adapté au persona. Pain point ciblé : "${pain1}"`,
      `- Variante 2 : Même structure, headline alternatif — exploite le 2e pain point du persona : "${pain2}"`,
      `- Variante 3 : Même structure, type de hook différent — hook source = "${analysis.hook?.mechanism}" → tester "${altHook}"`,
      `- Variante 4 : Même structure, angle marketing différent — angle source = "${analysis.copywriting_angle}" → tester "${altAngle}"`,
      count >= 5 ? `- Variante 5 : Variation d'ambiance — même structure, modifier le background (si fond uni → lifestyle / si lifestyle → studio épuré)` : '',
      count >= 6 ? `- Variante 6 : Variation de mise en scène — repositionner le produit dans la composition (taille, angle, accessoires)` : '',
      count >= 7 ? `- Variante 7 : Variation de framework — utiliser BAB (Before-After-Bridge) avec copy centré sur la transformation` : '',
      count >= 8 ? `- Variante 8 : Version "urgence maximale" — ajouter badge promo, intensifier les couleurs, copy orienté urgence/rareté` : '',
    ].filter(Boolean).join('\n');

    const SYSTEM = `Tu es un expert en direction artistique publicitaire et en prompt engineering pour gpt-image-1. Tu génères des prompts d'images ultra-détaillés qui produisent des créatives publicitaires professionnelles, photo-réalistes et à fort impact marketing.${packshot ? ' Le packshot du produit est fourni en image — analyse sa forme, couleurs, packaging, logo et texte pour le décrire précisément dans chaque prompt.' : ''}`;

    const PROMPT = `${packshot ? 'Le packshot du produit est visible dans l\'image ci-jointe. Décris-le visuellement avec précision dans chaque prompt GPT (forme du contenant, couleurs exactes, finition, logo, texte sur l\'emballage).\n\n' : ''}Génère exactement ${count} prompts d'images publicitaires distincts pour gpt-image-1.

═══ ANALYSE DE LA CRÉATIVE SOURCE (structure à reproduire fidèlement) ═══
${analysisSummary}

═══ PRODUIT (à substituer au produit de référence) ═══
${productCtx}

═══ PERSONA CIBLE ═══
${personaCtx}

═══ FORMAT CIBLE ═══
Taille GPT : ${size}px | Ratio : ${ratio}
Format publicitaire : ${formatId || 'feed portrait'}

═══ STRATÉGIES DE VARIATION (une par variante) ═══
${variantStrategies}

═══ RÈGLES IMPÉRATIVES POUR CHAQUE PROMPT ═══

1. STRUCTURE : Reproduis EXACTEMENT la composition de la créative source — position de chaque zone, répartition texte/image, proportions. Décris chaque zone et son contenu.

2. PRODUIT : Décris le produit visuellement avec précision — ${packshot ? 'utilise le packshot fourni pour décrire sa forme, couleurs, finition, logo et texte visible' : `"${product.name}" par "${product.brand}" — décris le packaging de façon réaliste`}. Ne jamais écrire "competitor product" ou "the product".

3. TEXTES INTÉGRÉS : Inclus les textes marketing directement dans le prompt avec leur style :
   - Headline : bref et percutant, style de la police, taille relative (large/XL), position exacte (ex: top-left zone), couleur hex
   - Subheadline : position sous le headline, taille M, couleur et style
   - CTA : forme ${analysis.cta?.shape || 'arrondie'}, texte court, couleur ${analysis.cta?.color || 'accent'}, position ${analysis.cta?.position || 'bas de l\'image'}

4. QUALITÉ : Inclure systématiquement "ultra-realistic, professional advertising photography, 8K resolution, sharp details, no deformations, no extra fingers, no distorted text, accurate product proportions, commercial photography quality".

5. RATIO : Spécifier "aspect ratio ${ratio}" dans chaque prompt.

6. LANGUE : Les prompts GPT sont en ANGLAIS. Les métadonnées (headline_fr, sub_fr, cta_fr, rationale_fr) sont en FRANÇAIS.

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après, sans markdown.

[
  {
    "variant_index": 1,
    "strategy_name": "Réplication fidèle",
    "strategy_description": "Même structure, copy adapté au persona",
    "angle": "douleur",
    "hook_mechanism": "douleur",
    "framework": "PAS",
    "headline_fr": "Headline percutant en français (5-10 mots max)",
    "sub_fr": "Subheadline en français (1-2 phrases)",
    "cta_fr": "Texte du CTA",
    "rationale_fr": "Pourquoi cette variante (1-2 phrases).",
    "gpt_prompt": "Ultra-realistic professional advertising image, ${ratio} aspect ratio. [Exact layout description following source structure]. Product: [Precise visual description of product with packaging details]. Text overlays: large headline '[headline in english]' in [font style, color] at [exact position]; subheadline '[sub in english]' in [smaller size, color] below; CTA button '[cta in english]' [shape, color, position]. Background: [description]. Lighting: [type]. Color palette: [dominant colors]. [Persuasion elements if any]. Ultra-realistic, professional advertising photography, 8K resolution, sharp details, no deformations, accurate product proportions."
  }
]`;

    const images = packshot ? [packshot] : [];
    const raw = await chatWithImages(SYSTEM, PROMPT, images, { maxTokens: 4000 });
    const prompts = parseJSON(raw);

    if (!Array.isArray(prompts)) throw new Error('Claude did not return an array');

    const normalized = prompts.slice(0, count).map((p, i) => ({
      variant_index: p.variant_index || i + 1,
      strategy_name: p.strategy_name || `Variante ${i + 1}`,
      strategy_description: p.strategy_description || '',
      angle: p.angle || 'promesse',
      hook_mechanism: p.hook_mechanism || 'promesse',
      framework: p.framework || 'PAS',
      headline_fr: p.headline_fr || '',
      sub_fr: p.sub_fr || '',
      cta_fr: p.cta_fr || '',
      rationale_fr: p.rationale_fr || '',
      gpt_prompt: p.gpt_prompt || '',
    }));

    res.json({ success: true, prompts: normalized });
  } catch (err) {
    console.error('generate-prompts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/gpt-images/generate-image ─────────────────────────────────────
// Calls gpt-image-1 with a single prompt and saves the result
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt, formatId, quality = 'high' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });

    const size = getSizeForFormat(formatId);
    const result = await generateImage(prompt, size, quality);

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('generate-image error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/gpt-images/iterate-prompt ─────────────────────────────────────
// Claude modifies an existing prompt based on user instructions
router.post('/iterate-prompt', async (req, res) => {
  try {
    const { currentPrompt, instructions } = req.body;
    if (!currentPrompt || !instructions) {
      return res.status(400).json({ error: 'currentPrompt and instructions required' });
    }

    const SYSTEM = `Tu es un expert en prompt engineering pour gpt-image-1, spécialisé en publicité digitale. Tu modifies des prompts d'images existants selon des instructions créatives en préservant la cohérence et la qualité.`;

    const PROMPT = `Voici le prompt d'image publicitaire actuel :
---
${currentPrompt}
---

Instructions de modification : "${instructions}"

Modifie ce prompt en intégrant ces instructions. Préserve :
- La structure de composition globale (sauf si explicitement demandé de changer)
- La description précise du produit
- Les exigences de qualité (ultra-realistic, 8K, etc.)
- Le ratio d'aspect spécifié
- Les textes marketing (adapte-les si les instructions le demandent)

Retourne UNIQUEMENT le nouveau prompt complet en anglais, sans commentaires ni explications.`;

    const newPrompt = await chat(SYSTEM, PROMPT, { maxTokens: 1200 });
    res.json({ success: true, prompt: newPrompt.trim() });
  } catch (err) {
    console.error('iterate-prompt error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/gpt-images/export-zip ─────────────────────────────────────────
// Creates a ZIP archive of selected generated images
router.post('/export-zip', async (req, res) => {
  try {
    const { items } = req.body; // [{ filename, name }]
    if (!items?.length) return res.status(400).json({ error: 'items required' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="creatives_IA_${Date.now()}.zip"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.pipe(res);

    for (const item of items) {
      const filepath = path.join(__dirname, '../../uploads/generated', item.filename);
      if (fs.existsSync(filepath)) {
        archive.file(filepath, { name: `${item.name || item.filename}.png` });
      }
    }

    await archive.finalize();
  } catch (err) {
    console.error('export-zip error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/gpt-images/cost-estimate ───────────────────────────────────────
router.get('/cost-estimate', (req, res) => {
  const { formatId, count = 4, quality = 'high' } = req.query;
  const size = getSizeForFormat(formatId);
  const perImage = getCostPerImage(size, quality);
  const total = (perImage * parseInt(count)).toFixed(2);
  res.json({ success: true, perImage: perImage.toFixed(3), total, count: parseInt(count), size });
});

module.exports = router;
