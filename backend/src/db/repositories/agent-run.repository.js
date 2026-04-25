import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.resolve(__dirname, "../../../data/megan-ai-db.json");

function getDefaultDb() {
  return {
    systemState: {
      activeProfile: "v9-baseline",
      autonomyLevel: "autonomous-agents",
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
    brainRouting: [],
    agentRuns: [],
    agentTasks: []
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
      agentRuns: Array.isArray(parsed.agentRuns) ? parsed.agentRuns : [],
      agentTasks: Array.isArray(parsed.agentTasks) ? parsed.agentTasks : []
    };
  } catch {
    return getDefaultDb();
  }
}

function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function normalizeAgentRun(payload = {}) {
  return {
    id: payload.id || `agent-run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    objective: payload.objective || payload.message || "",
    selectedAgents: Array.isArray(payload.selectedAgents) ? payload.selectedAgents : [],
    leadAgent: payload.leadAgent || "supervisor_agent",
    pipelineStatus: payload.pipelineStatus || "created",
    supervisorReview: payload.supervisorReview || null,
    summary: payload.summary || "",
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt || new Date().toISOString()
  };
}

export function insertAgentRun(payload = {}) {
  const db = readDb();
  const entry = normalizeAgentRun(payload);

  db.agentRuns.unshift(entry);

  if (db.agentRuns.length > 500) {
    db.agentRuns = db.agentRuns.slice(0, 500);
  }

  writeDb(db);
  return entry;
}

export function createAgentRun(payload = {}) {
  return insertAgentRun(payload);
}

export function saveAgentRun(payload = {}) {
  return insertAgentRun(payload);
}

export function addAgentRun(payload = {}) {
  return insertAgentRun(payload);
}

export function recordAgentRun(payload = {}) {
  return insertAgentRun(payload);
}

export function listAgentRuns(limit = 20) {
  const db = readDb();
  const safeLimit = Number.isFinite(limit) ? limit : 20;
  return db.agentRuns.slice(0, safeLimit);
}

export function getAgentRuns(limit = 20) {
  return listAgentRuns(limit);
}

export function getRecentAgentRuns(limit = 20) {
  return listAgentRuns(limit);
}

const agentRunRepository = {
  insertAgentRun,
  createAgentRun,
  saveAgentRun,
  addAgentRun,
  recordAgentRun,
  listAgentRuns,
  getAgentRuns,
  getRecentAgentRuns
};

export default agentRunRepository;