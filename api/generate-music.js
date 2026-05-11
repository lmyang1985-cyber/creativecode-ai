// api/generate-music.js
// Uses Replicate's MusicGen model
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, genre, mood, duration } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  const fullPrompt = [prompt, genre, mood].filter(Boolean).join(', ');
  try {
    // Start prediction
    const r = await fetch('https://api.replicate.com/v1/models/meta/musicgen/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}` },
      body: JSON.stringify({ input: { prompt: fullPrompt, model_version: 'stereo-large', output_format: 'mp3', normalization_strategy: 'peak', duration: duration || 30 } }),
    });
    const pred = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: pred.detail || 'Replicate error' });

    // Poll for result
    const predId = pred.id;
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${predId}`, {
        headers: { 'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}` },
      });
      const pollData = await poll.json();
      if (pollData.status === 'succeeded') return res.status(200).json({ url: pollData.output });
      if (pollData.status === 'failed') return res.status(500).json({ error: 'Music generation failed' });
    }
    return res.status(500).json({ error: 'Timed out' });
  } catch (e) { return res.status(500).json({ error: 'Server error' }); }
}
