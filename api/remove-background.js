// ============================================================
// api/generate-image.js
// ============================================================
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, size, quality } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const r = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: size || '1024x1024', quality: quality || 'standard' }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.error?.message || 'OpenAI error' });
    return res.status(200).json({ url: d.data[0].url });
  } catch (e) { return res.status(500).json({ error: 'Server error' }); }
}
