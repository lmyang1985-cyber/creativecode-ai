export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, genre, mood, duration } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  const fullPrompt = [prompt, genre, mood].filter(Boolean).join(', ');
  try {
    const r = await fetch('https://api.replicate.com/v1/models/meta/musicgen/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.REPLICATE_API_KEY,
      },
      body: JSON.stringify({
        input: {
          prompt: fullPrompt,
          model_version: 'stereo-large',
          output_format: 'mp3',
          normalization_strategy: 'peak',
          duration: duration || 30,
        },
      }),
    });
    const pred = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: pred.detail || 'Music generation failed' });
    const predId = pred.id;
    for (let i = 0; i < 40; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const poll = await fetch('https://api.replicate.com/v1/predictions/' + predId, {
        headers: { 'Authorization': 'Bearer ' + process.env.REPLICATE_API_KEY },
      });
      const pd = await poll.json();
      if (pd.status === 'succeeded') return res.status(200).json({ url: pd.output });
      if (pd.status === 'failed') return res.status(500).json({ error: 'Music generation failed' });
    }
    return res.status(500).json({ error: 'Timed out. Please try again.' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
