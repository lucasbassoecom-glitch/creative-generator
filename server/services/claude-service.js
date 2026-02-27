const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-5-20250929';

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY non configurée dans le fichier .env');
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Send a text prompt to Claude and return the response text
 */
async function chat(systemPrompt, userMessage, options = {}) {
  const client = getClient();
  const { maxTokens = 4096, temperature } = options;

  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  };
  if (temperature !== undefined) params.temperature = temperature;

  const response = await client.messages.create(params);
  return response.content[0].text;
}

/**
 * Send an image + prompt to Claude Vision
 */
async function analyzeImage(base64Image, mediaType, prompt, options = {}) {
  const client = getClient();
  const { maxTokens = 4096 } = options;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
  });

  return response.content[0].text;
}

/**
 * Parse JSON from Claude's response (handles markdown code blocks)
 */
function parseJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = match ? match[1] : text;
  try {
    return JSON.parse(raw.trim());
  } catch {
    // Try to extract JSON object or array
    const objMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objMatch) return JSON.parse(objMatch[1]);
    throw new Error('Failed to parse JSON from Claude response');
  }
}

module.exports = { chat, analyzeImage, parseJSON, MODEL };
