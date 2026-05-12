export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const r = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        input: { prompt: prompt, prompt_optimizer: true },
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.detail || 'Video generation failed' });
    return res.status(200).json({ id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
