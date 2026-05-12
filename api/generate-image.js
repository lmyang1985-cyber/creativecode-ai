export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, size, quality } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const r = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.HUGGINGFACE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: 'blurry, bad quality, distorted, ugly',
          num_inference_steps: quality === 'hd' ? 50 : 30,
          guidance_scale: 7.5,
        },
      }),
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => 'unknown');
      return res.status(r.status).json({ error: 'Image generation failed: ' + errText.slice(0, 100) });
    }
    const buf = await r.arrayBuffer();
    const base64 = Buffer.from(buf).toString('base64');
    return res.status(200).json({ url: 'data:image/jpeg;base64,' + base64 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
