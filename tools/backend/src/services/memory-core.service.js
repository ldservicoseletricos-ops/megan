import crypto from 'crypto';
import { readDb, writeDb } from '../db/repositories/json-store.js';
import { listInteractions } from '../db/repositories/interaction.repository.js';
import { getUserProfile, upsertUserProfile } from '../db/repositories/user-profile.repository.js';

const DEFAULT_USER_ID = 'anonymous';
const WORKING_MEMORY_LIMIT = 12;
const EPISODIC_MEMORY_LIMIT = 120;
const RECALL_LIMIT = 8;

function normalizeUserId(userId) {
  return String(userId || DEFAULT_USER_ID).trim() || DEFAULT_USER_ID;
}

function ensureMemoryCoreState(db) {
  if (!db.systemState) db.systemState = {};
  if (!db.systemState.memoryCore) {
    db.systemState.memoryCore = {
      version: '30.0.0',
      profilesByUser: {},
      workingMemoryByUser: {},
      contextSummaryByUser: {},
      statsByUser: {},
      lastOptimizationAt: null,
      totalStoreOperations: 0,
      totalRecallOperations: 0
    };
  }

  const core = db.systemState.memoryCore;
  core.version = '30.0.0';
  if (!core.profilesByUser) core.profilesByUser = {};
  if (!core.workingMemoryByUser) core.workingMemoryByUser = {};
  if (!core.contextSummaryByUser) core.contextSummaryByUser = {};
  if (!core.statsByUser) core.statsByUser = {};
  return core;
}

function ensureUserMemory(core, userId) {
  if (!Array.isArray(core.workingMemoryByUser[userId])) {
    core.workingMemoryByUser[userId] = [];
  }
  if (!core.contextSummaryByUser[userId]) {
    core.contextSummaryByUser[userId] = {
      summary: '',
      highlights: [],
      updatedAt: null
    };
  }
  if (!core.statsByUser[userId]) {
    core.statsByUser[userId] = {
      totalStored: 0,
      totalRecalled: 0,
      lastStoredAt: null,
      lastRecalledAt: null
    };
  }
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeType(type) {
  const value = String(type || 'note').trim().toLowerCase();
  if (['preference', 'episodic', 'working', 'profile', 'context', 'fact', 'goal', 'constraint', 'summary', 'note'].includes(value)) {
    return value;
  }
  return 'note';
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function inferTags(text = '', type = 'note') {
  const lower = String(text).toLowerCase();
  const tags = [type];

  if (lower.includes('powershell')) tags.push('powershell');
  if (lower.includes('arquivo')) tags.push('files');
  if (lower.includes('completo')) tags.push('complete_output');
  if (lower.includes('colar')) tags.push('paste_ready');
  if (lower.includes('fase')) tags.push('phases');
  if (lower.includes('nao quebrar') || lower.includes('sem quebrar')) tags.push('safe_changes');
  if (lower.includes('megan')) tags.push('megan');

  return unique(tags);
}

function buildMemoryRecord(payload = {}) {
  const createdAt = nowIso();
  const type = normalizeType(payload.type);
  const text = String(payload.text || payload.content || payload.note || '').trim();

  return {
    memoryId: crypto.randomUUID(),
    userId: normalizeUserId(payload.userId),
    type,
    text,
    importance: Math.max(1, Math.min(10, Number(payload.importance || (type === 'preference' ? 8 : 6)) || 6)),
    source: payload.source || 'manual_store',
    tags: unique([...(Array.isArray(payload.tags) ? payload.tags : []), ...inferTags(text, type)]),
    metadata: {
      ...(payload.metadata || {}),
      phase: '30',
      storedBy: 'memory_core'
    },
    createdAt,
    updatedAt: createdAt,
    lastRecalledAt: null,
    recallCount: 0
  };
}

function scoreMemory(memory, queryTokens = []) {
  const haystack = `${memory.text || ''} ${(memory.tags || []).join(' ')} ${memory.type || ''}`.toLowerCase();
  let score = Number(memory.importance || 0) * 2;

  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 5;
  }

  if ((memory.type || '') === 'preference') score += 3;
  if ((memory.type || '') === 'constraint') score += 2;
  if (memory.lastRecalledAt) score += 1;
  return score;
}

function buildContextSummary({ workingMemory = [], episodicMemories = [], interactions = [] }) {
  const highlights = [];

  const recentTexts = workingMemory.slice(-5).map((item) => item.text).filter(Boolean);
  const recentEpisodes = episodicMemories.slice(-3).map((item) => item.text).filter(Boolean);
  const recentInteractionMessages = interactions.slice(-3).map((item) => item.message).filter(Boolean);

  if (recentTexts.length) highlights.push(`Memória recente: ${recentTexts.join(' | ')}`);
  if (recentEpisodes.length) highlights.push(`Eventos relevantes: ${recentEpisodes.join(' | ')}`);
  if (recentInteractionMessages.length) highlights.push(`Últimas mensagens: ${recentInteractionMessages.join(' | ')}`);

  return {
    summary: highlights.join(' || '),
    highlights,
    updatedAt: nowIso()
  };
}

function refreshUserProfileMemory(db, userId) {
  const core = ensureMemoryCoreState(db);
  ensureUserMemory(core, userId);

  const profileRepo = getUserProfile(userId) || {};
  const userMemories = (db.memories || []).filter((item) => item.userId === userId);
  const preferenceMemories = userMemories.filter((item) => item.type === 'preference');
  const constraintMemories = userMemories.filter((item) => item.type === 'constraint');
  const interactions = listInteractions().filter((item) => item.userId === userId);

  const explicitPreferences = unique([
    ...(profileRepo.explicitPreferences || []),
    ...preferenceMemories.map((item) => item.text)
  ]).slice(0, 15);

  const recurringObjectives = unique([
    ...(profileRepo.recurringObjectives || []),
    ...userMemories.filter((item) => item.type === 'goal').map((item) => item.text)
  ]).slice(0, 10);

  const profileMemory = {
    userId,
    responseStyle: profileRepo.responseStyle || 'clear_practical',
    detailLevel: profileRepo.detailLevel || 'high',
    preferredMode: profileRepo.preferredMode || 'adaptive_execution',
    technicalLevel: profileRepo.technicalLevel || 'advanced_practical',
    explicitPreferences,
    recurringObjectives,
    constraints: constraintMemories.slice(-10).map((item) => item.text),
    interactionCount: interactions.length,
    confidence: profileRepo.confidence || Math.min(0.99, Number((0.35 + interactions.length * 0.015).toFixed(2))),
    updatedAt: nowIso()
  };

  core.profilesByUser[userId] = profileMemory;

  upsertUserProfile({
    userId,
    preferredMode: profileMemory.preferredMode,
    responseStyle: profileMemory.responseStyle,
    detailLevel: profileMemory.detailLevel,
    technicalLevel: profileMemory.technicalLevel,
    explicitPreferences: profileMemory.explicitPreferences,
    recurringObjectives: profileMemory.recurringObjectives,
    interactionCount: profileMemory.interactionCount,
    confidence: profileMemory.confidence,
    lastContextSnapshot: {
      memoryCoreUpdatedAt: profileMemory.updatedAt,
      constraints: profileMemory.constraints,
      explicitPreferences: profileMemory.explicitPreferences,
      recurringObjectives: profileMemory.recurringObjectives
    }
  });

  return profileMemory;
}

export function getMemoryOverview(userId = DEFAULT_USER_ID) {
  const normalizedUserId = normalizeUserId(userId);
  const db = readDb();
  const core = ensureMemoryCoreState(db);
  ensureUserMemory(core, normalizedUserId);

  const allMemories = (db.memories || []).filter((item) => item.userId === normalizedUserId);
  const episodicMemories = allMemories.filter((item) => ['episodic', 'fact', 'goal', 'constraint', 'note'].includes(item.type));
  const profileMemory = core.profilesByUser[normalizedUserId] || refreshUserProfileMemory(db, normalizedUserId);
  const workingMemory = core.workingMemoryByUser[normalizedUserId] || [];
  const contextSummary = core.contextSummaryByUser[normalizedUserId] || { summary: '', highlights: [], updatedAt: null };
  const stats = core.statsByUser[normalizedUserId] || {};

  writeDb(db);

  return {
    userId: normalizedUserId,
    version: '30.0.0',
    profileMemory,
    episodicMemoryCount: episodicMemories.length,
    recentEpisodicMemories: episodicMemories.slice(-10).reverse(),
    workingMemoryCount: workingMemory.length,
    workingMemory,
    contextSummary,
    stats: {
      totalStored: stats.totalStored || 0,
      totalRecalled: stats.totalRecalled || 0,
      lastStoredAt: stats.lastStoredAt || null,
      lastRecalledAt: stats.lastRecalledAt || null
    }
  };
}

export function storeMemory(payload = {}) {
  const db = readDb();
  const core = ensureMemoryCoreState(db);
  const userId = normalizeUserId(payload.userId);
  ensureUserMemory(core, userId);

  const record = buildMemoryRecord({ ...payload, userId });
  if (!record.text) {
    throw new Error('text is required');
  }

  if (!Array.isArray(db.memories)) db.memories = [];
  db.memories.push(record);
  db.memories = db.memories.slice(-5000);

  const workingRecord = {
    memoryId: record.memoryId,
    type: record.type,
    text: record.text,
    tags: record.tags,
    importance: record.importance,
    createdAt: record.createdAt,
    source: record.source
  };

  core.workingMemoryByUser[userId].push(workingRecord);
  core.workingMemoryByUser[userId] = core.workingMemoryByUser[userId].slice(-WORKING_MEMORY_LIMIT);

  const episodicMemories = db.memories
    .filter((item) => item.userId === userId)
    .slice(-EPISODIC_MEMORY_LIMIT);

  const interactions = listInteractions().filter((item) => item.userId === userId);
  core.contextSummaryByUser[userId] = buildContextSummary({
    workingMemory: core.workingMemoryByUser[userId],
    episodicMemories,
    interactions
  });

  const profileMemory = refreshUserProfileMemory(db, userId);

  core.totalStoreOperations = Number(core.totalStoreOperations || 0) + 1;
  core.lastOptimizationAt = nowIso();
  core.statsByUser[userId].totalStored = Number(core.statsByUser[userId].totalStored || 0) + 1;
  core.statsByUser[userId].lastStoredAt = record.createdAt;

  db.systemState.version = '30.0.0';
  db.systemState.activeProfile = 'v30-memory-core-engine';
  db.systemState.autonomyLevel = 'memory-aware-simulation-assisted-orchestration';
  db.systemState.lastMemoryUpdateAt = record.createdAt;

  writeDb(db);

  return {
    ok: true,
    stored: record,
    profileMemory,
    contextSummary: core.contextSummaryByUser[userId],
    overview: getMemoryOverview(userId)
  };
}

export function recallMemory(payload = {}) {
  const db = readDb();
  const core = ensureMemoryCoreState(db);
  const userId = normalizeUserId(payload.userId);
  ensureUserMemory(core, userId);

  const query = String(payload.query || '').trim();
  const queryTokens = tokenize(query);
  const userMemories = (db.memories || []).filter((item) => item.userId === userId);
  const sortedMatches = userMemories
    .map((item) => ({ item, score: scoreMemory(item, queryTokens) }))
    .filter(({ item, score }) => score > Number(item.importance || 0) * 2 - 1)
    .sort((a, b) => b.score - a.score || String(b.item.createdAt).localeCompare(String(a.item.createdAt)))
    .slice(0, RECALL_LIMIT);

  const recalledAt = nowIso();
  for (const match of sortedMatches) {
    const target = userMemories.find((item) => item.memoryId === match.item.memoryId);
    if (target) {
      target.lastRecalledAt = recalledAt;
      target.recallCount = Number(target.recallCount || 0) + 1;
      target.updatedAt = recalledAt;
    }
  }

  const profileMemory = core.profilesByUser[userId] || refreshUserProfileMemory(db, userId);
  const workingMemory = core.workingMemoryByUser[userId] || [];
  const contextSummary = core.contextSummaryByUser[userId] || { summary: '', highlights: [], updatedAt: null };

  core.totalRecallOperations = Number(core.totalRecallOperations || 0) + 1;
  core.statsByUser[userId].totalRecalled = Number(core.statsByUser[userId].totalRecalled || 0) + 1;
  core.statsByUser[userId].lastRecalledAt = recalledAt;
  db.systemState.lastMemoryRecallAt = recalledAt;

  writeDb(db);

  return {
    ok: true,
    userId,
    query,
    recalledAt,
    matches: sortedMatches.map(({ item, score }) => ({ ...item, relevanceScore: score })),
    profileMemory,
    workingMemory,
    contextSummary
  };
}
