const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const GENERATED_DIR = path.join(__dirname, '../../uploads/generated');

function getClient() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    throw new Error('OPENAI_API_KEY non configurée dans le fichier .env');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Maps format IDs to gpt-image-1 supported sizes
const SIZE_MAP = {
  fb_feed_square:         '1024x1024',
  ig_feed_square:         '1024x1024',
  fb_feed_portrait:       '1024x1536',
  ig_feed_portrait:       '1024x1536',
  fb_story:               '1024x1536',
  ig_story:               '1024x1536',
  ig_reel:                '1024x1536',
  gg_display_leaderboard: '1536x1024',
  gg_display_banner:      '1536x1024',
};

// Approximate pricing per image (USD) for gpt-image-1
const COST_TABLE = {
  high:   { '1024x1024': 0.167, '1024x1536': 0.250, '1536x1024': 0.250 },
  medium: { '1024x1024': 0.042, '1024x1536': 0.063, '1536x1024': 0.063 },
  low:    { '1024x1024': 0.011, '1024x1536': 0.016, '1536x1024': 0.016 },
};

function getSizeForFormat(formatId) {
  return SIZE_MAP[formatId] || '1024x1024';
}

function getCostPerImage(size, quality = 'high') {
  return (COST_TABLE[quality] || COST_TABLE.high)[size] || 0.167;
}

async function generateImage(prompt, size = '1024x1024', quality = 'high') {
  const client = getClient();

  if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const response = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    n: 1,
    size,
    quality,
  });

  const b64 = response.data[0].b64_json;
  const filename = `${uuidv4()}.png`;
  const filepath = path.join(GENERATED_DIR, filename);
  fs.writeFileSync(filepath, Buffer.from(b64, 'base64'));

  return { filename, url: `/uploads/generated/${filename}` };
}

module.exports = { generateImage, getSizeForFormat, getCostPerImage };
