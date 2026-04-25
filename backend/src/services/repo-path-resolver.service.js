const fs = require('fs');
const path = require('path');

function normalizeRepoPath(input) {
  if (!input) return '';
  return String(input).trim().replace(/\\/g, '/').replace(/\/+$/, '');
}

function exists(p) {
  try {
    return Boolean(p) && fs.existsSync(p);
  } catch {
    return false;
  }
}

function isRepoRoot(repoPath) {
  if (!exists(repoPath)) return false;
  return [
    path.join(repoPath, 'backend'),
    path.join(repoPath, 'backend', 'src'),
    path.join(repoPath, 'backend', 'package.json'),
    path.join(repoPath, 'frontend'),
    path.join(repoPath, 'frontend', 'src'),
    path.join(repoPath, 'frontend', 'package.json'),
  ].every((item) => exists(item));
}

function buildCandidates(extraPath) {
  const cwd = process.cwd();
  const parent = path.resolve(cwd, '..');
  const grandParent = path.resolve(cwd, '..', '..');
  const envRepo = process.env.REPO_ROOT || process.env.MEGAN_REPO_ROOT || '';

  return [
    extraPath,
    envRepo,
    cwd,
    parent,
    grandParent,
    path.resolve(cwd, '..', 'megan'),
    path.resolve(cwd, '..', 'megan2'),
    path.resolve(cwd, '..', 'megan-os'),
    'C:/megan',
    'C:/megan2',
    'C:/megan-os',
    'C:/Megan',
    'C:/Megan2',
    'C:/Projetos/megan',
    'C:/Projetos/megan2',
  ]
    .map(normalizeRepoPath)
    .filter(Boolean);
}

function resolveRepoPath(extraPath) {
  const checked = [];

  for (const candidate of buildCandidates(extraPath)) {
    checked.push(candidate);
    if (isRepoRoot(candidate)) {
      return {
        ok: true,
        repoPath: candidate,
        checked,
      };
    }
  }

  return {
    ok: false,
    repoPath: normalizeRepoPath(extraPath) || normalizeRepoPath(process.env.REPO_ROOT) || 'C:/megan',
    checked,
  };
}

module.exports = {
  normalizeRepoPath,
  isRepoRoot,
  resolveRepoPath,
};
