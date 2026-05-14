/**
 * Vercel Serverless Function — /api/generate
 *
 * Proxies requests to OpenAI Chat Completions API.
 * API key is read from process.env.OPENAI_API_KEY (never exposed to client).
 *
 * Deploy:  vercel env add OPENAI_API_KEY   (or set in Vercel dashboard)
 * Local:   create .env.local with OPENAI_API_KEY=sk-...
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Tone-specific system prompt modifiers
const TONE_MODIFIERS = {
  funny: "Use humor, wit, and playful language. Add funny emojis. Make people laugh.",
  viral: "Use high-energy, clickbait-style hooks. Add fire emojis. Optimize for maximum shares.",
  professional: "Use polished, authoritative language. Add business-appropriate emojis sparingly. Sound like an expert.",
  aesthetic: "Use soft, dreamy, poetic language. Add gentle emojis like ✨🌸☁️. Create Pinterest-worthy vibes.",
  emotional: "Use heartfelt, touching language. Add emotional emojis. Make people feel something deeply.",
};

const SYSTEM_PROMPT = `You are a world-class TikTok caption strategist. You know exactly what makes content go viral. You understand TikTok trends, hooks that stop the scroll, and hashtags that maximize discoverability.

Generate content that:
- Feels authentic and human-written (never robotic)
- Uses emojis naturally (not forced)
- Matches the requested tone precisely
- Stays under TikTok's character limits
- Includes trending hashtags relevant to the topic
- Creates hooks that make people STOP scrolling

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text.`;

function buildUserPrompt(topic, tone) {
  const toneGuide = TONE_MODIFIERS[tone] || TONE_MODIFIERS.viral;

  return `Create TikTok content for a video about: "${topic}"

Tone requirements: ${toneGuide}

Return ONLY this exact JSON structure (no markdown, no code fences):
{
  "captions": [
    "caption 1 — engaging, under 200 chars, matches tone",
    "caption 2",
    "caption 3",
    "caption 4",
    "caption 5"
  ],
  "hooks": [
    "hook 1 — scroll-stopping, under 150 chars",
    "hook 2",
    "hook 3",
    "hook 4",
    "hook 5"
  ],
  "hashtags": [
    "#tag1",
    "#tag2",
    ...15 total hashtags, mix of broad + niche, all relevant to topic
  ],
  "ctas": [
    "cta 1 — engaging call to action, under 150 chars",
    "cta 2",
    "cta 3",
    "cta 4",
    "cta 5"
  ]
}`;
}

/**
 * Validate that the parsed JSON has the expected shape.
 * Returns cleaned data or null.
 */
function validateResponse(json) {
  if (!json || typeof json !== "object") return null;

  const captions = Array.isArray(json.captions) ? json.captions.slice(0, 5) : [];
  const hooks = Array.isArray(json.hooks) ? json.hooks.slice(0, 5) : [];
  const hashtags = Array.isArray(json.hashtags) ? json.hashtags.slice(0, 15) : [];
  const ctas = Array.isArray(json.ctas) ? json.ctas.slice(0, 5) : [];

  if (captions.length === 0 && hooks.length === 0) return null;

  return { captions, hooks, hashtags, ctas };
}

/**
 * Attempt to extract JSON from a string that might have markdown fences
 * or other wrapping text.
 */
function extractJson(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try to find JSON object between { and }
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default async function handler(req, res) {
  // ── CORS headers ──────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ── Only POST ─────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // ── Validate API key exists ───────────────────────────────
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set in environment variables.");
    return res.status(500).json({
      error: "Server configuration error. Please set the OPENAI_API_KEY environment variable.",
    });
  }

  // ── Parse & validate request body ─────────────────────────
  let body;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body." });
  }

  const topic = (body.topic || "").trim();
  const tone = (body.tone || "viral").trim().toLowerCase();

  if (!topic) {
    return res.status(400).json({ error: "Topic is required." });
  }
  if (topic.length > 500) {
    return res.status(400).json({ error: "Topic must be under 500 characters." });
  }
  if (!TONE_MODIFIERS[tone]) {
    return res.status(400).json({ error: `Invalid tone. Use: ${Object.keys(TONE_MODIFIERS).join(", ")}` });
  }

  // ── Call OpenAI API ───────────────────────────────────────
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(topic, tone) },
        ],
        temperature: 0.9,
        max_tokens: 800,
      }),
    });

    // ── Handle OpenAI errors ─────────────────────────────
    if (!response.ok) {
      const errBody = await response.text();
      console.error(`OpenAI API error ${response.status}:`, errBody);

      if (response.status === 401) {
        return res.status(500).json({ error: "Invalid API key configured on server." });
      }
      if (response.status === 429) {
        return res.status(503).json({ error: "AI service is busy. Please try again in a moment." });
      }
      return res.status(502).json({ error: "AI service unavailable. Please try again later." });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty response from OpenAI:", JSON.stringify(data));
      return res.status(502).json({ error: "AI returned an empty response. Please try again." });
    }

    // ── Parse & validate the AI's JSON ───────────────────
    const parsed = extractJson(content);
    const validated = validateResponse(parsed);

    if (!validated) {
      console.error("Failed to parse AI response:", content);
      return res.status(502).json({
        error: "AI response was malformed. Please try again.",
        debug: process.env.NODE_ENV === "development" ? content.slice(0, 200) : undefined,
      });
    }

    // ── Return structured response ───────────────────────
    return res.status(200).json({
      tone: { emoji: "", label: tone.charAt(0).toUpperCase() + tone.slice(1) },
      ...validated,
    });
  } catch (err) {
    console.error("Unexpected error:", err.message);

    // Distinguish network errors from other failures
    if (err.cause?.code === "ECONNREFUSED" || err.cause?.code === "ENOTFOUND") {
      return res.status(502).json({ error: "Cannot reach AI service. Check your network." });
    }

    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
