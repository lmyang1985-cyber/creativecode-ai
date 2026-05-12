export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { imageBase64, format } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const boundary = 'ccboundary' + Date.now();
    const nl = '\r\n';
    const head = Buffer.from(
      '--' + boundary + nl +
      'Content-Disposition: form-data; name="size"' + nl + nl +
      'auto' + nl +
      '--' + boundary + nl +
      'Content-Disposition: form-data; name="format"' + nl + nl +
      (format || 'png') + nl +
      '--' + boundary + nl +
      'Content-Disposition: form-data; name="image_file"; filename="image.jpg"' + nl +
      'Content-Type: image/jpeg' + nl + nl
    );
    const tail = Buffer.from(nl + '--' + boundary + '--' + nl);
    const payload = Buffer.concat([head, imageBuffer, tail]);
    const r = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY || '',
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
      },
      body: payload,
    });
    if (!r.ok) {
      const msg = await r.text().catch(() => 'unknown');
      return res.status(r.status).json({ error: 'remove.bg error ' + r.status + ': ' + msg.slice(0, 150) });
    }
    const arr = await r.arrayBuffer();
    const b64 = Buffer.from(arr).toString('base64');
    return res.status(200).json({ image: 'data:image/png;base64,' + b64 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
