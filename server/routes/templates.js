const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../services/data-service');

const FILE = 'templates.json';

router.get('/', (req, res) => res.json(readJSON(FILE)));

router.get('/:id', (req, res) => {
  const item = readJSON(FILE).find(t => t.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', (req, res) => {
  const all = readJSON(FILE);
  const item = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  all.push(item);
  writeJSON(FILE, all);
  res.status(201).json(item);
});

router.put('/:id', (req, res) => {
  const all = readJSON(FILE);
  const idx = all.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  all[idx] = { ...all[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  writeJSON(FILE, all);
  res.json(all[idx]);
});

router.delete('/:id', (req, res) => {
  const filtered = readJSON(FILE).filter(t => t.id !== req.params.id);
  writeJSON(FILE, filtered);
  res.json({ success: true });
});

module.exports = router;
