function getPortalConfig() {
  return {
    enabled: String(process.env.STRIPE_CUSTOMER_PORTAL_ENABLED || 'true') === 'true',
    mode: process.env.STRIPE_SECRET_KEY ? 'live_ready' : 'simulation',
  };
}

function createPortalSession(payload = {}) {
  return {
    url: `${process.env.APP_BASE_URL || 'http://localhost:5176'}/portal?customer=${encodeURIComponent(payload.email || '')}`,
    simulated: !process.env.STRIPE_SECRET_KEY,
  };
}

module.exports = { getPortalConfig, createPortalSession };
