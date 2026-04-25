const fs = require('fs');
const path = require('path');

const PRIMARY_DATA_DIR = path.join(__dirname, '..', 'data');
const FALLBACK_DATA_DIR = path.join(__dirname, '..', '..', 'data');
const users = [];
const messages = [];

function getDataDir() {
  if (fs.existsSync(PRIMARY_DATA_DIR)) {
    return PRIMARY_DATA_DIR;
  }
  return FALLBACK_DATA_DIR;
}

function ensureDataDir() {
  const target = getDataDir();
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  return target;
}

function readJson(fileName, fallback) {
  const dataDir = ensureDataDir();
  const filePath = path.join(dataDir, fileName);

  if (!fs.existsSync(filePath)) {
    return typeof fallback === 'function' ? fallback() : fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_error) {
    return typeof fallback === 'function' ? fallback() : fallback;
  }
}

function writeJson(fileName, payload) {
  const dataDir = ensureDataDir();
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

function addUser(user) {
  users.push(user);
  return user;
}

function findUserByEmail(email) {
  return users.find((item) => item.email === email) || null;
}

function listUsers() {
  return users;
}

function addMessage(item) {
  messages.push(item);
  return item;
}

function listMessages() {
  return messages;
}

module.exports = {
  readJson,
  writeJson,
  addUser,
  findUserByEmail,
  listUsers,
  addMessage,
  listMessages,
};
