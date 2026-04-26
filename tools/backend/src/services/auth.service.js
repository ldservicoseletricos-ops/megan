const path = require('path');
const crypto = require('crypto');
const { readJson, writeJson } = require('./_utils');

const usersPath = path.join(__dirname, '..', 'data', 'auth-users.json');
const sessionsPath = path.join(__dirname, '..', 'data', 'auth-sessions.json');

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

function login(email, password) {
  const users = readJson(usersPath, []);
  const user = users.find((item) => item.email.toLowerCase() === String(email).toLowerCase() && item.password === password);
  if (!user) throw new Error('Credenciais inválidas.');
  const sessions = readJson(sessionsPath, []);
  const token = crypto.randomBytes(24).toString('hex');
  sessions.push({ id: crypto.randomUUID(), token, userId: user.id, createdAt: new Date().toISOString() });
  writeJson(sessionsPath, sessions);
  return { token, user: sanitizeUser(user) };
}

function getSession(token) {
  if (!token) return null;
  const sessions = readJson(sessionsPath, []);
  const current = sessions.find((item) => item.token === token);
  if (!current) return null;
  const users = readJson(usersPath, []);
  const user = users.find((item) => item.id === current.userId);
  if (!user) return null;
  return { session: current, user: sanitizeUser(user) };
}

function logout(token) {
  const sessions = readJson(sessionsPath, []);
  writeJson(sessionsPath, sessions.filter((item) => item.token !== token));
  return { ok: true };
}

function updateUserPlan(userId, planId, modules) {
  const users = readJson(usersPath, []);
  const idx = users.findIndex((item) => item.id === userId);
  if (idx === -1) throw new Error('Usuário não encontrado.');
  users[idx].planId = planId;
  users[idx].modules = modules;
  writeJson(usersPath, users);
  return sanitizeUser(users[idx]);
}

module.exports = { login, getSession, logout, updateUserPlan };
