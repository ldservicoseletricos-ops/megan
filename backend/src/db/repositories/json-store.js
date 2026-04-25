import fs from "fs";
import path from "path";
import { DATA_DIR } from "../../utils/data-path.js";


const DB_FILE = path.join(DATA_DIR, "megan-ai-db.json");

function createDefaultDb() {
  return {
    interactions: [],
    memories: [],
    learnedRules: [],
    experiments: [],
    evolutionRuns: [],
    internalGoals: [],
    improvementProposals: [],
    evolutionMemory: [],
    userProfiles: [],
    adaptationHistory: [],
    brainRoutes: [],
    swarmSessions: [],
    swarmVotes: [],
    brainPerformance: [],
    agentRuns: [],
    agentTasks: [],
    systemState: {
      activeProfile: "v17-overseer-control-center",
      lastEvolutionAt: null,
      lastPromotionAt: null,
      autonomyLevel: "orchestrated-resilient-overseer",
      activeGoals: [],
      lastDiagnostics: null,
      lastPriorities: [],
      lastAdaptiveReviewAt: null,
      lastSwarmReviewAt: null,
      lastAgentReviewAt: null
    }
  };
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(createDefaultDb(), null, 2), "utf-8");
    return;
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  const defaults = createDefaultDb();
  const nextDb = {
    ...defaults,
    ...db,
    internalGoals: db.internalGoals || defaults.internalGoals,
    improvementProposals: db.improvementProposals || defaults.improvementProposals,
    evolutionMemory: db.evolutionMemory || defaults.evolutionMemory,
    userProfiles: db.userProfiles || defaults.userProfiles,
    adaptationHistory: db.adaptationHistory || defaults.adaptationHistory,
    brainRoutes: db.brainRoutes || defaults.brainRoutes,
    swarmSessions: db.swarmSessions || defaults.swarmSessions,
    swarmVotes: db.swarmVotes || defaults.swarmVotes,
    brainPerformance: db.brainPerformance || defaults.brainPerformance,
    agentRuns: db.agentRuns || defaults.agentRuns,
    agentTasks: db.agentTasks || defaults.agentTasks,
    systemState: {
      ...defaults.systemState,
      ...(db.systemState || {})
    }
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(nextDb, null, 2), "utf-8");
}

export function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

export function writeDb(data) {
  ensureDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getDbPath() {
  ensureDb();
  return DB_FILE;
}
