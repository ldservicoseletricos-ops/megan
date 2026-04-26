const auth = require('../services/auth.service');

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = auth.getSession(token);
  if (!session) return res.status(401).json({ ok: false, reason: 'Sessão inválida.' });
  req.auth = session;
  next();
}

module.exports = { requireAuth };
