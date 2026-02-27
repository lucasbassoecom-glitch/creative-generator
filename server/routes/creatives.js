const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../services/data-service');

const FILE = 'creatives.json';

router.get('/', (req, res) => {
  const all = readJSON(FILE);
  const { productId, personaId, status, format } = req.query;
  let filtered = all;
  if (productId) filtered = filtered.filter(c => c.productId === productId);
  if (personaId) filtered = filtered.filter(c => c.personaId === personaId);
  if (status) filtered = filtered.filter(c => c.status === status);
  if (format) filtered = filtered.filter(c => c.format === format);
  res.json(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.get('/:id', (req, res) => {
  const item = readJSON(FILE).find(c => c.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', (req, res) => {
  const all = readJSON(FILE);
  const item = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    status: 'draft',
    favorite: false,
    tags: [],
    notes: '',
    ...req.body
  };
  all.push(item);
  writeJSON(FILE, all);
  res.status(201).json(item);
});

router.put('/:id', (req, res) => {
  const all = readJSON(FILE);
  const idx = all.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  all[idx] = { ...all[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  writeJSON(FILE, all);
  res.json(all[idx]);
});

router.delete('/:id', (req, res) => {
  const filtered = readJSON(FILE).filter(c => c.id !== req.params.id);
  writeJSON(FILE, filtered);
  res.json({ success: true });
});

module.exports = router;
