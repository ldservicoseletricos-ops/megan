const fs = require('fs');
const path = require('path');
const https = require('https');

const repoService = require('./repo.service');
const gitOps = require('./git-ops.service');
const autonomyTotal = require('./autonomy-total.service');
const runner = require('./command-runner.service');

const dataDir = path.resolve(__dirname, '..', 'data');
const filePath = path.join(dataDir, 'github-autonomy-state.json');

const defaultState = {
  mode: 'github_supervised_live',
  repoFullName: process.env.GITHUB_REPO || '',
  defaultBranch: process.env.GITHUB_DEFAULT_BRANCH || 'main',
  branchPrefix: process.env.GITHUB_AUTONOMY_BRANCH_PREFIX || 'megan/auto',
  score: 74,
  lastBranchPlan: null,
  lastCommitPlan: null,
  lastPullRequestPlan: null,
  lastBranchExecution: null,
  lastCommitExecution: null,
  lastPullRequestExecution: null,
  history: []
};

function ensureDir() { fs.mkdirSync(dataDir, { recursive: true }); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function readState() {
  ensureDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultState, null, 2));
    return clone(defaultState);
  }
  try {
    return { ...clone(defaultState), ...JSON.parse(fs.readFileSync(filePath, 'utf-8')) };
  } catch {
    fs.writeFileSync(filePath, JSON.stringify(defaultState, null, 2));
    return clone(defaultState);
  }
}
function writeState(state) { ensureDir(); fs.writeFileSync(filePath, JSON.stringify(state, null, 2)); return state; }
function appendHistory(entry) {
  const state = readState();
  const history = Array.isArray(state.history) ? state.history : [];
  history.unshift({ id: `gh_${Date.now()}`, createdAt: new Date().toISOString(), ...entry });
  state.history = history.slice(0, 40);
  writeState(state);
  return state;
}
function getRepoPath() {
  const repo = repoService.getRepo();
  return repo?.repoPath || '';
}
function getAllowedRepo() {
  const state = readState();
  return process.env.GITHUB_REPO || state.repoFullName;
}
function getDefaultBranch() {
  const state = readState();
  return process.env.GITHUB_DEFAULT_BRANCH || state.defaultBranch || 'main';
}
function getBranchPrefix() {
  const state = readState();
  return process.env.GITHUB_AUTONOMY_BRANCH_PREFIX || state.branchPrefix || 'megan/auto';
}
function runGit(args) {
  return runner.run('git', args, getRepoPath());
}
function stamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}${String(d.getSeconds()).padStart(2,'0')}`;
}
function safeAutonomyQueueSummary() {
  const autonomy = autonomyTotal.getDashboard ? autonomyTotal.getDashboard() : { queue: [] };
  const queue = Array.isArray(autonomy.queue) ? autonomy.queue : [];
  return queue.slice(0, 3).map((item) => item.title).join(' | ') || 'Autonomy core upgrade';
}
function getStatus() {
  const state = readState();
  const repo = repoService.getRepo();
  let git = { ok: false, dirty: false, branch: getDefaultBranch(), reasons: [] };
  try { git = gitOps.inspectRepository() || git; } catch {}
  const repoConnected = Boolean(repo?.connected || repo?.repoPath);
  const githubRepoReady = Boolean(getAllowedRepo());
  const githubTokenReady = Boolean(process.env.GITHUB_TOKEN);
  const score = Math.max(35,
    (repoConnected ? 22 : 0) +
    (git?.ok ? 22 : 0) +
    (githubRepoReady ? 16 : 0) +
    (githubTokenReady ? 18 : 0) +
    (git?.dirty ? -6 : 8)
  );
  return {
    mode: state.mode,
    score,
    repoFullName: getAllowedRepo(),
    defaultBranch: getDefaultBranch(),
    branchPrefix: getBranchPrefix(),
    repoConnected,
    repoPath: repo?.repoPath || '',
    gitOk: Boolean(git?.ok),
    gitDirty: Boolean(git?.dirty),
    gitBranch: git?.branch || getDefaultBranch(),
    githubTokenReady,
    recommendedNext: score >= 88 ? 'Pronto para branch, commit e PR supervisionados.' : 'Completar conexão Git/GitHub antes da execução total.',
    history: state.history || [],
    lastBranchPlan: state.lastBranchPlan,
    lastCommitPlan: state.lastCommitPlan,
    lastPullRequestPlan: state.lastPullRequestPlan,
    lastBranchExecution: state.lastBranchExecution,
    lastCommitExecution: state.lastCommitExecution,
    lastPullRequestExecution: state.lastPullRequestExecution,
  };
}
function prepareBranchPlan() {
  const state = readState();
  const status = getStatus();
  const branchName = `${status.branchPrefix}/upgrade-${stamp()}`;
  const plan = {
    branchName,
    baseBranch: status.defaultBranch,
    repoFullName: status.repoFullName,
    ready: Boolean(status.gitOk && status.repoConnected),
    summary: status.gitOk ? `Branch supervisionada pronta: ${branchName}` : 'Git ainda não está pronto para criar branch automática.',
  };
  state.lastBranchPlan = plan;
  writeState(state);
  appendHistory({ type: 'branch_plan', title: 'Plano de branch gerado', summary: plan.summary });
  return plan;
}
function prepareCommitPlan() {
  const state = readState();
  const status = getStatus();
  const plan = {
    message: `feat: autonomy supervised update - ${safeAutonomyQueueSummary()}`,
    ready: Boolean(status.gitOk),
    summary: status.gitOk ? 'Mensagem de commit pronta para uso supervisionado.' : 'Git ainda não está pronto para consolidar commit supervisionado.',
    filesExpected: ['frontend/src/App.jsx', 'backend/src/app.js', 'backend/src/services/autonomy-total.service.js'],
  };
  state.lastCommitPlan = plan;
  writeState(state);
  appendHistory({ type: 'commit_plan', title: 'Plano de commit gerado', summary: plan.summary });
  return plan;
}
function preparePullRequestPlan() {
  const state = readState();
  const status = getStatus();
  const branchPlan = state.lastBranchPlan || prepareBranchPlan();
  const commitPlan = state.lastCommitPlan || prepareCommitPlan();
  const plan = {
    title: 'Megan Autonomy supervised live upgrade',
    head: branchPlan.branchName,
    base: status.defaultBranch,
    repoFullName: status.repoFullName,
    ready: Boolean(status.githubTokenReady && status.repoFullName),
    body: [
      '## Objetivo',
      '- aplicar upgrade supervisionado da Megan com foco em autonomia, segurança e receita',
      '## Origem',
      `- branch proposta: ${branchPlan.branchName}`,
      `- commit sugerido: ${commitPlan.message}`,
      '## Checklist',
      '- validar build frontend',
      '- validar health do backend',
      '- revisar readiness comercial e deploy'
    ].join('\n'),
    summary: status.githubTokenReady ? 'PR supervisionado pronto para criação.' : 'Falta GITHUB_TOKEN para criação supervisionada de PR.',
  };
  state.lastPullRequestPlan = plan;
  writeState(state);
  appendHistory({ type: 'pr_plan', title: 'Plano de PR gerado', summary: plan.summary });
  return plan;
}
function executeBranchPlan() {
  const state = readState();
  const status = getStatus();
  const plan = state.lastBranchPlan || prepareBranchPlan();
  if (!status.gitOk || !status.repoConnected) {
    const result = { ok: false, simulated: true, reason: 'Git/repo ainda não prontos para branch real.', branchName: plan.branchName };
    state.lastBranchExecution = result;
    writeState(state);
    appendHistory({ type: 'branch_execute', title: 'Execução de branch simulada', summary: result.reason });
    return result;
  }
  const checkoutBase = runGit(['checkout', plan.baseBranch]);
  if (!checkoutBase.ok) {
    const result = { ok: false, simulated: false, reason: 'Falha ao trocar para branch base.', detail: checkoutBase };
    state.lastBranchExecution = result; writeState(state);
    appendHistory({ type: 'branch_execute_failed', title: 'Falha na branch supervisionada', summary: result.reason });
    return result;
  }
  const pullBase = runGit(['pull', 'origin', plan.baseBranch]);
  const createBranch = runGit(['checkout', '-b', plan.branchName]);
  if (!createBranch.ok) {
    const maybeExists = String(createBranch.stderr || createBranch.stdout || '').toLowerCase().includes('already exists');
    const retry = maybeExists ? runGit(['checkout', plan.branchName]) : createBranch;
    if (!retry.ok) {
      const result = { ok: false, simulated: false, reason: 'Falha ao criar/alternar branch supervisionada.', detail: retry };
      state.lastBranchExecution = result; writeState(state);
      appendHistory({ type: 'branch_execute_failed', title: 'Falha na branch supervisionada', summary: result.reason });
      return result;
    }
  }
  const result = {
    ok: true,
    simulated: false,
    branchName: plan.branchName,
    baseBranch: plan.baseBranch,
    pullBaseOk: Boolean(pullBase.ok),
    summary: `Branch supervisionada ativa: ${plan.branchName}`,
  };
  state.lastBranchExecution = result; writeState(state);
  appendHistory({ type: 'branch_execute', title: 'Branch supervisionada executada', summary: result.summary });
  return result;
}
function executeCommitPlan() {
  const state = readState();
  const plan = state.lastCommitPlan || prepareCommitPlan();
  const branchExec = state.lastBranchExecution?.ok ? state.lastBranchExecution : executeBranchPlan();
  if (!branchExec.ok && !branchExec.simulated) {
    const result = { ok: false, simulated: false, reason: 'Branch supervisionada falhou antes do commit.', detail: branchExec };
    state.lastCommitExecution = result; writeState(state);
    appendHistory({ type: 'commit_execute_failed', title: 'Falha no commit supervisionado', summary: result.reason });
    return result;
  }
  const commit = gitOps.createCommit(plan.message);
  const result = {
    ok: Boolean(commit.ok),
    simulated: Boolean(commit.simulated),
    commitMessage: plan.message,
    detail: commit,
    summary: commit.ok ? 'Commit supervisionado criado com sucesso.' : `Commit supervisionado não concluído: ${commit.reason || 'sem alterações'}`,
  };
  state.lastCommitExecution = result; writeState(state);
  appendHistory({ type: commit.ok ? 'commit_execute' : 'commit_execute_skipped', title: commit.ok ? 'Commit supervisionado executado' : 'Commit supervisionado não concluído', summary: result.summary });
  return result;
}
function githubRequest(method, requestPath, body) {
  return new Promise((resolve) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return resolve({ ok: false, simulated: true, reason: 'GITHUB_TOKEN ausente.' });
    }
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path: requestPath,
      method,
      headers: {
        'User-Agent': 'Megan-Autonomy-Core',
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch { parsed = raw; }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
      });
    });
    req.on('error', (error) => resolve({ ok: false, status: 0, reason: error.message }));
    if (payload) req.write(payload);
    req.end();
  });
}
async function executePullRequestPlan() {
  const state = readState();
  const status = getStatus();
  const plan = state.lastPullRequestPlan || preparePullRequestPlan();
  const commitExec = state.lastCommitExecution?.ok ? state.lastCommitExecution : executeCommitPlan();
  if (!getAllowedRepo()) {
    const result = { ok: false, simulated: true, reason: 'GITHUB_REPO não configurado.', createUrl: '' };
    state.lastPullRequestExecution = result; writeState(state);
    appendHistory({ type: 'pr_execute_skipped', title: 'PR supervisionado não executado', summary: result.reason });
    return result;
  }
  const compareUrl = `https://github.com/${getAllowedRepo()}/compare/${status.defaultBranch}...${encodeURIComponent(plan.head)}?expand=1`;
  if (!process.env.GITHUB_TOKEN) {
    const result = { ok: false, simulated: true, reason: 'GITHUB_TOKEN ausente. PR pronto para abertura supervisionada manual.', createUrl: compareUrl };
    state.lastPullRequestExecution = result; writeState(state);
    appendHistory({ type: 'pr_execute_skipped', title: 'PR supervisionado em modo manual', summary: result.reason });
    return result;
  }
  const response = await githubRequest('POST', `/repos/${getAllowedRepo()}/pulls`, {
    title: plan.title,
    head: plan.head,
    base: plan.base,
    body: plan.body,
    draft: true,
  });
  const result = response.ok
    ? {
        ok: true,
        simulated: false,
        prNumber: response.data?.number,
        url: response.data?.html_url,
        summary: `PR supervisionado criado com sucesso: #${response.data?.number}`,
      }
    : {
        ok: false,
        simulated: false,
        reason: response.data?.message || response.reason || 'Falha ao criar PR no GitHub.',
        createUrl: compareUrl,
        detail: response,
      };
  state.lastPullRequestExecution = result; writeState(state);
  appendHistory({ type: result.ok ? 'pr_execute' : 'pr_execute_failed', title: result.ok ? 'PR supervisionado criado' : 'Falha ao criar PR supervisionado', summary: result.summary || result.reason });
  return result;
}

module.exports = {
  getStatus,
  prepareBranchPlan,
  prepareCommitPlan,
  preparePullRequestPlan,
  executeBranchPlan,
  executeCommitPlan,
  executePullRequestPlan,
};
