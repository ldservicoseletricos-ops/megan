const fs = require('fs');
const path = require('path');
const repo = require('./repo.service');
const memory = require('./memory.service');
const runner = require('./command-runner.service');

function computeFallbackScore(state) {
  return Math.round(
    state.regressionCoverage * 0.35 +
    state.criticStability * 0.25 +
    state.successRate * 0.20 +
    state.sandboxReliability * 0.20
  );
}

function getBuildCommand(projectDir) {
  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg && pkg.scripts && pkg.scripts.build) {
      return { command: 'npm', args: ['run', 'build'] };
    }
    return null;
  } catch {
    return null;
  }
}

function summarizeRunnerResult(result, reason) {
  return {
    ok: Boolean(result?.ok),
    skipped: false,
    status: typeof result?.status === 'number' ? result.status : -1,
    stdout: result?.stdout || '',
    stderr: result?.stderr || '',
    error: result?.error || '',
    reason,
  };
}

function runProjectBuild(projectDir, label) {
  if (!fs.existsSync(projectDir)) {
    return {
      ok: false,
      skipped: true,
      status: -1,
      stdout: '',
      stderr: '',
      error: '',
      reason: `${label} inexistente em ${projectDir}`,
    };
  }

  const buildCmd = getBuildCommand(projectDir);
  if (!buildCmd) {
    return {
      ok: true,
      skipped: true,
      status: 0,
      stdout: '',
      stderr: '',
      error: '',
      reason: `Build inexistente em ${projectDir}`,
    };
  }

  const nodeModulesDir = path.join(projectDir, 'node_modules');
  if (!fs.existsSync(nodeModulesDir)) {
    return {
      ok: false,
      skipped: true,
      status: -1,
      stdout: '',
      stderr: '',
      error: '',
      reason: `Dependências ausentes em ${projectDir}. Execute npm install antes do build real.`,
    };
  }

  const result = runner.run(buildCmd.command, buildCmd.args, projectDir);
  return summarizeRunnerResult(result, result.ok ? `Build ${label} concluído.` : `Build ${label} falhou.`);
}

function runBuildCheck(state) {
  const currentRepo = repo.getRepo();
  if (!currentRepo.connected || !currentRepo.repoPath) {
    const score = computeFallbackScore(state);
    return { ok: score >= 68, score, simulated: true, reason: 'Build check lógico: repo não conectado.' };
  }

  const backendDir = path.join(currentRepo.repoPath, 'backend');
  const frontendDir = path.join(currentRepo.repoPath, 'frontend');

  const backendResult = runProjectBuild(backendDir, 'backend');
  const frontendResult = runProjectBuild(frontendDir, 'frontend');

  const hardFailure = (!backendResult.ok && !backendResult.skipped) || (!frontendResult.ok && !frontendResult.skipped);
  const dependencyGap = backendResult.reason.includes('npm install') || frontendResult.reason.includes('npm install');
  const ok = !hardFailure && !dependencyGap;
  const score = ok ? 88 : dependencyGap ? 58 : 45;

  memory.addMemory(
    ok ? 'build_check_ok' : 'build_check_failed',
    'build_check_service',
    ok
      ? 'Build real/controlado executado com sucesso.'
      : `Build não aprovado. backend=${backendResult.reason} frontend=${frontendResult.reason}`,
    ok ? 'high' : 'medium'
  );

  return {
    ok,
    score,
    simulated: false,
    reason: ok ? 'Build real/controlado aprovado.' : 'Build real/controlado reprovado.',
    backend: backendResult,
    frontend: frontendResult,
  };
}

module.exports = { runBuildCheck };
