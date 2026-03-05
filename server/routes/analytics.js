const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../services/data-service');
const { chat, parseJSON } = require('../services/claude-service');

const FILE = 'analytics.json';

router.get('/', (req, res) => {
  const data = readJSON(FILE);
  if (!data || Array.isArray(data)) {
    return res.json({
      last_analysis_date: null,
      total_creatives_tested: 0,
      win_rate: 0,
      avg_ctr: 0,
      avg_cpa: 0,
      patterns: {},
      insights: [],
      analysis_history: [],
    });
  }
  res.json(data);
});

router.put('/', (req, res) => {
  const current = readJSON(FILE) || {};
  const updated = { ...current, ...req.body, updated_at: new Date().toISOString() };
  writeJSON(FILE, updated);
  res.json(updated);
});

// Compute live stats from creatives
router.get('/stats', (req, res) => {
  const creatives = readJSON('creatives.json') || [];
  const withPerf = creatives.filter(c => c.performance && c.performance.status && c.performance.status !== 'not_launched');
  const withResults = creatives.filter(c => c.performance && c.performance.ctr != null);
  const winners = withPerf.filter(c => c.performance.status === 'winner');
  const testing = withPerf.filter(c => c.performance.status === 'testing');

  const avgCtr = withResults.length
    ? (withResults.reduce((s, c) => s + (parseFloat(c.performance.ctr) || 0), 0) / withResults.length).toFixed(2)
    : 0;
  const avgCpa = withResults.filter(c => c.performance.cpa).length
    ? (withResults.filter(c => c.performance.cpa).reduce((s, c) => s + (parseFloat(c.performance.cpa) || 0), 0) / withResults.filter(c => c.performance.cpa).length).toFixed(2)
    : 0;

  const topByCtr = [...withResults]
    .sort((a, b) => (parseFloat(b.performance.ctr) || 0) - (parseFloat(a.performance.ctr) || 0))
    .slice(0, 5);
  const topByCpa = [...withResults.filter(c => c.performance.cpa)]
    .sort((a, b) => (parseFloat(a.performance.cpa) || 0) - (parseFloat(b.performance.cpa) || 0))
    .slice(0, 5);

  res.json({
    total: creatives.length,
    tested: withPerf.length,
    with_results: withResults.length,
    testing: testing.length,
    winners: winners.length,
    win_rate: withPerf.length ? Math.round((winners.length / withPerf.length) * 100) : 0,
    avg_ctr: parseFloat(avgCtr),
    avg_cpa: parseFloat(avgCpa),
    top_by_ctr: topByCtr,
    top_by_cpa: topByCpa,
  });
});

// Compute dynamic insights (available from 10 creatives)
router.get('/insights', (req, res) => {
  const creatives = readJSON('creatives.json') || [];
  const withResults = creatives.filter(c => c.performance && c.performance.ctr != null && c.performance.status !== 'not_launched');
  const count = withResults.length;

  if (count < 3) {
    return res.json({ insights: [], count, min_required: 10, confidence: 'none' });
  }

  const confidence = count >= 30 ? 'high' : count >= 10 ? 'medium' : 'low';
  const insights = [];

  // Headline type insights
  const byFramework = {};
  withResults.forEach(c => {
    const fw = c.content?.copy_framework || c.framework;
    if (!fw) return;
    if (!byFramework[fw]) byFramework[fw] = { ctrs: [], cpas: [] };
    if (c.performance.ctr) byFramework[fw].ctrs.push(parseFloat(c.performance.ctr));
    if (c.performance.cpa) byFramework[fw].cpas.push(parseFloat(c.performance.cpa));
  });
  const frameworks = Object.entries(byFramework)
    .map(([fw, d]) => ({
      fw,
      avgCtr: d.ctrs.length ? d.ctrs.reduce((a, b) => a + b, 0) / d.ctrs.length : 0,
      avgCpa: d.cpas.length ? d.cpas.reduce((a, b) => a + b, 0) / d.cpas.length : null,
      count: d.ctrs.length,
    }))
    .filter(f => f.count >= 2)
    .sort((a, b) => b.avgCtr - a.avgCtr);

  if (frameworks.length >= 2) {
    const best = frameworks[0];
    const worst = frameworks[frameworks.length - 1];
    const diff = worst.avgCtr > 0 ? Math.round(((best.avgCtr - worst.avgCtr) / worst.avgCtr) * 100) : 0;
    if (diff > 10) {
      insights.push({
        type: 'framework',
        icon: '🏆',
        label: `${best.fw} surperforme de ${diff}%`,
        detail: `CTR moyen ${best.avgCtr.toFixed(1)}% vs ${worst.avgCtr.toFixed(1)}% pour ${worst.fw}`,
        confidence,
        sample: best.count,
      });
    }
  }

  // Angle/pain_point insights
  const byAngle = {};
  withResults.forEach(c => {
    const angle = c.content?.angle;
    if (!angle) return;
    if (!byAngle[angle]) byAngle[angle] = { ctrs: [], cpas: [] };
    if (c.performance.ctr) byAngle[angle].ctrs.push(parseFloat(c.performance.ctr));
    if (c.performance.cpa) byAngle[angle].cpas.push(parseFloat(c.performance.cpa));
  });
  const angles = Object.entries(byAngle)
    .map(([a, d]) => ({
      angle: a,
      avgCtr: d.ctrs.length ? d.ctrs.reduce((a, b) => a + b, 0) / d.ctrs.length : 0,
      avgCpa: d.cpas.length ? d.cpas.reduce((a, b) => a + b, 0) / d.cpas.length : null,
      count: d.ctrs.length,
    }))
    .filter(f => f.count >= 2)
    .sort((a, b) => b.avgCtr - a.avgCtr);

  if (angles.length >= 1) {
    const best = angles[0];
    insights.push({
      type: 'angle',
      icon: '🎯',
      label: `Angle "${best.angle}" — meilleur CTR`,
      detail: `CTR moyen ${best.avgCtr.toFixed(1)}%${best.avgCpa ? ` · CPA ${best.avgCpa.toFixed(2)}€` : ''}`,
      confidence,
      sample: best.count,
    });
  }

  // Winner status insights
  const winnerFrameworks = withResults.filter(c => c.performance.status === 'winner').map(c => c.content?.copy_framework || c.framework).filter(Boolean);
  if (winnerFrameworks.length >= 2) {
    const freq = {};
    winnerFrameworks.forEach(f => { freq[f] = (freq[f] || 0) + 1; });
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      insights.push({
        type: 'winner_pattern',
        icon: '💡',
        label: `${top[0]} présent dans ${top[1]} winners`,
        detail: `Framework le plus fréquent parmi tes créatives gagnantes`,
        confidence,
        sample: winnerFrameworks.length,
      });
    }
  }

  res.json({ insights, count, min_required: 10, confidence });
});

// Full Claude analysis (requires 30 creatives)
router.post('/analyze', async (req, res) => {
  try {
    const creatives = readJSON('creatives.json') || [];
    const withResults = creatives.filter(c => c.performance && (c.performance.ctr != null || c.performance.status));
    const brandName = req.body.brand_name || 'la marque';

    if (withResults.length < 10) {
      return res.status(400).json({
        error: 'insufficient_data',
        count: withResults.length,
        required: 30,
        message: `Il te faut au moins 30 créatives testées pour une analyse fiable (tu en as ${withResults.length}).`,
      });
    }

    const dataForClaude = withResults.map(c => ({
      id: c.id,
      headline: c.content?.headline || '',
      subheadline: c.content?.subheadline || '',
      angle: c.content?.angle || '',
      framework: c.content?.copy_framework || c.framework || '',
      structure: c.content?.structure || '',
      colors_bg: c.content?.colors?.background || '',
      persona_id: c.persona_id || '',
      format: c.format || c.formatId || '',
      test_variable: c.test_variable || '',
      is_control: c.is_control || false,
      ctr: c.performance.ctr,
      cpa: c.performance.cpa,
      status: c.performance.status,
      roas: c.performance.roas,
    }));

    const SYSTEM = `Tu es un media buyer expert spécialisé en publicité digitale Facebook/Instagram. Tu analyses des données de performance créatives et identifies des patterns actionnables avec rigueur statistique.`;

    const PROMPT = `Tu es un media buyer expert. Voici les données de performance de ${withResults.length} créatives publicitaires testées pour la marque ${brandName}.

Pour chaque créative tu as : le headline, l'angle/bénéfice, le copy framework, la structure, la palette de couleurs, le persona ciblé, le format, et les résultats (CTR, CPA, statut).

Données :
${JSON.stringify(dataForClaude, null, 2)}

Analyse ces données et identifie :

1. HEADLINES : Quels types de headlines performent le mieux ? (question vs affirmation vs chiffre ? quel pain point convertit le plus ?)
2. ANGLES : Quels bénéfices/pain points génèrent les meilleurs résultats ?
3. COULEURS : Y a-t-il une corrélation entre palette et performance ?
4. STRUCTURE : Quel layout performe le mieux ?
5. COPY FRAMEWORK : PAS vs BAB vs FAB — lequel convertit le mieux ?
6. FORMATS : Quel format performe le mieux ?
7. COMBINAISONS GAGNANTES : Quelles combinaisons reviennent le plus chez les winners ?
8. RECOMMANDATIONS : 3 prochaines créatives à tester en priorité avec briefs précis.

Sois data-driven. Si les données sont insuffisantes pour une conclusion, dis-le. Indique le niveau de confiance (faible/moyen/élevé) et la taille d'échantillon pour chaque insight.

Réponds UNIQUEMENT avec un objet JSON valide :
{
  "summary": "Résumé exécutif en 2-3 phrases",
  "insights": [
    {
      "category": "headlines|angles|couleurs|structure|framework|format|combinaisons",
      "finding": "Ce qui a été découvert",
      "confidence": "faible|moyen|élevé",
      "sample_size": 12,
      "action": "Ce qu'il faut faire"
    }
  ],
  "winning_combinations": [
    {
      "description": "Description de la combinaison gagnante",
      "ctr_avg": 3.2,
      "cpa_avg": 8.5,
      "count": 5
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "title": "Titre de la recommandation",
      "brief": "Brief précis pour la prochaine créative",
      "rationale": "Pourquoi ce test prioritaire"
    }
  ]
}`;

    const raw = await chat(SYSTEM, PROMPT, { maxTokens: 3000 });
    const analysis = parseJSON(raw);

    // Save analysis to history
    const analyticsData = readJSON(FILE) || {};
    const analysisEntry = {
      date: new Date().toISOString(),
      creatives_count: withResults.length,
      analysis,
    };
    const history = analyticsData.analysis_history || [];
    history.unshift(analysisEntry);
    writeJSON(FILE, {
      ...analyticsData,
      last_analysis_date: new Date().toISOString(),
      analysis_history: history.slice(0, 10),
    });

    res.json({ success: true, analysis, creatives_count: withResults.length });
  } catch (err) {
    console.error('analytics analyze error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
