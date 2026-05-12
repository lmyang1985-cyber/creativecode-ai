export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, quality } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  // Try multiple models in order until one works
  const models = [
    'stabilityai/sdxl-turbo',
    'runwayml/stable-diffusion-v1-5',
    'CompVis/stable-diffusion-v1-4',
  ];

  for (const model of models) {
    try {
      const r = await fetch('https://api-inference.huggingface.co/models/' + model, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.HUGGINGFACE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: 'blurry, bad quality, distorted',
            num_inference_steps: quality === 'hd' ? 30 : 20,
          },
        }),
      });

      if (r.ok) {
        const buf = await r.arrayBuffer();
        const base64 = Buffer.from(buf).toString('base64');
        return res.status(200).json({ url: 'data:image/jpeg;base64,' + base64 });
      }

      // If model is loading (503), wait and try next
      if (r.status === 503) continue;
      // If 404, try next model
      if (r.status === 404) continue;

      const errText = await r.text().catch(() => 'unknown');
      return res.status(r.status).json({ error: 'Failed: ' + errText.slice(0, 150) });

    } catch (e) {
      continue;
    }
  }

  return res.status(500).json({ error: 'All image models unavailable. Please try again in a moment.' });
}
