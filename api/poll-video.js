export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });
  try {
    const r = await fetch('https://api.replicate.com/v1/predictions/' + id, {
      headers: { 'Authorization': 'Bearer ' + process.env.REPLICATE_API_KEY },
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Poll failed: ' + r.status });
    const data = await r.json();
    if (data.status === 'starting' || data.status === 'processing') {
      return res.status(202).json({ status: data.status });
    }
    if (data.status === 'failed') {
      return res.status(500).json({ error: data.error || 'Video generation failed' });
    }
    if (data.status === 'succeeded') {
      const url = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!url) return res.status(500).json({ error: 'No output URL returned' });
      return res.status(200).json({ url: url });
    }
    return res.status(202).json({ status: 'queued' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
