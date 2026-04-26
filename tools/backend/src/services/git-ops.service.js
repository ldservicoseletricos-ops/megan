const fs = require('fs');
const path = require('path');
const repo = require('./repo.service');
const memory = require('./memory.service');
const runner = require('./command-runner.service');

function getRepoPath() {
  const currentRepo = repo.getRepo();
  return currentRepo.repoPath || '';
}

function hasGitRepo(repoPath) {
  return Boolean(repoPath && fs.existsSync(path.join(repoPath, '.git')));
}

function runGit(args) {
  return runner.run('git', args, getRepoPath());
}

function createCommit(message) {
  const currentRepo = repo.getRepo();
  const gitDir = path.join(currentRepo.repoPath || '', '.git');

  if (!currentRepo.connected || !currentRepo.repoPath) {
    memory.addMemory('git_commit_skipped', 'git_ops_service', 'Commit real pulado: repositório não conectado.', 'medium');
    return { ok: false, simulated: true, reason: 'repo not connected' };
  }

  if (!fs.existsSync(gitDir)) {
    memory.addMemory('git_commit_skipped', 'git_ops_service', 'Commit real pulado: pasta .git não encontrada.', 'medium');
    return { ok: false, simulated: true, reason: '.git not found' };
  }

  const addResult = runner.run('git', ['add', '.'], currentRepo.repoPath);
  if (!addResult.ok) {
    memory.addMemory('git_commit_failed', 'git_ops_service', `git add falhou: ${addResult.error || addResult.stderr || addResult.stdout}`, 'high');
    return { ok: false, simulated: false, reason: 'git add failed', detail: addResult };
  }

  const commitResult = runner.run('git', ['commit', '-m', message], currentRepo.repoPath);

  if (!commitResult.ok) {
    const detail = `${commitResult.error || commitResult.stderr || commitResult.stdout}`;
    const nothingToCommit = detail.toLowerCase().includes('nothing to commit') || detail.toLowerCase().includes('nada para commit');
    if (nothingToCommit) {
      memory.addMemory('git_commit_skipped', 'git_ops_service', 'Commit real pulado: não havia alterações para commit.', 'medium');
      return { ok: false, simulated: false, reason: 'nothing to commit', detail: commitResult };
    }

    memory.addMemory('git_commit_failed', 'git_ops_service', `git commit falhou: ${detail}`, 'high');
    return { ok: false, simulated: false, reason: 'git commit failed', detail: commitResult };
  }

  memory.addMemory('git_commit', 'git_ops_service', `Commit real criado: ${message}`, 'high');
  return { ok: true, simulated: false, commitMessage: message, output: commitResult.stdout };
}

function parseRemotes(raw) {
  const map = new Map();
  String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
      if (!match) return;
      const [, name, url, type] = match;
      const current = map.get(name) || { name, fetch: '', push: '' };
      current[type] = url;
      map.set(name, current);
    });
  return Array.from(map.values());
}

function inspectRepository() {
  const repoPath = getRepoPath();
  const connected = repo.getRepo().connected;
  const gitReady = hasGitRepo(repoPath);
  const status = gitReady ? runGit(['status', '--short', '--branch']) : null;
  const branch = gitReady ? runGit(['branch', '--show-current']) : null;
  const remotesResult = gitReady ? runGit(['remote', '-v']) : null;
  const lastCommit = gitReady ? runGit(['log', '-1', '--pretty=%h %s']) : null;
  const remoteList = parseRemotes(remotesResult?.stdout || '');
  const dirty = Boolean(status?.stdout && status.stdout.split(/\r?\n/).some((line) => line.trim() && !line.startsWith('##')));

  return {
    ok: connected && gitReady,
    connected,
    gitReady,
    repoPath,
    branch: String(branch?.stdout || '').trim() || repo.getRepo().branch || 'main',
    dirty,
    statusText: String(status?.stdout || '').trim(),
    lastCommit: String(lastCommit?.stdout || '').trim(),
    remotes: remoteList,
    remoteCount: remoteList.length,
    reasons: [
      connected ? null : 'Repositório não conectado.',
      gitReady ? null : 'Pasta .git não encontrada.',
      remoteList.length > 0 ? null : 'Nenhum remote Git detectado.',
    ].filter(Boolean),
  };
}

function buildPushPlan() {
  const repoInfo = inspectRepository();
  const remote = repoInfo.remotes[0]?.name || 'origin';
  const branch = repoInfo.branch || 'main';
  return {
    ok: repoInfo.ok,
    repoPath: repoInfo.repoPath,
    remote,
    branch,
    commands: [
      `cd ${repoInfo.repoPath || 'C:/megan2'}`,
      'git status --short --branch',
      'git add .',
      `git commit -m "Megan v24.8 release"`,
      `git push ${remote} ${branch}`,
    ],
    summary: repoInfo.ok
      ? `Plano pronto para push em ${remote}/${branch}.`
      : 'Plano gerado, mas o repositório ainda precisa de conexão Git válida.',
  };
}

function buildDeployPreflight() {
  const repoPath = getRepoPath();
  const gitInfo = inspectRepository();
  const frontendPackagePath = path.join(repoPath, 'frontend', 'package.json');
  const backendPackagePath = path.join(repoPath, 'backend', 'package.json');
  const vercelConfigPath = path.join(repoPath, 'vercel.json');
  const renderConfigPath = path.join(repoPath, 'render.yaml');
  const frontendEnvPath = path.join(repoPath, 'frontend', '.env');
  const backendEnvPath = path.join(repoPath, 'backend', '.env');

  const checks = [
    { id: 'git', label: 'Git pronto', ok: gitInfo.ok, detail: gitInfo.ok ? 'Git operacional detectado.' : gitInfo.reasons.join(' ') },
    { id: 'remote', label: 'Remote Git', ok: gitInfo.remoteCount > 0, detail: gitInfo.remoteCount > 0 ? gitInfo.remotes.map((item) => item.name).join(', ') : 'Nenhum remote configurado.' },
    { id: 'frontendPackage', label: 'Frontend package.json', ok: fs.existsSync(frontendPackagePath), detail: frontendPackagePath },
    { id: 'backendPackage', label: 'Backend package.json', ok: fs.existsSync(backendPackagePath), detail: backendPackagePath },
    { id: 'vercelConfig', label: 'Configuração Vercel', ok: fs.existsSync(vercelConfigPath) || fs.existsSync(frontendEnvPath), detail: fs.existsSync(vercelConfigPath) ? vercelConfigPath : frontendEnvPath },
    { id: 'renderConfig', label: 'Configuração Render', ok: fs.existsSync(renderConfigPath) || fs.existsSync(backendEnvPath), detail: fs.existsSync(renderConfigPath) ? renderConfigPath : backendEnvPath },
  ];

  const score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);
  return {
    ok: score >= 66,
    score,
    checkedAt: new Date().toISOString(),
    repoPath,
    checks,
    git: gitInfo,
    pushPlan: buildPushPlan(),
    summary: score >= 66 ? 'Pré-flight de deploy aceitável para operação assistida.' : 'Pré-flight de deploy incompleto. Ajuste os itens pendentes antes do push/deploy.',
    providers: {
      vercel: checks.find((item) => item.id === 'vercelConfig')?.ok || false,
      render: checks.find((item) => item.id === 'renderConfig')?.ok || false,
    },
  };
}

module.exports = { createCommit, inspectRepository, buildPushPlan, buildDeployPreflight };
