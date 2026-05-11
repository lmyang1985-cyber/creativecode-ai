// api/remove-background.js
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, format } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to buffer
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Build multipart form manually
    const boundary = 'boundary' + Date.now();
    const CRLF = '\r\n';

    const part1 = Buffer.from(
      '--' + boundary + CRLF +
      'Content-Disposition: form-data; name="size"' + CRLF + CRLF +
      'auto' + CRLF +
      '--' + boundary + CRLF +
      'Content-Disposition: form-data; name="format"' + CRLF + CRLF +
      (format || 'png') + CRLF +
      '--' + boundary + CRLF +
      'Content-Disposition: form-data; name="image_file"; filename="image.jpg"' + CRLF +
      'Content-Type: image/jpeg' + CRLF + CRLF
    );

    const part2 = Buffer.from(CRLF + '--' + boundary + '--' + CRLF);
    const bodyBuffer = Buffer.concat([part1, imageBuffer, part2]);

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': String(bodyBuffer.length),
      },
      body: bodyBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('remove.bg error:', response.status, errorText);
      return res.status(response.status).json({ error: 'remove.bg error: ' + response.status });
    }

    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString('base64');

    return res.status(200).json({
      image: 'data:image/png;base64,' + resultBase64
    });

  } catch (err) {
    console.error('remove-background error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
