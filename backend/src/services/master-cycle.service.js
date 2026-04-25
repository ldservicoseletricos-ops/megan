const fs = require('fs');
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
const gitOps = require('./git-ops.service');
const buildCheck = require('./build-check.service');
const deployGate = require('./deploy-gate.service');
const promotion = require('./promotion.service');
const patchEngine = require('./patch-engine.service');
const repoValidation = require('./repo-validation.service');
const repoGuard = require('./repo-guard.service');
const cycleHistory = require('./cycle-history.service');

function normalizeOptions(options = {}) {
  if (typeof options === 'string') {
    return {
      mode: options,
      autoApply: String(process.env.AUTO_APPLY_PATCHES || 'true').toLowerCase() !== 'false',
      autoCommit: String(process.env.AUTO_COMMIT_PATCHES || 'false').toLowerCase() === 'true',
      repoPath: null,
    };
  }

  return {
    mode: options.mode || 'manual',
    autoApply:
      typeof options.autoApply === 'boolean'
        ? options.autoApply
        : String(process.env.AUTO_APPLY_PATCHES || 'true').toLowerCase() !== 'false',
    autoCommit:
      typeof options.autoCommit === 'boolean'
        ? options.autoCommit
        : String(process.env.AUTO_COMMIT_PATCHES || 'false').toLowerCase() === 'true',
    repoPath: options.repoPath || null,
  };
}

function applyExecutablePatch(patch) {
  const executable = patch.executablePatch;
  if (!executable) {
    return { ok: false, skipped: true, reason: 'Patch sem estratégia executável.' };
  }

  if (executable.mode === 'append_once') {
    const targetPath = repoGuard.resolveTarget(executable.targetFile);
    const current = fs.readFileSync(targetPath, 'utf8');
    if (current.includes(executable.marker)) {
      return { ok: true, skipped: true, reason: 'Patch já aplicado anteriormente.' };
    }
    return patchEngine.applyContentPatch(executable.targetFile, `${current}${executable.appendText}`, executable.reason);
  }

  return { ok: false, skipped: true, reason: 'Modo de patch não suportado.' };
}

function runMasterCycle(options = {}) {
  const cfg = normalizeOptions(options);
  const currentRepo = repo.getRepo();
  if (cfg.repoPath) {
    repo.connectRepo(cfg.repoPath);
  } else if (currentRepo.connected && currentRepo.repoPath) {
    repo.connectRepo(currentRepo.repoPath);
  }

  const repoState = repo.getRepo();
  const repoReport = repoValidation.validateRepo(repoState.repoPath);
  const baseline = stateService.getState();
  const passive = cfg.autoApply && repoReport.ok ? baseline : stateService.simulateTelemetry(baseline);
  const issues = diagnosis.diagnose(passive);
  const hypotheses = hypothesis.buildHypotheses(issues, passive);
  const patches = patchPlanner.planPatches(hypotheses);
  const snap = snapshot.createSnapshot();

  let approvedPatches = 0;
  let appliedPatches = 0;
  const results = [];

  patches.forEach((patch) => {
    try {
      const tested = sandbox.executePatchInSandbox(stateService.getState(), patch);
      const decision = comparator.compare(tested.before, tested.after, patch);
      rollback.prepareRollback(decision);
      const promoted = promotion.promote(tested.after, decision);
      if (promoted.promoted) approvedPatches += 1;

      let realPatch = { ok: false, skipped: true, reason: 'Auto apply desativado.' };
      if (cfg.autoApply && repoReport.ok && decision.approved && patch.risk === 'low') {
        realPatch = applyExecutablePatch(patch);
        if (realPatch.ok && !realPatch.skipped) {
          appliedPatches += 1;
        }
      }

      results.push({
        area: patch.area,
        targetFile: patch.targetFile,
        approved: decision.approved,
        gain: decision.gain,
        reason: decision.reason,
        realPatchApplied: Boolean(realPatch.ok && !realPatch.skipped),
        realPatchResult: realPatch,
      });
    } catch (error) {
      memory.addMemory('cycle_patch_error', 'master_cycle_service', `Erro ao processar patch ${patch.area}: ${error.message}`, 'high');
      results.push({
        area: patch.area,
        targetFile: patch.targetFile,
        approved: false,
        gain: 0,
        reason: `Erro: ${error.message}`,
        realPatchApplied: false,
      });
    }
  });

  const build = buildCheck.runBuildCheck(stateService.getState());
  const preSummary = {
    mode: cfg.mode,
    snapshotId: snap.id,
    approvedPatches,
    appliedPatches,
    totalPatches: patches.length,
    topIssue: issues[0]?.area || 'optimization',
    readiness: stateService.getState().readiness,
    updatedAt: stateService.getState().updatedAt,
  };
  const deploy = deployGate.evaluateDeploy(stateService.getState(), preSummary, build);
  const commit = cfg.autoCommit && appliedPatches > 0 ? gitOps.createCommit(`Megan cycle ${Date.now()} applied patches`) : null;

  const latest = cfg.autoApply && repoReport.ok
    ? stateService.applyRealCycleTelemetry(stateService.getState(), {
        repoConnected: repoState.connected,
        repoValid: repoReport.ok,
        approvedPatches,
        appliedPatches,
        totalPatches: patches.length,
        buildOk: build.ok,
        deployApproved: deploy.approved,
        commitOk: Boolean(commit?.ok),
        rollbackReady: true,
      })
    : stateService.getState();

  const summary = {
    mode: cfg.mode,
    autoApply: cfg.autoApply,
    autoCommit: cfg.autoCommit,
    snapshotId: snap.id,
    approvedPatches,
    appliedPatches,
    totalPatches: patches.length,
    topIssue: issues[0]?.area || 'optimization',
    readiness: latest.readiness,
    updatedAt: latest.updatedAt,
  };

  memory.addMemory(
    'master_cycle',
    'master_cycle_service',
    `Ciclo ${cfg.mode}: ${approvedPatches}/${patches.length} aprovados, ${appliedPatches} aplicados, build ${build.ok ? 'ok' : 'falhou'}, deploy ${deploy.approved ? 'liberado' : 'bloqueado'}.`,
    approvedPatches > 0 ? 'high' : 'medium'
  );

  cycleHistory.addEntry({
    mode: cfg.mode,
    readiness: latest.readiness,
    approvedPatches,
    appliedPatches,
    totalPatches: patches.length,
    buildOk: build.ok,
    deployApproved: deploy.approved,
    repoValid: repoReport.ok,
    topIssue: issues[0]?.area || 'optimization',
    telemetryMode: latest.telemetryMode,
    statusLine: `[Megan Core Master Consolidado] ciclo ${cfg.mode} | readiness=${latest.readiness}% | approvedPatches=${approvedPatches} | appliedPatches=${appliedPatches} | build=${build.ok} | deploy=${deploy.approved}`
  });

  return {
    summary: { ...summary, deployGate: deploy, buildCheck: build, commit, repoValidation: repoReport },
    issues,
    hypotheses,
    patches,
    results,
  };
}

function buildDashboard() {
  const state = stateService.getState();
  const issues = diagnosis.diagnose(state);
  const hypotheses = hypothesis.buildHypotheses(issues, state);
  return {
    overview: {
      systemStatus: state.readiness >= 74 ? 'operational' : 'attention',
      progress: state.readiness,
      evolutionReadiness: state.readiness,
      currentBottleneck: issues[0]?.why || 'Sistema pronto para otimizações proativas.',
      nextBestAction: hypotheses[0]?.proposal || 'Continuar observação controlada.',
      updatedAt: state.updatedAt,
      telemetryMode: state.telemetryMode,
    },
    state,
    issues,
    hypotheses,
    memory: memory.getMemory().slice(0, 20),
  };
}

module.exports = { runMasterCycle, buildDashboard };
