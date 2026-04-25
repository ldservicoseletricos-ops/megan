const { readJson, writeJson } = require('./store.service');
const { resolveRepoPath, normalizeRepoPath } = require('./repo-path-resolver.service');

const FILE = 'repo.json';

function baseRepo() {
  const resolved = resolveRepoPath(process.env.REPO_ROOT || '');
  return {
    connected: false,
    repoPath: resolved.repoPath,
    branch: 'main',
    lastSnapshotId: null,
    autoDetected: resolved.ok,
  };
}

function getRepo() {
  const current = readJson(FILE, baseRepo());
  if (current?.repoPath) return current;
  return baseRepo();
}

function connectRepo(repoPath) {
  const repo = getRepo();
  const requested = normalizeRepoPath(repoPath);
  const resolved = resolveRepoPath(requested || repo.repoPath);
  repo.connected = true;
  repo.repoPath = resolved.repoPath;
  repo.autoDetected = Boolean(resolved.ok && (!requested || requested !== resolved.repoPath));
  writeJson(FILE, repo);
  return repo;
}

function autoDetectRepo(repoPath) {
  const resolved = resolveRepoPath(repoPath || getRepo().repoPath);
  const repo = getRepo();
  repo.connected = resolved.ok;
  repo.repoPath = resolved.repoPath;
  repo.autoDetected = resolved.ok;
  writeJson(FILE, repo);
  return { ...repo, checked: resolved.checked, detected: resolved.ok };
}

function markSnapshot(snapshotId) {
  const repo = getRepo();
  repo.lastSnapshotId = snapshotId;
  writeJson(FILE, repo);
  return repo;
}

module.exports = { getRepo, connectRepo, autoDetectRepo, markSnapshot };
