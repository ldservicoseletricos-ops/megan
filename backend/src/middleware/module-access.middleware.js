const moduleAccess = require('../services/module-access.service');

function requireModule(moduleName) {
  return (req, res, next) => {
    const email = String(req.headers['x-megan-user-email'] || req.query.email || req.body?.email || '').trim();
    const session = moduleAccess.getSession(email);

    if (!session?.user) {
      return res.status(401).json({ ok: false, reason: 'Usuário não identificado.' });
    }

    if (!moduleAccess.hasModuleAccess(session.user, moduleName)) {
      return res.status(403).json({ ok: false, reason: `Módulo ${moduleName} não contratado.` });
    }

    req.meganSession = session;
    return next();
  };
}

module.exports = {
  requireModule,
};
