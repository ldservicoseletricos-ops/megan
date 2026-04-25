import { getSystemState, updateSystemState } from "../../db/repositories/system-state.repository.js";

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildDiagnostics(systemState = {}) {
  const evolutionRuns = safeArray(systemState.evolutionRuns);
  const internalGoals = safeArray(systemState.internalGoals);
  const improvementProposals = safeArray(systemState.improvementProposals);
  const evolutionMemory = safeArray(systemState.evolutionMemory);
  const userProfiles = safeArray(systemState.userProfiles);
  const adaptationHistory = safeArray(systemState.adaptationHistory);
  const brainRouting = safeArray(systemState.brainRouting);
  const agentRuns = safeArray(systemState.agentRuns);
  const agentTasks = safeArray(systemState.agentTasks);

  return {
    totalEvolutionRuns: evolutionRuns.length,
    totalInternalGoals: internalGoals.length,
    totalImprovementProposals: improvementProposals.length,
    totalEvolutionMemoryItems: evolutionMemory.length,
    totalUserProfiles: userProfiles.length,
    totalAdaptationHistory: adaptationHistory.length,
    totalBrainRoutes: brainRouting.length,
    totalAgentRuns: agentRuns.length,
    totalAgentTasks: agentTasks.length
  };
}

function buildCycleRecord(systemState = {}, diagnostics = {}) {
  return {
    id: `evolution-run-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    activeProfile: systemState.activeProfile || "v9-baseline",
    autonomyLevel: systemState.autonomyLevel || "autonomous-agents",
    diagnostics,
    summary: "Self-evolution cycle executed successfully",
    createdAt: new Date().toISOString()
  };
}

export async function runSelfEvolutionCycle() {
  const systemState = getSystemState() || {};
  const diagnostics = buildDiagnostics(systemState);
  const cycleRecord = buildCycleRecord(systemState, diagnostics);

  const nextEvolutionRuns = [cycleRecord, ...safeArray(systemState.evolutionRuns)].slice(0, 200);

  const nextState = {
    ...systemState,
    version: systemState.version || "9.0.0",
    systemName: systemState.systemName || "Megan AI Core",
    activeProfile: systemState.activeProfile || "v9-baseline",
    autonomyLevel: systemState.autonomyLevel || "autonomous-agents",
    evolutionRuns: nextEvolutionRuns,
    lastEvolutionAt: cycleRecord.createdAt,
    updatedAt: new Date().toISOString()
  };

  updateSystemState(nextState);

  return {
    ok: true,
    message: "Self-evolution cycle completed",
    cycle: cycleRecord,
    overview: getEvolutionOverview()
  };
}

export function getEvolutionOverview() {
  const systemState = getSystemState() || {};
  const diagnostics = buildDiagnostics(systemState);
  const evolutionRuns = safeArray(systemState.evolutionRuns);

  return {
    ok: true,
    system: systemState.systemName || "Megan AI Core",
    version: systemState.version || "9.0.0",
    activeProfile: systemState.activeProfile || "v9-baseline",
    autonomyLevel: systemState.autonomyLevel || "autonomous-agents",
    totalEvolutionRuns: evolutionRuns.length,
    lastEvolutionAt: systemState.lastEvolutionAt || null,
    diagnostics,
    recentEvolutionRuns: evolutionRuns.slice(0, 10),
    updatedAt: systemState.updatedAt || new Date().toISOString()
  };
}

const selfEvolutionService = {
  runSelfEvolutionCycle,
  getEvolutionOverview
};

export default selfEvolutionService;