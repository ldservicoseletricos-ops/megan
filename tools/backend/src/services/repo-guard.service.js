
const fs = require('fs');
const path = require('path');
const repo = require('./repo.service');
const memory = require('./memory.service');

function normalize(v) {
  return String(v || '').replace(/\\/g, '/');
}

function getConfig() {
  const currentRepo = repo.getRepo();
  return {
    repoPath: currentRepo.repoPath,
    allowedRoots: ['backend/src', 'frontend/src'],
    deniedPatterns: ['.env', 'node_modules', '.git', 'package-lock.json'],
    backupsDirName: '.megan-backups'
  };
}

function isAllowed(relativePath) {
  const cfg = getConfig();
  const clean = normalize(relativePath);
  const denied = cfg.deniedPatterns.some((p) => clean.includes(p));
  if (denied) return false;
  return cfg.allowedRoots.some((root) => clean.startsWith(root));
}

function resolveTarget(relativePath) {
  const cfg = getConfig();
  if (!isAllowed(relativePath)) {
    throw new Error(`Arquivo não permitido para patch: ${relativePath}`);
  }
  return path.join(cfg.repoPath, relativePath);
}

function ensureBackupDir() {
  const cfg = getConfig();
  const dir = path.join(cfg.repoPath, cfg.backupsDirName);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

module.exports = { getConfig, isAllowed, resolveTarget, ensureBackupDir };
