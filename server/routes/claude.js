const express = require('express');
const router = express.Router();
const { chat, analyzeImage, parseJSON } = require('../services/claude-service');

// ─── Test ────────────────────────────────────────────────────────────────────
router.get('/test', async (req, res) => {
  try {
    const text = await chat('You are a helpful assistant.', 'Reply with "OK" only.', { maxTokens: 16 });
    res.json({ success: true, response: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Parse Persona ────────────────────────────────────────────────────────────
router.post('/parse-persona', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'text required' });

    const SYSTEM = `Tu es un expert en marketing et psychologie des consommateurs, spécialisé dans l'analyse de personas pour des marques de compléments alimentaires. Tu extrais et structures les informations clés d'un document persona en JSON.`;

    const PROMPT = `Analyse ce document et extrait les informations pour créer une fiche persona structurée. Si une information n'est pas mentionnée, déduis-la de façon pertinente ou laisse la valeur vide.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, sans markdown. Structure exacte :
{
  "name": "Prénom ou nom du persona (ex: Sophie, 34 ans)",
  "demographics": {
    "age": "tranche d'âge ou âge précis",
    "gender": "Femme / Homme / Non spécifié",
    "situation": "situation familiale, professionnelle",
    "location": "ville/région si mentionnée",
    "income": "niveau de revenus si mentionné"
  },
  "pain_points": [
    { "text": "description du pain point", "intensity": 5 }
  ],
  "verbatims": [
    "phrase exacte entre guillemets telle que dite par la cible"
  ],
  "objections": [
    { "objection": "objection à l'achat", "response": "réponse/réassurance marketing" }
  ],
  "motivations": [
    "motivation ou déclencheur d'achat"
  ],
  "awareness_level": "unaware | problem_aware | solution_aware | product_aware | most_aware",
  "awareness_explanation": "pourquoi ce niveau de conscience",
  "tone": "description du ton de communication préféré",
  "tone_examples": ["exemple de formulation qui résonne", "autre exemple"],
  "triggers": [
    "déclencheur d'achat spécifique"
  ],
  "summary": "résumé en 2-3 phrases de ce persona pour un copywriter"
}

Les pain_points doivent avoir une intensité de 1 (faible) à 5 (critique). Trie-les du plus intense au moins intense. Extrait 3 à 6 pain points, 2 à 5 verbatims, 2 à 5 objections, 3 à 6 motivations.

Document à analyser :
${text}`;

    const raw = await chat(SYSTEM, PROMPT, { maxTokens: 2048 });
    const persona = parseJSON(raw);

    // Validation / defaults
    if (!persona.name) persona.name = 'Persona sans nom';
    if (!Array.isArray(persona.pain_points)) persona.pain_points = [];
    if (!Array.isArray(persona.verbatims)) persona.verbatims = [];
    if (!Array.isArray(persona.objections)) persona.objections = [];
    if (!Array.isArray(persona.motivations)) persona.motivations = [];
    if (!Array.isArray(persona.triggers)) persona.triggers = [];
    if (!Array.isArray(persona.tone_examples)) persona.tone_examples = [];
    if (!persona.demographics) persona.demographics = {};
    if (!persona.awareness_level) persona.awareness_level = 'problem_aware';

    res.json({ success: true, persona });
  } catch (err) {
    console.error('parse-persona error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Analyze competitor creative (Claude Vision) ──────────────────────────────
router.post('/analyze', async (req, res) => {
  try {
    const { imageBase64, mediaType = 'image/jpeg', imageUrl } = req.body;
    if (!imageBase64 && !imageUrl) return res.status(400).json({ error: 'imageBase64 or imageUrl required' });

    const PROMPT = `Tu es un expert en marketing direct, publicité digitale, copywriting et design de créatives. Analyse cette créative publicitaire en détail et retourne un JSON structuré.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou après, sans markdown.

Structure exacte à respecter :
{
  "layout": {
    "composition": "description précise de la grille de placement",
    "text_ratio": "estimation du ratio texte/image (ex: 30% texte, 70% image)",
    "zones": ["zone 1: contenu", "zone 2: contenu"],
    "orientation": "portrait | landscape | square",
    "breathing_space": "description des zones de respiration et marges"
  },
  "colors": {
    "dominant": ["#hex1", "#hex2"],
    "secondary": ["#hex3"],
    "accent": ["#hex4"],
    "gradients": ["description du dégradé si présent"]
  },
  "background": {
    "type": "solid | gradient | photo | pattern | overlay",
    "description": "description détaillée du fond",
    "color": "#hex ou null",
    "gradient_colors": ["#hex1", "#hex2"]
  },
  "typography": [
    {
      "type": "headline | subheadline | body | cta | badge | caption",
      "content": "texte exact ou description si illisible",
      "size_relative": "XL | L | M | S | XS",
      "weight": "100-900 ou thin/regular/semibold/bold/extrabold/black",
      "color": "#hex",
      "alignment": "left | center | right",
      "style": "uppercase | capitalize | normal | italic",
      "font_style": "serif | sans-serif | monospace | script"
    }
  ],
  "hook": {
    "mechanism": "chiffre | question | douleur | avant_apres | preuve_sociale | urgence | autorite | curiosite | promesse | comparaison",
    "text": "formulation exacte ou description du hook",
    "effectiveness": "pourquoi ce hook est efficace"
  },
  "graphic_elements": [
    { "type": "badge | icon | shape | line | overlay | pattern | sticker", "description": "description précise", "position": "position dans la créative" }
  ],
  "persuasion_elements": [
    { "type": "garantie | avis | certification | urgence | autorite | rarété | preuve_sociale", "description": "contenu exact ou description" }
  ],
  "cta": {
    "text": "texte exact du CTA",
    "shape": "rectangle | rounded | pill | link | none",
    "color": "#hex",
    "text_color": "#hex",
    "position": "description de la position",
    "prominence": "high | medium | low"
  },
  "format": {
    "estimated_dimensions": "ex: 1080x1350",
    "type": "story | feed_portrait | feed_square | banner | card | popup",
    "platform": "instagram | facebook | google | email | ecommerce | unknown"
  },
  "copywriting_angle": "description de l'angle copywriting global (ex: transformation, peur, aspiration, autorité...)",
  "copy_framework": {
    "name": "PAS",
    "full_name": "Problem-Agitate-Solution",
    "explanation": "Une phrase expliquant pourquoi ce framework correspond à cette créative.",
    "confidence": "high | medium | low"
  },
  "target_audience_guess": "description de la cible visée déduite de la créative",
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1 ou amélioration possible"],
  "overall_score": 7,
  "score_explanation": "justification du score sur 10"
}

Pour "copy_framework", identifie le framework copywriting principal parmi : PAS (Problem-Agitate-Solution), BAB (Before-After-Bridge), FAB (Features-Advantages-Benefits), AIDA (Attention-Interest-Desire-Action), 4P (Promise-Picture-Proof-Push), PASTOR (Problem-Amplify-Story-Transformation-Offer-Response), QUEST (Qualify-Understand-Educate-Stimulate-Transition), ou "Autre" si aucun ne correspond clairement.`;

    let analysisText;
    if (imageBase64) {
      analysisText = await analyzeImage(imageBase64, mediaType, PROMPT, { maxTokens: 3000 });
    } else {
      // URL-based: fetch and convert
      const https = require('https');
      const http = require('http');
      const buffer = await new Promise((resolve, reject) => {
        const protocol = imageUrl.startsWith('https') ? https : http;
        protocol.get(imageUrl, (resp) => {
          const chunks = [];
          resp.on('data', c => chunks.push(c));
          resp.on('end', () => resolve(Buffer.concat(chunks)));
          resp.on('error', reject);
        }).on('error', reject);
      });
      const b64 = buffer.toString('base64');
      const mt = imageUrl.match(/\.png$/i) ? 'image/png' : imageUrl.match(/\.webp$/i) ? 'image/webp' : 'image/jpeg';
      analysisText = await analyzeImage(b64, mt, PROMPT, { maxTokens: 3000 });
    }

    const analysis = parseJSON(analysisText);

    // Defaults
    if (!Array.isArray(analysis.typography)) analysis.typography = [];
    if (!Array.isArray(analysis.graphic_elements)) analysis.graphic_elements = [];
    if (!Array.isArray(analysis.persuasion_elements)) analysis.persuasion_elements = [];
    if (!analysis.colors) analysis.colors = { dominant: [], secondary: [], accent: [] };
    if (!analysis.cta) analysis.cta = {};
    if (!analysis.hook) analysis.hook = {};
    if (!analysis.format) analysis.format = {};
    if (!Array.isArray(analysis.strengths)) analysis.strengths = [];
    if (!Array.isArray(analysis.weaknesses)) analysis.weaknesses = [];
    if (!analysis.copy_framework) analysis.copy_framework = { name: 'Autre', full_name: 'Indéterminé', explanation: '', confidence: 'low' };

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('analyze error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Generate creatives — step 7 ─────────────────────────────────────────────
router.post('/generate', async (req, res) => {
  try {
    const { product, persona, formatId, templateId, count = 4, detectedFramework } = req.body;
    if (!product) return res.status(400).json({ error: 'product required' });

    // ── Build rich context strings ──
    const productCtx = [
      `Nom: ${product.name || '?'}`,
      `Marque: ${product.brand || '?'}`,
      product.tagline ? `Tagline actuelle: "${product.tagline}"` : '',
      product.price ? `Prix: ${product.price}€${product.originalPrice ? ` (barré: ${product.originalPrice}€)` : ''}` : '',
      product.offer ? `Offre: ${product.offer}` : '',
      product.benefits?.filter(Boolean).length
        ? `Bénéfices principaux:\n${product.benefits.filter(Boolean).slice(0, 5).map((b, i) => `  ${i + 1}. ${b}`).join('\n')}`
        : '',
      product.usps?.filter(Boolean).length
        ? `USPs (arguments uniques):\n${product.usps.filter(Boolean).slice(0, 4).map(u => `  • ${u}`).join('\n')}`
        : '',
      product.certifications?.length
        ? `Certifications: ${product.certifications.join(', ')}`
        : '',
      product.rating > 0
        ? `Note clients: ${product.rating}/5 (${product.reviewCount || '?'} avis${product.recommendRate ? `, ${product.recommendRate}% recommandent` : ''})`
        : '',
    ].filter(Boolean).join('\n');

    const sortedPains = [...(persona?.pain_points || [])].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
    const personaCtx = persona ? [
      `Nom: ${persona.name || 'Persona'}`,
      persona.demographics
        ? `Profil: ${[persona.demographics.age, persona.demographics.gender, persona.demographics.situation].filter(Boolean).join(', ')}`
        : '',
      sortedPains.slice(0, 3).length
        ? `Pain points (triés par intensité):\n${sortedPains.slice(0, 3).map(p => `  • [${p.intensity}/5] ${p.text}`).join('\n')}`
        : '',
      persona.motivations?.length
        ? `Motivations d'achat:\n${persona.motivations.slice(0, 3).map(m => `  • ${m}`).join('\n')}`
        : '',
      persona.verbatims?.length
        ? `Verbatims (voix du client):\n${persona.verbatims.slice(0, 2).map(v => `  "${v}"`).join('\n')}`
        : '',
      persona.objections?.length
        ? `Objections principales:\n${persona.objections.slice(0, 2).map(o => `  • ${o.objection}`).join('\n')}`
        : '',
      persona.awareness_level
        ? `Niveau de conscience: ${persona.awareness_level} — ${persona.awareness_explanation || ''}`
        : '',
      persona.tone
        ? `Ton de communication préféré: ${persona.tone}`
        : '',
    ].filter(Boolean).join('\n') : 'Pas de persona défini — vise un public large.';

    const formatCtx = formatId
      ? `Format publicitaire: ${formatId} (optimiser longueur du texte pour ce format)`
      : '';

    // ── Framework context ──
    const FRAMEWORKS = {
      PAS: 'Problem-Agitate-Solution : énonce le problème, amplifie la douleur, présente la solution',
      BAB: 'Before-After-Bridge : décrit la vie actuelle (avant), peint la vie souhaitée (après), propose le pont (produit)',
      FAB: 'Features-Advantages-Benefits : liste les caractéristiques, leurs avantages, les bénéfices concrets',
      AIDA: 'Attention-Interest-Desire-Action : capte l\'attention, suscite l\'intérêt, crée le désir, incite à l\'action',
      '4P': 'Promise-Picture-Proof-Push : promesse forte, image du résultat, preuves sociales, poussée à l\'action',
      PASTOR: 'Problem-Amplify-Story-Transformation-Offer-Response : narration complète autour de la transformation',
      QUEST: 'Qualify-Understand-Educate-Stimulate-Transition : approche consultative, éducative',
    };

    const frameworkCtx = detectedFramework
      ? `\n═══ FRAMEWORK DE RÉFÉRENCE (extrait d'une créative concurrente) ═══
Framework détecté : ${detectedFramework}
Définition : ${FRAMEWORKS[detectedFramework] || detectedFramework}

INSTRUCTIONS FRAMEWORK :
- Variante A (id: variant_1) : Utilise EXACTEMENT le framework "${detectedFramework}" — reprends cette structure pour battre la concurrence sur leur propre terrain.
- Variantes B, C, D (variant_2, variant_3, variant_4) : Propose 3 frameworks ALTERNATIFS que tu juges pertinents pour ce persona et son niveau de conscience. Justifie chaque choix dans "framework_rationale".`
      : `\n═══ FRAMEWORKS ═══
Choisis librement 4 frameworks parmi : PAS, BAB, FAB, AIDA, 4P, PASTOR, QUEST — en les adaptant au niveau de conscience du persona (${persona?.awareness_level || 'problem_aware'}).
Assure-toi d'utiliser 4 frameworks DIFFÉRENTS.`;

    // ── System + User prompt ──
    const SYSTEM = `Tu es un expert en copywriting direct-response pour la publicité digitale (Facebook Ads, Instagram Ads). Tu crées des textes publicitaires percutants, ancrés dans la psychologie de la cible, avec un objectif de conversion immédiate.

Tu maîtrises les mécanismes d'accroche (douleur, promesse, preuve_sociale, urgence, curiosite, autorite, transformation, identite) ET les frameworks copywriting structurants (PAS, BAB, FAB, AIDA, 4P, PASTOR, QUEST).`;

    const PROMPT = `Génère exactement ${count} variantes de copy publicitaire distinctes pour cette créative.

═══ PRODUIT ═══
${productCtx}

═══ PERSONA CIBLE ═══
${personaCtx}

${formatCtx}
${frameworkCtx}

RÈGLES IMPÉRATIVES :
1. Chaque variante doit utiliser un mécanisme d'accroche ET un framework DIFFÉRENTS
2. Adapter précisément le langage au persona (ton, vocabulaire, niveau d'intensité)
3. Le headline doit être court et percutant (5-10 mots max)
4. Le subheadline développe et argumente (1-2 phrases) — la structure reflète le framework choisi
5. Le CTA est spécifique et orienté action (pas "Cliquez ici")
6. Le badge_text est très court (≤ 15 chars) — utilisé dans un badge visuel
7. Varie les angles : ne fais pas 2 variantes similaires
8. Les textes doivent être 100% en français

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte avant ou après, sans markdown.

Structure exacte :
[
  {
    "angle": "slug_de_l_angle",
    "angle_label": "Nom du mécanisme (ex: Mécanisme Douleur)",
    "hook_mechanism": "douleur | promesse | preuve_sociale | urgence | curiosite | autorite | transformation | identite",
    "framework": "PAS | BAB | FAB | AIDA | 4P | PASTOR | QUEST",
    "framework_full_name": "nom complet du framework",
    "framework_rationale": "1 phrase : pourquoi ce framework est pertinent pour ce persona/niveau de conscience",
    "headline": "Titre principal percutant",
    "subheadline": "Phrase de développement qui argumente la promesse et lève une objection.",
    "cta_text": "Action spécifique",
    "badge_text": "Court badge",
    "rationale": "En 1-2 phrases : pourquoi ce mécanisme est adapté à ce persona et produit."
  }
]`;

    const raw = await chat(SYSTEM, PROMPT, { maxTokens: 2500 });
    const variants = parseJSON(raw);

    if (!Array.isArray(variants)) throw new Error('Claude did not return an array of variants');

    // Normalize
    const normalized = variants.slice(0, count).map((v, i) => ({
      id: `variant_${i + 1}`,
      angle: v.angle || `variant_${i + 1}`,
      angle_label: v.angle_label || v.angle || `Variante ${i + 1}`,
      hook_mechanism: v.hook_mechanism || 'promesse',
      framework: v.framework || null,
      framework_full_name: v.framework_full_name || v.framework || null,
      framework_rationale: v.framework_rationale || '',
      headline: v.headline || '',
      subheadline: v.subheadline || '',
      cta_text: v.cta_text || 'Découvrir maintenant',
      badge_text: v.badge_text || '',
      rationale: v.rationale || '',
    }));

    res.json({ success: true, variants: normalized });
  } catch (err) {
    console.error('generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Reformulate copy — step 9 ───────────────────────────────────────────────
router.post('/reformulate', async (req, res) => {
  res.json({ message: 'Module Reformulation — coming in step 9' });
});

module.exports = router;
