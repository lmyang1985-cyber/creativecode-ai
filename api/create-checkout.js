export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { type, planIndex } = req.body;
  const CREDIT_PRICES = [
    process.env.STRIPE_PRICE_STARTER,
    process.env.STRIPE_PRICE_BASIC,
    process.env.STRIPE_PRICE_PRO,
  ];
  const SUB_PRICES = [
    process.env.STRIPE_PRICE_MONTHLY,
    process.env.STRIPE_PRICE_ANNUAL,
  ];
  const priceId = type === 'credits' ? CREDIT_PRICES[planIndex] : SUB_PRICES[planIndex];
  if (!priceId) return res.status(400).json({ error: 'Invalid plan selected' });
  const mode = type === 'credits' ? 'payment' : 'subscription';
  const successUrl = process.env.SITE_URL + '?payment=success&type=' + type + '&plan=' + planIndex;
  const cancelUrl = process.env.SITE_URL + '?payment=cancelled';
  try {
    const params = new URLSearchParams({
      mode: mode,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.STRIPE_SECRET_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.error?.message || 'Stripe error' });
    return res.status(200).json({ url: data.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
