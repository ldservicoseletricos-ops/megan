const { readJson, writeJson } = require('./store.service');

const FILE = 'master-state.json';

function nowIso() {
  return new Date().toISOString();
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function baseState() {
  return {
    cycleCount: 0,
    readiness: 60,
    memoryConsistency: 62,
    criticStability: 59,
    regressionCoverage: 43,
    rollbackSafety: 58,
    sandboxReliability: 56,
    patchApprovalRate: 25,
    deployReadiness: 46,
    gitReadiness: 51,
    buildReadiness: 50,
    realPatchReadiness: 48,
    latency: 170,
    errorRate: 7,
    successRate: 86,
    repoConnected: false,
    telemetryMode: 'simulated',
    updatedAt: nowIso(),
  };
}

function getState() {
  return readJson(FILE, baseState());
}

function saveState(state) {
  writeJson(FILE, state);
}

function recomputeReadiness(state) {
  state.readiness = Math.round(
    state.memoryConsistency * 0.12 +
      state.criticStability * 0.12 +
      state.regressionCoverage * 0.12 +
      state.rollbackSafety * 0.12 +
      state.sandboxReliability * 0.12 +
      state.gitReadiness * 0.1 +
      state.buildReadiness * 0.1 +
      state.deployReadiness * 0.1 +
      state.realPatchReadiness * 0.1
  );
  return state;
}

function simulateTelemetry(current) {
  const next = { ...current };
  next.cycleCount += 1;
  next.latency = clamp(next.latency - 2 + (next.cycleCount % 5 === 0 ? 4 : 0), 70, 280);
  next.errorRate = clamp(next.errorRate - 1 + (next.cycleCount % 6 === 0 ? 1 : 0), 1, 25);
  next.successRate = clamp(next.successRate + 1 - (next.cycleCount % 7 === 0 ? 1 : 0), 55, 99);
  next.memoryConsistency = clamp(next.memoryConsistency + 1, 25, 92);
  next.criticStability = clamp(next.criticStability + 1, 25, 90);
  next.regressionCoverage = clamp(next.regressionCoverage + 2, 10, 90);
  next.rollbackSafety = clamp(next.rollbackSafety + 1, 25, 94);
  next.sandboxReliability = clamp(next.sandboxReliability + 1, 25, 94);
  next.deployReadiness = clamp(next.deployReadiness + 1, 15, 90);
  next.gitReadiness = clamp(next.gitReadiness + 1, 15, 92);
  next.buildReadiness = clamp(next.buildReadiness + 1, 15, 91);
  next.realPatchReadiness = clamp(next.realPatchReadiness + 1, 15, 90);
  next.repoConnected = next.repoConnected || false;
  next.telemetryMode = 'simulated';
  recomputeReadiness(next);
  next.updatedAt = nowIso();
  saveState(next);
  return next;
}

function applyRealCycleTelemetry(current, report = {}) {
  const next = { ...current };
  next.cycleCount += 1;
  next.repoConnected = Boolean(report.repoConnected);

  const approvedCount = Number(report.approvedPatches || 0);
  const appliedCount = Number(report.appliedPatches || 0);
  const patchTotal = Math.max(1, Number(report.totalPatches || 0));
  const buildOk = Boolean(report.buildOk);
  const repoValid = Boolean(report.repoValid);
  const deployApproved = Boolean(report.deployApproved);
  const commitOk = Boolean(report.commitOk);

  next.patchApprovalRate = clamp(Math.round((approvedCount / patchTotal) * 100), 0, 100);
  next.realPatchReadiness = clamp(next.realPatchReadiness + (appliedCount > 0 ? 8 : approvedCount > 0 ? 4 : -1), 15, 95);
  next.regressionCoverage = clamp(next.regressionCoverage + (buildOk ? 4 : 1), 10, 95);
  next.buildReadiness = clamp(next.buildReadiness + (buildOk ? 8 : -6), 10, 96);
  next.deployReadiness = clamp(next.deployReadiness + (deployApproved ? 7 : -2), 10, 96);
  next.gitReadiness = clamp(next.gitReadiness + (commitOk ? 6 : appliedCount > 0 ? 2 : 0), 10, 96);
  next.rollbackSafety = clamp(next.rollbackSafety + (report.rollbackReady ? 3 : 0), 15, 97);
  next.sandboxReliability = clamp(next.sandboxReliability + 2, 15, 96);
  next.memoryConsistency = clamp(next.memoryConsistency + (repoValid ? 2 : 0), 20, 96);
  next.criticStability = clamp(next.criticStability + (approvedCount > 0 ? 2 : 1), 20, 96);
  next.successRate = clamp(next.successRate + (buildOk ? 2 : -2), 40, 99);
  next.errorRate = clamp(next.errorRate + (buildOk ? -1 : 2), 1, 25);
  next.latency = clamp(next.latency - 3 + (buildOk ? -1 : 3), 60, 280);
  next.telemetryMode = 'real';
  recomputeReadiness(next);
  next.updatedAt = nowIso();
  saveState(next);
  return next;
}

module.exports = { getState, saveState, simulateTelemetry, applyRealCycleTelemetry, clamp };
