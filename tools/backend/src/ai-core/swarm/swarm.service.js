import { getSystemState, updateSystemState } from "../../db/repositories/system-state.repository.js";
import { listBrainRoutings } from "../../db/repositories/brain-routing.repository.js";

function buildEmptyOverview() {
  return {
    enabled: true,
    totalSessions: 0,
    totalVotes: 0,
    totalBrainsRanked: 0,
    dynamicLeaderEnabled: true,
    recentSessions: [],
    recentVotes: [],
    brainPerformance: [],
    updatedAt: new Date().toISOString()
  };
}

function normalizeSwarmData(systemState = {}) {
  return {
    swarmSessions: Array.isArray(systemState.swarmSessions) ? systemState.swarmSessions : [],
    swarmVotes: Array.isArray(systemState.swarmVotes) ? systemState.swarmVotes : [],
    brainPerformance: Array.isArray(systemState.brainPerformance) ? systemState.brainPerformance : []
  };
}

export function getSwarmOverview() {
  const systemState = getSystemState() || {};
  const { swarmSessions, swarmVotes, brainPerformance } = normalizeSwarmData(systemState);
  const recentBrainRoutes = listBrainRoutings(10);

  return {
    ...buildEmptyOverview(),
    totalSessions: swarmSessions.length,
    totalVotes: swarmVotes.length,
    totalBrainsRanked: brainPerformance.length,
    recentSessions: swarmSessions.slice(0, 10),
    recentVotes: swarmVotes.slice(0, 10),
    brainPerformance: brainPerformance.slice(0, 20),
    recentBrainRoutes,
    updatedAt: systemState.updatedAt || new Date().toISOString()
  };
}

export function registerSwarmSession(payload = {}) {
  const systemState = getSystemState() || {};
  const { swarmSessions, swarmVotes, brainPerformance } = normalizeSwarmData(systemState);

  const entry = {
    id: payload.id || `swarm-session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    userId: payload.userId || "anonymous",
    sessionId: payload.sessionId || null,
    message: payload.message || "",
    selectedBrains: Array.isArray(payload.selectedBrains) ? payload.selectedBrains : [],
    leaderBrain: payload.leaderBrain || "general",
    strategy: payload.strategy || "parallel-consensus",
    createdAt: payload.createdAt || new Date().toISOString()
  };

  const nextState = {
    ...systemState,
    swarmSessions: [entry, ...swarmSessions].slice(0, 200),
    swarmVotes,
    brainPerformance,
    updatedAt: new Date().toISOString()
  };

  updateSystemState(nextState);
  return entry;
}

export function registerSwarmVote(payload = {}) {
  const systemState = getSystemState() || {};
  const { swarmSessions, swarmVotes, brainPerformance } = normalizeSwarmData(systemState);

  const entry = {
    id: payload.id || `swarm-vote-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    sessionId: payload.sessionId || null,
    brain: payload.brain || "general",
    score: Number.isFinite(payload.score) ? payload.score : 0,
    reason: payload.reason || "",
    createdAt: payload.createdAt || new Date().toISOString()
  };

  const nextState = {
    ...systemState,
    swarmSessions,
    swarmVotes: [entry, ...swarmVotes].slice(0, 500),
    brainPerformance,
    updatedAt: new Date().toISOString()
  };

  updateSystemState(nextState);
  return entry;
}

export function updateBrainPerformance(payload = {}) {
  const systemState = getSystemState() || {};
  const { swarmSessions, swarmVotes, brainPerformance } = normalizeSwarmData(systemState);

  const brain = payload.brain || "general";
  const score = Number.isFinite(payload.score) ? payload.score : 0;

  const existing = brainPerformance.find((item) => item.brain === brain);

  let nextPerformance;

  if (existing) {
    const runs = (existing.runs || 0) + 1;
    const totalScore = (existing.totalScore || 0) + score;

    nextPerformance = brainPerformance.map((item) =>
      item.brain === brain
        ? {
            ...item,
            runs,
            totalScore,
            averageScore: totalScore / runs,
            updatedAt: new Date().toISOString()
          }
        : item
    );
  } else {
    nextPerformance = [
      {
        brain,
        runs: 1,
        totalScore: score,
        averageScore: score,
        updatedAt: new Date().toISOString()
      },
      ...brainPerformance
    ];
  }

  const nextState = {
    ...systemState,
    swarmSessions,
    swarmVotes,
    brainPerformance: nextPerformance.slice(0, 100),
    updatedAt: new Date().toISOString()
  };

  updateSystemState(nextState);
  return nextState.brainPerformance;
}