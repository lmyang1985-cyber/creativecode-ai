// api/generate-text.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt, type, tone, length } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt required' });
  const wordCount = { short: 100, medium: 300, long: 600 }[length] || 300;
  const systemPrompt = `You are a professional copywriter. Write ${type} content in a ${tone} tone. Keep it around ${wordCount} words. Write only the content itself, no explanations or titles.`;
  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], max_tokens: 1000 }),
    });
    const d = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: d.error?.message || 'OpenAI error' });
    return res.status(200).json({ text: d.choices[0].message.content });
  } catch (e) { return res.status(500).json({ error: 'Server error' }); }
}
