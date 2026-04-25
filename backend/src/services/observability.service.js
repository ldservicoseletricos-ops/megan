
const { readJson, writeJson } = require('./store.service');

const FILE = 'observability.json';

function nowIso() {
  return new Date().toISOString();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function baseState() {
  return {
    cycleCount: 0,
    cpu: 43,
    ram: 58,
    latency: 178,
    errorRate: 7,
    successRate: 84,
    memoryConsistency: 61,
    criticStability: 58,
    regressionCoverage: 41,
    retrievalQuality: 57,
    retentionSignal: 49,
    revenueSignal: 28,
    leadsToday: 18,
    conversionRate: 11,
    avgTicket: 147,
    revenueToday: 960,
    pipelineTotal: 23,
    updatedAt: nowIso()
  };
}

function getState() {
  return readJson(FILE, baseState());
}

function saveState(state) {
  writeJson(FILE, state);
}

function simulateTelemetry(state) {
  const next = { ...state };
  next.cycleCount += 1;

  next.cpu = clamp(next.cpu + (next.cycleCount % 2 === 0 ? 1 : -1), 28, 82);
  next.ram = clamp(next.ram + (next.cycleCount % 3 === 0 ? 1 : 0), 34, 88);
  next.latency = clamp(next.latency - 4 + (next.cycleCount % 5 === 0 ? 5 : 0), 78, 280);
  next.errorRate = clamp(next.errorRate - 1 + (next.cycleCount % 6 === 0 ? 1 : 0), 1, 20);
  next.successRate = clamp(next.successRate + 1 - (next.cycleCount % 7 === 0 ? 1 : 0), 60, 98);

  next.memoryConsistency = clamp(next.memoryConsistency + 1, 30, 90);
  next.criticStability = clamp(next.criticStability + 1, 25, 88);
  next.regressionCoverage = clamp(next.regressionCoverage + 2, 15, 86);
  next.retrievalQuality = clamp(next.retrievalQuality + 1, 20, 89);
  next.retentionSignal = clamp(next.retentionSignal + 1, 20, 84);
  next.revenueSignal = clamp(next.revenueSignal + 2, 10, 82);

  next.leadsToday = clamp(next.leadsToday + (next.cycleCount % 2 === 0 ? 1 : 0), 8, 120);
  next.conversionRate = clamp(next.conversionRate + (next.cycleCount % 4 === 0 ? 1 : 0), 6, 28);
  next.avgTicket = clamp(next.avgTicket + (next.cycleCount % 3 === 0 ? 3 : 1), 90, 420);
  next.revenueToday = clamp(next.revenueToday + next.conversionRate * 11, 300, 50000);
  next.pipelineTotal = clamp(next.pipelineTotal + (next.cycleCount % 2 === 0 ? 1 : 0), 10, 220);
  next.updatedAt = nowIso();

  saveState(next);
  return next;
}

module.exports = {
  getState,
  saveState,
  simulateTelemetry
};
