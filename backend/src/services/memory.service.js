const { readJson, writeJson } = require('./store.service');

const EVENTS_FILE = 'master-memory.json';
const LEGACY_FILE = 'memory.json';
const MAX_ITEMS = 120;

function legacyFallback() {
  return {
    lastObjective: '',
    activeFocus: '',
    timeline: [],
    notes: [],
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeEvents(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(Boolean)
    .map((item, index) => ({
      id: item.id || Date.now() + index,
      type: item.type || 'note',
      source: item.source || 'memory_service',
      content: item.content || item.text || item.message || '',
      impact: item.impact || item.priority || 'medium',
      timestamp: item.timestamp || new Date().toISOString(),
    }))
    .filter((item) => item.content);
}

function getLegacyMemory() {
  const raw = readJson(LEGACY_FILE, legacyFallback);
  return isPlainObject(raw) ? raw : legacyFallback();
}

function setLegacyMemory(payload = {}) {
  const next = isPlainObject(payload) ? { ...legacyFallback(), ...payload } : legacyFallback();
  writeJson(LEGACY_FILE, next);
  return next;
}

function getMemory() {
  const raw = readJson(EVENTS_FILE, []);
  return normalizeEvents(raw).slice(0, MAX_ITEMS);
}

function getItems() {
  return getMemory();
}

function addMemory(type, source, content, impact = 'medium') {
  const items = getMemory();
  const entry = {
    id: Date.now(),
    type: type || 'note',
    source: source || 'memory_service',
    content: String(content || '').trim(),
    impact: impact || 'medium',
    timestamp: new Date().toISOString(),
  };

  if (!entry.content) {
    return { ok: false, skipped: true, reason: 'Conteúdo vazio.' };
  }

  items.unshift(entry);
  writeJson(EVENTS_FILE, items.slice(0, MAX_ITEMS));
  return entry;
}

function addItem(type, source, content, impact = 'medium') {
  return addMemory(type, source, content, impact);
}

function updateMemory(payload = {}) {
  if (Array.isArray(payload)) {
    const nextItems = normalizeEvents(payload).slice(0, MAX_ITEMS);
    writeJson(EVENTS_FILE, nextItems);
    return nextItems;
  }

  if (Array.isArray(payload.items)) {
    const nextItems = normalizeEvents(payload.items).slice(0, MAX_ITEMS);
    writeJson(EVENTS_FILE, nextItems);
    return nextItems;
  }

  if (Array.isArray(payload.memory)) {
    const nextItems = normalizeEvents(payload.memory).slice(0, MAX_ITEMS);
    writeJson(EVENTS_FILE, nextItems);
    return nextItems;
  }

  if (isPlainObject(payload.memory)) {
    setLegacyMemory(payload.memory);
    return getMemory();
  }

  if (isPlainObject(payload)) {
    setLegacyMemory(payload);
    return getMemory();
  }

  return getMemory();
}

module.exports = {
  getMemory,
  getItems,
  addMemory,
  addItem,
  updateMemory,
  getLegacyMemory,
  setLegacyMemory,
};
