
const observability = require('./observability.service');
const memory = require('./memory.service');
const diagnosis = require('./diagnosis.service');
const hypothesis = require('./hypothesis.service');
const sandbox = require('./sandbox.service');
const comparator = require('./comparator.service');
const promotion = require('./promotion.service');

function computeReadiness(metrics) {
  return Math.round(
    metrics.memoryConsistency * 0.20 +
    metrics.criticStability * 0.20 +
    metrics.regressionCoverage * 0.17 +
    metrics.retrievalQuality * 0.12 +
    metrics.retentionSignal * 0.11 +
    metrics.revenueSignal * 0.10 +
    metrics.conversionRate * 0.10
  );
}

function runFullCycle(mode = 'manual') {
  const metrics = observability.simulateTelemetry(observability.getState());
  const issues = diagnosis.rankIssues(metrics);
  const hypotheses = hypothesis.buildHypotheses(issues);

  let promotedChanges = 0;
  const testResults = [];

  hypotheses.forEach((item) => {
    const tested = sandbox.testHypothesis(observability.getState(), item);
    const decision = comparator.compare(tested.before, tested.after, item);
    const promotionResult = promotion.promote(tested.after, decision);
    if (promotionResult.promoted) promotedChanges += 1;
    testResults.push({
      area: item.area,
      title: item.title,
      approved: decision.approved,
      gain: decision.gain,
      reason: decision.reason
    });
  });

  const latest = observability.getState();
  const summary = {
    mode,
    promotedChanges,
    totalHypotheses: hypotheses.length,
    topIssue: issues[0]?.area || 'none',
    evolutionReadiness: computeReadiness(latest),
    updatedAt: latest.updatedAt
  };

  memory.addItem(
    'cycle_summary',
    'cycle_runner',
    `Ciclo ${mode}: ${promotedChanges}/${hypotheses.length} mudanças promovidas. Readiness ${summary.evolutionReadiness}.`,
    promotedChanges > 0 ? 'high' : 'medium'
  );

  return { summary, metrics: latest, issues, hypotheses, testResults };
}

function buildDashboard() {
  const metrics = observability.getState();
  const issues = diagnosis.rankIssues(metrics);
  const hypotheses = hypothesis.buildHypotheses(issues);

  return {
    overview: {
      systemStatus: computeReadiness(metrics) >= 74 ? 'operational' : 'attention',
      progress: computeReadiness(metrics),
      evolutionReadiness: computeReadiness(metrics),
      currentBottleneck: issues[0]?.why || 'Sem gargalo crítico.',
      nextBestAction: hypotheses[0]?.proposal || 'Continuar observação controlada.',
      updatedAt: metrics.updatedAt
    },
    metrics,
    issues,
    hypotheses,
    memory: memory.getItems().slice(0, 20)
  };
}

module.exports = {
  runFullCycle,
  buildDashboard,
  computeReadiness
};
