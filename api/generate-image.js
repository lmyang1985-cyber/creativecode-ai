export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, quality } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  try {
    const r = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.HUGGINGFACE_API_KEY,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true',
      },
      body: JSON.stringify({ inputs: prompt }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      return res.status(r.status).json({ error: 'HuggingFace error ' + r.status + ': ' + t.slice(0, 100) });
    }
    const buf = await r.arrayBuffer();
    const b64 = Buffer.from(buf).toString('base64');
    return res.status(200).json({ url: 'data:image/jpeg;base64,' + b64 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
