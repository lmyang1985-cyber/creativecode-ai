// api/generate-video.js
// Uses Replicate text-to-video model

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const response = await fetch('https://api.replicate.com/v1/models/minimax/video-01/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          prompt_optimizer: true,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.detail || 'Replicate error' });

    return res.status(200).json({ id: data.id });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
