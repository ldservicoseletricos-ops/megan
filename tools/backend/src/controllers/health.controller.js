export function healthController(req, res) {
  res.json({
    ok: true,
    system: 'Megan Master Fase 8',
    timestamp: new Date().toISOString(),
  });
}
