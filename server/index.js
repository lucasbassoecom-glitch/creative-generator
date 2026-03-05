require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({ origin: isProd ? true : 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Routes
app.use('/api/personas', require('./routes/personas'));
app.use('/api/products', require('./routes/products'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/creatives', require('./routes/creatives'));
app.use('/api/claude', require('./routes/claude'));
app.use('/api/export', require('./routes/export'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/gpt-images', require('./routes/gpt-images'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    anthropic: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here',
  });
});

// In production, serve the React build and handle SPA routing
if (isProd) {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🚀 Creative Generator Server running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${dataDir}`);
  const hasKey = process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';
  const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  console.log(`🔑 Anthropic API key: ${hasKey ? '✅ configured' : '❌ missing — add to .env'}`);
  console.log(`🔑 OpenAI API key:    ${hasOpenAI ? '✅ configured' : '❌ missing — add to .env (required for Mode Création IA)'}\n`);
});
