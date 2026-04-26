
const fs = require('fs');
const path = require('path');
const repoGuard = require('./repo-guard.service');
const memory = require('./memory.service');
const { readJson, writeJson } = require('./store.service');

const FILE = 'backup-index.json';

function getIndex() {
  return readJson(FILE, []);
}

function createBackup(relativePath) {
  const originalPath = repoGuard.resolveTarget(relativePath);
  if (!fs.existsSync(originalPath)) {
    throw new Error(`Arquivo original não encontrado: ${relativePath}`);
  }

  const backupDir = repoGuard.ensureBackupDir();
  const timestamp = Date.now();
  const fileName = `${timestamp}-${relativePath.replace(/[\\\\/]/g, '__')}.bak`;
  const backupPath = path.join(backupDir, fileName);

  fs.copyFileSync(originalPath, backupPath);

  const index = getIndex();
  const item = { id: timestamp, relativePath, backupPath, createdAt: new Date().toISOString() };
  index.unshift(item);
  writeJson(FILE, index.slice(0, 400));
  memory.addMemory('backup_created', 'backup_service', `Backup criado para ${relativePath}.`, 'high');
  return item;
}

function getLatestBackup(relativePath) {
  return getIndex().find((item) => item.relativePath === relativePath) || null;
}

function restoreBackup(relativePath) {
  const latest = getLatestBackup(relativePath);
  if (!latest) throw new Error(`Nenhum backup encontrado para: ${relativePath}`);
  const target = repoGuard.resolveTarget(relativePath);
  fs.copyFileSync(latest.backupPath, target);
  memory.addMemory('backup_restored', 'backup_service', `Rollback restaurado para ${relativePath}.`, 'high');
  return latest;
}

module.exports = { createBackup, restoreBackup, getLatestBackup, getIndex };
