const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../services/data-service');

const FILE = 'personas.json';

// GET all
router.get('/', (req, res) => {
  res.json(readJSON(FILE));
});

// GET one
router.get('/:id', (req, res) => {
  const all = readJSON(FILE);
  const item = all.find(p => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
router.post('/', (req, res) => {
  const all = readJSON(FILE);
  const item = { id: uuidv4(), createdAt: new Date().toISOString(), ...req.body };
  all.push(item);
  writeJSON(FILE, all);
  res.status(201).json(item);
});

// PUT update
router.put('/:id', (req, res) => {
  const all = readJSON(FILE);
  const idx = all.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  all[idx] = { ...all[idx], ...req.body, id: req.params.id, updatedAt: new Date().toISOString() };
  writeJSON(FILE, all);
  res.json(all[idx]);
});

// DELETE
router.delete('/:id', (req, res) => {
  const all = readJSON(FILE);
  const filtered = all.filter(p => p.id !== req.params.id);
  writeJSON(FILE, filtered);
  res.json({ success: true });
});

module.exports = router;
