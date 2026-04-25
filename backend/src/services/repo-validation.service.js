const fs = require('fs');
const path = require('path');
const repo = require('./repo.service');
const memory = require('./memory.service');
const { readJson, writeJson } = require('./store.service');
const { resolveRepoPath } = require('./repo-path-resolver.service');

const FILE = 'repo-validation.json';

function baseReport() {
  return {
    ok: false,
    checkedAt: null,
    repoPath: null,
    score: 0,
    summary: 'Validação ainda não executada.',
    checks: [],
    frontend: { exists: false, srcExists: false, packageJsonExists: false },
    backend: { exists: false, srcExists: false, packageJsonExists: false },
  };
}

function getLastReport() {
  return readJson(FILE, baseReport());
}

function saveReport(report) {
  writeJson(FILE, report);
}

function exists(p) {
  return fs.existsSync(p);
}

function checkDir(root, relativePath, label, weight = 10) {
  const full = path.join(root, relativePath);
  return {
    id: relativePath,
    label,
    ok: exists(full),
    weight,
    path: full,
  };
}

function validateRepo(repoPathInput) {
  const currentRepo = repo.getRepo();
  const resolved = resolveRepoPath(repoPathInput || currentRepo.repoPath);
  const repoPath = resolved.repoPath;

  if (!repoPath || !exists(repoPath)) {
    const report = {
      ...baseReport(),
      checkedAt: new Date().toISOString(),
      repoPath,
      summary: 'Caminho do repositório não encontrado.',
      checks: [
        { id: 'repoPath', label: 'Raiz do repositório', ok: false, weight: 100, path: repoPath || '' },
        { id: 'autoDetect', label: 'Auto detecção', ok: resolved.ok, weight: 0, path: resolved.checked.join(' | ') },
      ],
    };
    saveReport(report);
    memory.addMemory('repo_validation_failed', 'repo_validation_service', 'Validação falhou: caminho do repositório não encontrado.', 'high');
    return report;
  }

  const checks = [
    checkDir(repoPath, 'backend', 'Pasta backend', 12),
    checkDir(repoPath, 'backend/src', 'Backend src', 10),
    checkDir(repoPath, 'backend/package.json', 'Backend package.json', 10),
    checkDir(repoPath, 'backend/server.js', 'Backend server.js', 12),
    checkDir(repoPath, 'frontend', 'Pasta frontend', 12),
    checkDir(repoPath, 'frontend/src', 'Frontend src', 10),
    checkDir(repoPath, 'frontend/package.json', 'Frontend package.json', 10),
    checkDir(repoPath, 'frontend/src/App.jsx', 'Frontend App.jsx', 12),
    checkDir(repoPath, '.gitignore', '.gitignore', 6),
    { id: 'autoDetect', label: 'Auto detecção', ok: resolved.ok, weight: 6, path: resolved.checked.join(' | ') },
  ];

  const totalWeight = checks.reduce((sum, item) => sum + item.weight, 0);
  const earnedWeight = checks.reduce((sum, item) => sum + (item.ok ? item.weight : 0), 0);
  const score = Math.round((earnedWeight / totalWeight) * 100);
  const ok = score >= 75;

  const report = {
    ok,
    checkedAt: new Date().toISOString(),
    repoPath,
    score,
    summary: ok ? 'Estrutura mínima validada para ciclo mestre real.' : 'Estrutura incompleta para ciclo mestre real.',
    checks,
    frontend: {
      exists: exists(path.join(repoPath, 'frontend')),
      srcExists: exists(path.join(repoPath, 'frontend', 'src')),
      packageJsonExists: exists(path.join(repoPath, 'frontend', 'package.json')),
    },
    backend: {
      exists: exists(path.join(repoPath, 'backend')),
      srcExists: exists(path.join(repoPath, 'backend', 'src')),
      packageJsonExists: exists(path.join(repoPath, 'backend', 'package.json')),
    },
  };

  saveReport(report);
  memory.addMemory(
    ok ? 'repo_validation_ok' : 'repo_validation_attention',
    'repo_validation_service',
    `${report.summary} Score ${score} em ${repoPath}.`,
    ok ? 'high' : 'medium'
  );
  return report;
}

module.exports = { validateRepo, getLastReport };
