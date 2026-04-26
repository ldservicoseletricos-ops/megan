const fs = require('fs');
const repoGuard = require('./repo-guard.service');
const backup = require('./backup.service');
const memory = require('./memory.service');
const { readJson, writeJson } = require('./store.service');

const FILE = 'patch-history.json';

function getHistory() {
  return readJson(FILE, []);
}

function saveHistory(history) {
  writeJson(FILE, history);
}

function previewPatch(relativePath, findText, replaceText) {
  const target = repoGuard.resolveTarget(relativePath);
  const content = fs.readFileSync(target, 'utf8');

  if (!content.includes(findText)) {
    return {
      ok: false,
      message: 'Trecho para localizar não encontrado.',
      relativePath,
    };
  }

  const updated = content.replace(findText, replaceText);

  return {
    ok: true,
    relativePath,
    changed: content !== updated,
    beforeLength: content.length,
    afterLength: updated.length,
  };
}

function registerHistory(relativePath, reason, backupItem, extra = {}) {
  const history = getHistory();
  history.unshift({
    id: Date.now(),
    relativePath,
    reason,
    backupId: backupItem.id,
    createdAt: new Date().toISOString(),
    ...extra,
  });
  saveHistory(history.slice(0, 400));
}

function applyPatch(relativePath, findText, replaceText, reason = 'patch mestre') {
  const target = repoGuard.resolveTarget(relativePath);
  const content = fs.readFileSync(target, 'utf8');

  if (!content.includes(findText)) {
    return {
      ok: false,
      relativePath,
      reason: 'Trecho para localizar não encontrado.',
    };
  }

  const backupItem = backup.createBackup(relativePath);
  const updated = content.replace(findText, replaceText);
  fs.writeFileSync(target, updated, 'utf8');

  registerHistory(relativePath, reason, backupItem, { mode: 'find_replace' });

  memory.addMemory('patch_applied_real', 'patch_engine_service', `Patch real aplicado em ${relativePath}.`, 'high');

  return {
    ok: true,
    relativePath,
    reason,
    backupId: backupItem.id,
  };
}

function applyContentPatch(relativePath, nextContent, reason = 'patch mestre por conteúdo') {
  const target = repoGuard.resolveTarget(relativePath);
  const content = fs.readFileSync(target, 'utf8');

  if (content === nextContent) {
    return {
      ok: false,
      relativePath,
      reason: 'Conteúdo já está atualizado.',
    };
  }

  const backupItem = backup.createBackup(relativePath);
  fs.writeFileSync(target, nextContent, 'utf8');
  registerHistory(relativePath, reason, backupItem, { mode: 'full_content' });
  memory.addMemory('patch_applied_real', 'patch_engine_service', `Patch por conteúdo aplicado em ${relativePath}.`, 'high');

  return {
    ok: true,
    relativePath,
    reason,
    backupId: backupItem.id,
  };
}

function rollbackPatch(relativePath) {
  const restored = backup.restoreBackup(relativePath);
  return { ok: true, relativePath, restoredBackupId: restored.id };
}

module.exports = { previewPatch, applyPatch, applyContentPatch, rollbackPatch, getHistory };
