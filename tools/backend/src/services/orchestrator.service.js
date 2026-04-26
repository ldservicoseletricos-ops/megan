
const stateService = require('./state.service');
const memory = require('./memory.service');
const repo = require('./repo.service');
const diagnosis = require('./diagnosis.service');
const hypothesis = require('./hypothesis.service');
const patchPlanner = require('./patch-planner.service');
const snapshot = require('./snapshot.service');
const sandbox = require('./sandbox-executor.service');
const comparator = require('./comparator.service');
const rollback = require('./rollback.service');
const promotion = require('./promotion.service');
const deployGate = require('./deploy-gate.service');

function runEvolutionCycle(mode = 'manual') {
  repo.autoDetectRepo();
  const passive = stateService.simulatePassiveDrift(stateService.getState());
  const issues = diagnosis.diagnose(passive);
  const hypotheses = hypothesis.buildHypotheses(issues);
  const patches = patchPlanner.planPatches(hypotheses);
  const snap = snapshot.createSnapshot();

  let approvedPatches = 0;
  const results = [];

  patches.forEach((patch) => {
    const tested = sandbox.executePatchInSandbox(stateService.getState(), patch);
    const decision = comparator.compare(tested.before, tested.after, patch);
    rollback.rollback(decision);
    const promoted = promotion.promote(tested.after, decision);
    if (promoted.promoted) approvedPatches += 1;
    results.push({
      area: patch.area,
      targetFile: patch.targetFile,
      approved: decision.approved,
      gain: decision.gain,
      reason: decision.reason
    });
  });

  const latest = stateService.getState();
  const summary = {
    mode,
    snapshotId: snap.id,
    approvedPatches,
    totalPatches: patches.length,
    topIssue: issues[0]?.area || 'none',
    readiness: latest.readiness,
    updatedAt: latest.updatedAt
  };

  const gate = deployGate.evaluateDeploy(latest, summary);

  memory.addMemory(
    'cycle_summary',
    'orchestrator_service',
    `Ciclo ${mode}: ${approvedPatches}/${patches.length} patches aprovados. Deploy gate: ${gate.approved ? 'liberado' : 'bloqueado'}.`,
    approvedPatches > 0 ? 'high' : 'medium'
  );

  return {
    summary,
    issues,
    hypotheses,
    patches,
    results,
    deployGate: gate
  };
}

function buildDashboard() {
  const state = stateService.getState();
  const issues = diagnosis.diagnose(state);
  const hypotheses = hypothesis.buildHypotheses(issues);
  return {
    overview: {
      systemStatus: state.readiness >= 74 ? 'operational' : 'attention',
      progress: state.readiness,
      evolutionReadiness: state.readiness,
      currentBottleneck: issues[0]?.why || 'Sem gargalo crítico.',
      nextBestAction: hypotheses[0]?.proposal || 'Continuar observação controlada.',
      updatedAt: state.updatedAt
    },
    state,
    issues,
    hypotheses,
    memory: memory.getMemory().slice(0, 20)
  };
}

module.exports = { runEvolutionCycle, buildDashboard };
