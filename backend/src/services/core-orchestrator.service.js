import { buildMasterDecisionCore } from './master-decision-core.service.js';
import { runCoordinatedAutonomy } from './coordinated-autonomy.service.js';
import { runAutoEvolution } from './auto-evolution.service.js';
import { runMemoryEvolution } from './memory-evolution.service.js';
import { runFinalEvolution } from './final-evolution.service.js';
import { runUnifiedBrain } from './unified-brain.service.js';

export function runPhase7Orchestrator({ intent = {}, memory = {}, execution = {}, planner = {}, blockers = [], history = [] } = {}) {
  const autonomy = runCoordinatedAutonomy({ goals: memory?.goals || {}, planner, blockers });
  const decision = buildMasterDecisionCore({ intent, route: execution?.route || null, blockers, autonomy });
  const evolution = runAutoEvolution({ history, memory });
  const memoryEvolution = runMemoryEvolution({ memory, rankedContext: memory?.rankedContext || [] });
  const finalEvolution = runFinalEvolution({ autonomy, evolution, memoryEvolution });
  const unified = runUnifiedBrain({ intent, memory, autonomy, execution, evolution: finalEvolution });

  return {
    ok: true,
    mode: 'phase7-orchestrator-v1',
    autonomy,
    decision,
    evolution,
    memoryEvolution,
    finalEvolution,
    unified,
    createdAt: new Date().toISOString(),
  };
}
