
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function testHypothesis(metrics, hypothesis) {
  const before = { ...metrics };
  const after = { ...metrics };

  switch (hypothesis.area) {
    case 'memory_core':
      after.memoryConsistency = clamp(after.memoryConsistency + 6, 0, 100);
      after.latency = clamp(after.latency - 8, 40, 300);
      break;
    case 'critic':
      after.criticStability = clamp(after.criticStability + 6, 0, 100);
      after.errorRate = clamp(after.errorRate - 1, 0, 100);
      break;
    case 'quality':
      after.regressionCoverage = clamp(after.regressionCoverage + 7, 0, 100);
      after.successRate = clamp(after.successRate + 1, 0, 100);
      break;
    case 'latency':
      after.latency = clamp(after.latency - 14, 40, 300);
      after.cpu = clamp(after.cpu - 2, 0, 100);
      break;
    case 'retention':
      after.retentionSignal = clamp(after.retentionSignal + 5, 0, 100);
      break;
    case 'revenue':
      after.revenueSignal = clamp(after.revenueSignal + 5, 0, 100);
      after.revenueToday = clamp(after.revenueToday + 240, 0, 999999);
      break;
    case 'sales':
      after.conversionRate = clamp(after.conversionRate + 2, 0, 100);
      after.pipelineTotal = clamp(after.pipelineTotal + 2, 0, 999);
      break;
    default:
      break;
  }

  return { before, after };
}

module.exports = { testHypothesis };
