export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    if (!body || !body.imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Data = body.imageBase64.includes(',')
      ? body.imageBase64.split(',')[1]
      : body.imageBase64;

    const imageBuffer = Buffer.from(base64Data, 'base64');
    const fmt = body.format || 'png';
    const boundary = 'cc' + Date.now();
    const nl = '\r\n';

    const head = Buffer.from(
      '--' + boundary + nl +
      'Content-Disposition: form-data; name="size"' + nl + nl +
      'auto' + nl +
      '--' + boundary + nl +
      'Content-Disposition: form-data; name="format"' + nl + nl +
      fmt + nl +
      '--' + boundary + nl +
      'Content-Disposition: form-data; name="image_file"; filename="img.jpg"' + nl +
      'Content-Type: image/jpeg' + nl + nl
    );

    const tail = Buffer.from(nl + '--' + boundary + '--' + nl);
    const payload = Buffer.concat([head, imageBuffer, tail]);

    const rbRes = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY || '',
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
      },
      body: payload,
    });

    if (!rbRes.ok) {
      const msg = await rbRes.text().catch(() => 'unknown');
      return res.status(rbRes.status).json({ error: 'remove.bg: ' + rbRes.status + ' ' + msg.slice(0, 200) });
    }

    const arr = await rbRes.arrayBuffer();
    const b64 = Buffer.from(arr).toString('base64');
    return res.status(200).json({ image: 'data:image/png;base64,' + b64 });

  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
