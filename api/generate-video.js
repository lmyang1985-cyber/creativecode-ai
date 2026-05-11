// api/generate-video.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, cfg_scale, seed, hd } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const body = { text_prompts: [{ text: prompt, weight: 1 }], cfg_scale: cfg_scale || 5, motion_bucket_id: 127, fps: hd ? 8 : 6 };
    if (seed && !isNaN(parseInt(seed))) body.seed = parseInt(seed);
    const r = await fetch('https://api.stability.ai/v2beta/image-to-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`, 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.message || 'Stability AI error' });
    return res.status(200).json({ id: d.id });
  } catch (e) { return res.status(500).json({ error: 'Server error' }); }
}
