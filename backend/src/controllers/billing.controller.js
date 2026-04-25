export function billingController(req, res) {
  res.json({
    ok: true,
    plans: ['free', 'pro', 'business'],
    stripeReady: false,
  });
}
