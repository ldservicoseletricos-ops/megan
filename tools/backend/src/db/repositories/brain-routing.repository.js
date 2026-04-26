import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.resolve(__dirname, "../../../data/megan-ai-db.json");

function getDefaultDb() {
  return {
    systemState: {
      activeProfile: "v7-baseline",
      autonomyLevel: "multi-brain-supervised",
      updatedAt: new Date().toISOString()
    },
    conversations: [],
    memories: [],
    evolutionRuns: [],
    internalGoals: [],
    improvementProposals: [],
    evolutionMemory: [],
    userProfiles: [],
    adaptationHistory: [],
    brainRouting: []
  };
}

function ensureDbFile() {
  const dir = path.dirname(DB_FILE);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(getDefaultDb(), null, 2), "utf-8");
  }
}

function readDb() {
  ensureDbFile();

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw || "{}");

    return {
      ...getDefaultDb(),
      ...parsed,
      brainRouting: Array.isArray(parsed.brainRouting) ? parsed.brainRouting : []
    };
  } catch {
    return getDefaultDb();
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function normalizeBrainRouting(payload = {}) {
  return {
    id: payload.id || `brain-route-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    message: payload.message || "",
    category: payload.category || "general",

    leadBrain: payload.leadBrain || payload.selectedBrain || "general",
    selectedBrain: payload.selectedBrain || payload.leadBrain || "general",

    supportBrains: Array.isArray(payload.supportBrains)
      ? payload.supportBrains
      : Array.isArray(payload.supportingBrains)
        ? payload.supportingBrains
        : [],

    supportingBrains: Array.isArray(payload.supportingBrains)
      ? payload.supportingBrains
      : Array.isArray(payload.supportBrains)
        ? payload.supportBrains
        : [],

    selectedBrains: Array.isArray(payload.selectedBrains)
      ? payload.selectedBrains
      : [],

    confidence: Number.isFinite(payload.confidence) ? payload.confidence : 0.5,
    strategy: payload.strategy || "multi-brain-routing",
    responseStyle: payload.responseStyle || "balanced",
    rationale: payload.rationale || "",
    notes: payload.notes || "",
    createdAt: payload.createdAt || new Date().toISOString()
  };
}

export function insertBrainRouting(payload = {}) {
  const db = readDb();
  const entry = normalizeBrainRouting(payload);

  db.brainRouting.unshift(entry);

  if (db.brainRouting.length > 500) {
    db.brainRouting = db.brainRouting.slice(0, 500);
  }

  writeDb(db);
  return entry;
}

export function saveBrainRoute(payload = {}) {
  return insertBrainRouting(payload);
}

export function createBrainRoute(payload = {}) {
  return insertBrainRouting(payload);
}

export function addBrainRoute(payload = {}) {
  return insertBrainRouting(payload);
}

export function recordBrainRoute(payload = {}) {
  return insertBrainRouting(payload);
}

export function getRecentBrainRoutes(limit = 20) {
  const db = readDb();
  const safeLimit = Number.isFinite(limit) ? limit : 20;
  return db.brainRouting.slice(0, safeLimit);
}

export function listBrainRoutes(limit = 20) {
  return getRecentBrainRoutes(limit);
}

export function getBrainRoutes(limit = 20) {
  return getRecentBrainRoutes(limit);
}

export function listBrainRoutings(limit = 20) {
  return getRecentBrainRoutes(limit);
}

export function getBrainRoutings(limit = 20) {
  return getRecentBrainRoutes(limit);
}

export function getBrainRoutingOverview(limit = 20) {
  const routes = getRecentBrainRoutes(limit);

  const byLeadBrain = routes.reduce((acc, item) => {
    const key = item.leadBrain || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const byCategory = routes.reduce((acc, item) => {
    const key = item.category || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    totalRoutes: routes.length,
    byLeadBrain,
    byCategory,
    recentRoutes: routes
  };
}

const brainRoutingRepository = {
  insertBrainRouting,
  saveBrainRoute,
  createBrainRoute,
  addBrainRoute,
  recordBrainRoute,
  getRecentBrainRoutes,
  listBrainRoutes,
  getBrainRoutes,
  listBrainRoutings,
  getBrainRoutings,
  getBrainRoutingOverview
};

export default brainRoutingRepository;