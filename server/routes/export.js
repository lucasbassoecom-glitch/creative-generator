const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const { htmlToImage } = require('../services/export-service');

// POST /api/export/png — single PNG via puppeteer
router.post('/png', async (req, res) => {
  try {
    const { html, width = 1080, height = 1080, scale = 2 } = req.body;
    if (!html) return res.status(400).json({ error: 'html required' });
    const buffer = await htmlToImage(html, { width, height, format: 'png', scale });
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    console.error('Export PNG error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/export/jpg — single JPEG via puppeteer
router.post('/jpg', async (req, res) => {
  try {
    const { html, width = 1080, height = 1080, quality = 90, scale = 2 } = req.body;
    if (!html) return res.status(400).json({ error: 'html required' });
    const buffer = await htmlToImage(html, { width, height, format: 'jpg', quality, scale });
    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/export/html — download a single HTML file
router.post('/html', (req, res) => {
  try {
    const { html, filename = 'creative.html' } = req.body;
    if (!html) return res.status(400).json({ error: 'html required' });
    const safe = filename.replace(/[^a-z0-9_\-\.]/gi, '_');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${safe}"`);
    res.send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/export/batch — ZIP archive of HTML creatives
router.post('/batch', (req, res) => {
  try {
    const { creatives } = req.body;
    if (!Array.isArray(creatives) || creatives.length === 0) {
      return res.status(400).json({ error: 'creatives array required' });
    }

    const zipName = `batch_${Date.now()}.zip`;
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename="${zipName}"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', err => { if (!res.headersSent) res.status(500).json({ error: err.message }); });
    archive.pipe(res);

    creatives.forEach((c, i) => {
      if (!c.html) return;
      const safeName = (c.name || `creative_${i + 1}`)
        .replace(/[^a-z0-9_\-\s]/gi, '')
        .replace(/\s+/g, '_')
        .slice(0, 60);
      archive.append(c.html, { name: `${String(i + 1).padStart(3, '0')}_${safeName}.html` });
    });

    archive.finalize();
  } catch (err) {
    console.error('Batch export error:', err);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

module.exports = router;
