export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, type, tone, length } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  const wordCount = { short: 100, medium: 300, long: 600 }[length] || 300;
  const fullPrompt = 'Write a ' + type + ' in a ' + tone + ' tone, about ' + wordCount + ' words. Topic: ' + prompt + '\n\nOutput only the content, no extra explanation:';
  try {
    const r = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.HUGGINGFACE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 700,
          temperature: 0.7,
          return_full_text: false,
          do_sample: true,
        },
      }),
    });
    if (!r.ok) {
      const errText = await r.text().catch(() => 'unknown');
      return res.status(r.status).json({ error: 'Text generation failed: ' + errText.slice(0, 100) });
    }
    const data = await r.json();
    const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
    if (!text) return res.status(500).json({ error: 'No text generated. Please try again.' });
    return res.status(200).json({ text: text.trim() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
