export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, quality } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const r = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.HUGGINGFACE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: quality === 'hd' ? 4 : 2,
          guidance_scale: 0,
        },
      }),
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => 'unknown');
      return res.status(r.status).json({ error: 'Image generation failed: ' + errText.slice(0, 150) });
    }
    const buf = await r.arrayBuffer();
    const base64 = Buffer.from(buf).toString('base64');
    return res.status(200).json({ url: 'data:image/jpeg;base64,' + base64 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
