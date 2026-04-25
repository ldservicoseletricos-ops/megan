const { clamp } = require('./state.service');

function executePatchInSandbox(state, patch) {
  const before = { ...state };
  const after = { ...state };

  switch (patch.area) {
    case 'memory_core':
      after.memoryConsistency = clamp(after.memoryConsistency + 6, 0, 100);
      break;
    case 'critic':
      after.criticStability = clamp(after.criticStability + 6, 0, 100);
      after.errorRate = clamp(after.errorRate - 1, 0, 100);
      break;
    case 'tests':
      after.regressionCoverage = clamp(after.regressionCoverage + 8, 0, 100);
      after.successRate = clamp(after.successRate + 1, 0, 100);
      break;
    case 'rollback':
      after.rollbackSafety = clamp(after.rollbackSafety + 7, 0, 100);
      break;
    case 'sandbox':
      after.sandboxReliability = clamp(after.sandboxReliability + 7, 0, 100);
      break;
    case 'real_patch':
      after.realPatchReadiness = clamp(after.realPatchReadiness + 8, 0, 100);
      break;
    case 'git':
      after.gitReadiness = clamp(after.gitReadiness + 7, 0, 100);
      break;
    case 'build':
      after.buildReadiness = clamp(after.buildReadiness + 7, 0, 100);
      break;
    case 'deploy':
      after.deployReadiness = clamp(after.deployReadiness + 7, 0, 100);
      break;
    case 'optimization_cycle':
      after.realPatchReadiness = clamp(after.realPatchReadiness + 5, 0, 100);
      after.buildReadiness = clamp(after.buildReadiness + 5, 0, 100);
      after.deployReadiness = clamp(after.deployReadiness + 5, 0, 100);
      break;
    case 'observability':
      after.memoryConsistency = clamp(after.memoryConsistency + 5, 0, 100);
      after.criticStability = clamp(after.criticStability + 5, 0, 100);
      after.gitReadiness = clamp(after.gitReadiness + 4, 0, 100);
      break;
    case 'deploy_ready':
      after.deployReadiness = clamp(after.deployReadiness + 6, 0, 100);
      after.buildReadiness = clamp(after.buildReadiness + 4, 0, 100);
      after.successRate = clamp(after.successRate + 1, 0, 100);
      break;
    default:
      break;
  }

  return { before, after, patch };
}

module.exports = { executePatchInSandbox };
