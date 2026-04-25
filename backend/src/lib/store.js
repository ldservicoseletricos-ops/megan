import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function baseShape() {
  return {
    users: [],
    userProfiles: {},
    userMemories: {},
    userSessions: {},
    personalizedSettings: {},
    userPermissions: {},
    projects: {},
    conversations: {},
    auditLogs: [],
    performanceSnapshots: [],
    executiveQueue: [],
    pendingItems: [],
    autonomousRuns: [],
    learningLogs: [],
    strategyReports: [],
    selfUpgrades: [],
    ceoPanels: [],
    businessGoals: [],
    growthReports: [],
    salesReports: [],
    marketingReports: [],
    companyPanels: [],
    unifiedDecisions: [],
    commandCenter: []
  };
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function ensureDb() {
  ensureDir(DATA_DIR);

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(baseShape(), null, 2), "utf-8");
    return;
  }

  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const parsed = safeParse(raw);
  fs.writeFileSync(DB_FILE, JSON.stringify({ ...baseShape(), ...parsed }, null, 2), "utf-8");
}

function getDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  const parsed = safeParse(raw);
  return { ...baseShape(), ...parsed };
}

function writeDb(data) {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify({ ...baseShape(), ...(data || {}) }, null, 2), "utf-8");
}

function updateDb(mutator) {
  const db = getDb();
  const draft = clone(db);
  const maybe = mutator(draft);
  const next = maybe || draft;
  writeDb(next);
  return next;
}

function normalizeText(value) {
  return String(value || "").trim();
}

function generateId(prefix = "id") {
  if (typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createConversationRecord({ id, title = "Nova conversa" } = {}) {
  const now = new Date().toISOString();

  return {
    id: normalizeText(id) || generateId("conv"),
    title: normalizeText(title) || "Nova conversa",
    createdAt: now,
    updatedAt: now,
    memory: null,
    messages: []
  };
}

function listConversations() {
  const conversations = Object.values(getDb().conversations || {})
    .filter(Boolean)
    .filter((item) => item && item.id);

  return conversations.sort((a, b) => {
    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

function getConversation(id) {
  const safeId = normalizeText(id);
  if (!safeId) return null;
  return getDb().conversations?.[safeId] || null;
}

function createConversation(title = "Nova conversa", id = "") {
  const record = createConversationRecord({ id, title });

  updateDb((draft) => {
    draft.conversations[record.id] = record;
    return draft;
  });

  return getConversation(record.id);
}

function updateConversation(id, updater) {
  const safeId = normalizeText(id);
  if (!safeId) return null;

  const current = getConversation(safeId);
  if (!current) return null;

  updateDb((draft) => {
    const base = draft.conversations[safeId] || current;

    const nextPartial =
      typeof updater === "function"
        ? updater(clone(base))
        : updater;

    draft.conversations[safeId] = {
      ...base,
      ...(nextPartial || {}),
      id: safeId,
      updatedAt: new Date().toISOString()
    };

    return draft;
  });

  return getConversation(safeId);
}

function deleteConversation(id) {
  const safeId = normalizeText(id);
  if (!safeId) return false;

  updateDb((draft) => {
    delete draft.conversations[safeId];
    return draft;
  });

  return true;
}

export {
  DB_FILE,
  ensureDb,
  getDb,
  writeDb,
  updateDb,
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation
};