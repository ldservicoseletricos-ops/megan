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

function normalizeAgentTask(payload = {}) {
  return {
    id: payload.id || `agent-task-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    runId: payload.runId || null,
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    agent: payload.agent || "operator_agent",
    title: payload.title || "untitled_task",
    description: payload.description || "",
    status: payload.status || "pending",
    input: payload.input || null,
    output: payload.output || null,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: payload.updatedAt || new Date().toISOString()
  };
}

export function insertAgentTask(payload = {}) {
  const db = readDb();
  const entry = normalizeAgentTask(payload);

  db.agentTasks.unshift(entry);

  if (db.agentTasks.length > 1000) {
    db.agentTasks = db.agentTasks.slice(0, 1000);
  }

  writeDb(db);
  return entry;
}

export function createAgentTask(payload = {}) {
  return insertAgentTask(payload);
}

export function saveAgentTask(payload = {}) {
  return insertAgentTask(payload);
}

export function addAgentTask(payload = {}) {
  return insertAgentTask(payload);
}

export function recordAgentTask(payload = {}) {
  return insertAgentTask(payload);
}

export function listAgentTasks(limit = 50) {
  const db = readDb();
  const safeLimit = Number.isFinite(limit) ? limit : 50;
  return db.agentTasks.slice(0, safeLimit);
}

export function getAgentTasks(limit = 50) {
  return listAgentTasks(limit);
}

export function getRecentAgentTasks(limit = 50) {
  return listAgentTasks(limit);
}

const agentTaskRepository = {
  insertAgentTask,
  createAgentTask,
  saveAgentTask,
  addAgentTask,
  recordAgentTask,
  listAgentTasks,
  getAgentTasks,
  getRecentAgentTasks
};

export default agentTaskRepository;