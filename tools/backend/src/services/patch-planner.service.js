function resolveTargetFile(area) {
  if (area === 'memory_core') return 'backend/src/services/memory.service.js';
  if (area === 'critic') return 'backend/src/ai-core/critic/critic.service.js';
  if (area === 'tests') return 'frontend/src/App.jsx';
  if (area === 'rollback') return 'backend/src/services/rollback.service.js';
  if (area === 'sandbox') return 'backend/src/services/sandbox-executor.service.js';
  if (area === 'real_patch') return 'frontend/src/App.jsx';
  if (area === 'git') return 'backend/src/services/git-ops.service.js';
  if (area === 'build') return 'backend/src/services/build-check.service.js';
  if (area === 'optimization_cycle') return 'backend/server.js';
  if (area === 'observability') return 'backend/src/app.js';
  if (area === 'deploy_ready') return 'backend/src/services/deploy-gate.service.js';
  return 'backend/src/services/deploy-gate.service.js';
}

function buildExecutablePatch(area, targetFile) {
  const markerMap = {
    tests: '/* MEGAN_PHASE2_PATCH_MARKER */',
    real_patch: '/* MEGAN_PHASE2_REAL_PATCH_MARKER */',
    build: '// MEGAN_PHASE2_BUILD_MARKER',
    rollback: '// MEGAN_AUTO_EVOLUTION_ROLLBACK_MARKER',
    sandbox: '// MEGAN_AUTO_EVOLUTION_SANDBOX_MARKER',
    optimization_cycle: '// MEGAN_AUTO_EVOLUTION_OPTIMIZATION_MARKER',
    observability: '// MEGAN_AUTO_EVOLUTION_OBSERVABILITY_MARKER',
    deploy_ready: '// MEGAN_AUTO_EVOLUTION_DEPLOY_MARKER',
  };

  const marker = markerMap[area];
  if (!marker) {
    return null;
  }

  return {
    mode: 'append_once',
    targetFile,
    marker,
    appendText: `
${marker}
`,
    reason: `Patch seguro de autoevolução aplicado em ${targetFile}.`,
  };
}

function planPatches(hypotheses) {
  return hypotheses.map((item, index) => {
    const targetFile = resolveTargetFile(item.area);
    return {
      id: item.id,
      area: item.area,
      targetFile,
      patchSummary: item.proposal,
      expectedGain: item.expectedGain,
      risk: item.risk,
      approvalRequired: item.risk !== 'low',
      diffPreview: `PATCH ${index + 1}: ${item.title}`,
      status: 'planned',
      executablePatch: buildExecutablePatch(item.area, targetFile),
    };
  });
}

module.exports = { planPatches, resolveTargetFile };
