// ============================================================
// api/poll-video.js
// ============================================================
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID required' });
  try {
    const r = await fetch(`https://api.stability.ai/v2beta/image-to-video/result/${id}`, {
      headers: { 'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`, 'Accept': 'video/*' },
    });
    if (r.status === 202) return res.status(202).json({ status: 'processing' });
    if (!r.ok) { const e = await r.json().catch(() => ({})); return res.status(r.status).json({ error: e.message || 'Poll failed' }); }
    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', 'video/mp4');
    return res.status(200).send(Buffer.from(buf));
  } catch (e) { return res.status(500).json({ error: 'Server error' }); }
}
