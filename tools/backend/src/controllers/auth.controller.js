import { addUser, findUserByEmail } from '../services/store.service.js';

export function registerController(req, res) {
  const { email = '', password = '' } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email e senha são obrigatórios' });
  }

  const exists = findUserByEmail(email);
  if (exists) {
    return res.status(409).json({ ok: false, message: 'Usuário já existe' });
  }

  const user = { id: Date.now().toString(), email, password, role: 'user' };
  addUser(user);
  res.json({ ok: true, user });
}

export function loginController(req, res) {
  const { email = '' } = req.body || {};
  const user = findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ ok: false, message: 'Usuário não encontrado' });
  }

  res.json({
    ok: true,
    token: 'demo-jwt-token',
    user,
  });
}
