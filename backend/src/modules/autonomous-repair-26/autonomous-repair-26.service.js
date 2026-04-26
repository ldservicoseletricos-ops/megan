const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const BACKEND_ROOT = path.join(PROJECT_ROOT, 'backend');
const FRONTEND_ROOT = path.join(PROJECT_ROOT, 'frontend');
const DATA_DIR = path.join(BACKEND_ROOT, 'data');
const STATE_FILE = path.join(DATA_DIR, 'autonomous-repair-26-state.json');
const LOG_FILE = path.join(DATA_DIR, 'autonomous-repair-26-logs.json');

function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function now() { return new Date().toISOString(); }
function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_error) { return fallback; } }
function writeJson(file, value) { ensureDataDir(); fs.writeFileSync(file, JSON.stringify(value, null, 2)); }
function full(relativePath) { return path.join(PROJECT_ROOT, relativePath); }
function exists(relativePath) { return fs.existsSync(full(relativePath)); }
function readText(relativePath) { try { return fs.readFileSync(full(relativePath), 'utf8'); } catch (_error) { return ''; } }

function runCommand(command, cwd) {
  try {
    const output = childProcess.execSync(command, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 15000 });
    return { ok: true, command, output: output.slice(-4000) };
  } catch (error) {
    return { ok: false, command, output: String((error.stdout || '') + (error.stderr || '') || error.message).slice(-4000) };
  }
}

function getPackage(relativePath) { return readJson(full(relativePath), { dependencies: {}, devDependencies: {}, scripts: {}, missing: true }); }

function detectPackageIssues() {
  const backendPkg = getPackage('backend/package.json');
  const frontendPkg = getPackage('frontend/package.json');
  const requiredBackend = ['cors', 'dotenv', 'express', 'multer', 'stripe', '@supabase/supabase-js'];
  const requiredFrontend = ['@vitejs/plugin-react', 'vite', 'react', 'react-dom', '@supabase/supabase-js', 'leaflet', 'react-leaflet', 'recharts'];
  const backendDeps = { ...(backendPkg.dependencies || {}), ...(backendPkg.devDependencies || {}) };
  const frontendDeps = { ...(frontendPkg.dependencies || {}), ...(frontendPkg.devDependencies || {}) };
  return {
    backendMissing: requiredBackend.filter((name) => !backendDeps[name]),
    frontendMissing: requiredFrontend.filter((name) => !frontendDeps[name]),
    backendScripts: backendPkg.scripts || {},
    frontendScripts: frontendPkg.scripts || {}
  };
}

function detectEnvIssues() {
  const targets = ['.env', 'backend/.env', 'frontend/.env', '.env.example', 'backend/.env.example', 'frontend/.env.example'];
  const patterns = [
    ['Google Maps key', /AIza[0-9A-Za-z_-]{20,}/],
    ['Stripe secret', /sk_(live|test)_[0-9A-Za-z_]+/i],
    ['Database URL', /postgres(?:ql)?:\/\/[^\s]+/i]
  ];
  return targets.map((file) => {
    const content = readText(file);
    if (!content) return { file, exists: false, issues: [] };
    const issues = [];
    if ((content.match(/^VITE_API_URL=/gm) || []).length > 1) issues.push('VITE_API_URL duplicado');
    if (!file.endsWith('.example') && /(^|\/)\.env$/.test(file)) issues.push('Arquivo .env real dentro do projeto');
    for (const [name, pattern] of patterns) if (pattern.test(content)) issues.push(`Possível segredo: ${name}`);
    return { file, exists: true, issues };
  });
}

function listSourceFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir)) {
    const current = path.join(dir, entry);
    const stat = fs.statSync(current);
    if (stat.isDirectory()) listSourceFiles(current, files);
    else if (/\.(js|jsx|ts|tsx)$/.test(entry)) files.push(current);
  }
  return files;
}

function listBrokenRelativeImports() {
  const files = [...listSourceFiles(path.join(BACKEND_ROOT, 'src')), ...listSourceFiles(path.join(FRONTEND_ROOT, 'src'))];
  const broken = [];
  const importRegexes = [/require\(['"](\.{1,2}\/[^'"]+)['"]\)/g, /from\s+['"](\.{1,2}\/[^'"]+)['"]/g, /import\(['"](\.{1,2}\/[^'"]+)['"]\)/g];
  const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '.json', '/index.js', '/index.jsx', '/index.ts', '/index.tsx'];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const regex of importRegexes) {
      let match;
      while ((match = regex.exec(content))) {
        const base = path.resolve(path.dirname(file), match[1]);
        if (!extensions.some((ext) => fs.existsSync(base + ext))) broken.push({ file: path.relative(PROJECT_ROOT, file), import: match[1] });
      }
    }
  }
  return broken.slice(0, 200);
}

function runStaticChecks() {
  const checks = [];
  if (exists('backend/src/app.js')) checks.push(runCommand('node --check src/app.js', BACKEND_ROOT));
  if (exists('backend/src/server.js')) checks.push(runCommand('node --check src/server.js', BACKEND_ROOT));
  return checks;
}

function diagnose() {
  const packageIssues = detectPackageIssues();
  const envIssues = detectEnvIssues();
  const brokenImports = listBrokenRelativeImports();
  const checks = runStaticChecks();
  const critical = [];
  if (packageIssues.backendMissing.length) critical.push(`Backend sem dependências: ${packageIssues.backendMissing.join(', ')}`);
  if (packageIssues.frontendMissing.length) critical.push(`Frontend sem dependências: ${packageIssues.frontendMissing.join(', ')}`);
  const envWithIssues = envIssues.filter((item) => item.issues.length);
  if (envWithIssues.length) critical.push(`${envWithIssues.length} arquivo(s) de ambiente com alertas`);
  if (brokenImports.length) critical.push(`${brokenImports.length} import(s) relativo(s) quebrado(s)`);
  const failedChecks = checks.filter((item) => !item.ok);
  if (failedChecks.length) critical.push(`${failedChecks.length} checagem(ns) de sintaxe falharam`);
  const score = Math.max(0, 100 - packageIssues.backendMissing.length * 8 - packageIssues.frontendMissing.length * 8 - envWithIssues.length * 6 - Math.min(35, brokenImports.length * 2) - failedChecks.length * 12);
  const result = { ok: true, module: 'Megan OS 26.0 Consolidated Autonomous Repair Engine', version: '26.0.0', score, status: score >= 90 ? 'estável' : score >= 70 ? 'atenção' : 'precisa de correção', generatedAt: now(), packageIssues, envIssues, brokenImports, checks, critical };
  writeJson(STATE_FILE, { lastDiagnosis: result });
  return result;
}

function backupFile(relativePath) {
  const source = full(relativePath);
  if (!fs.existsSync(source)) return null;
  const backupDir = path.join(DATA_DIR, 'repair-26-backups', now().replace(/[:.]/g, '-'));
  fs.mkdirSync(backupDir, { recursive: true });
  const target = path.join(backupDir, relativePath.replace(/[\\/]/g, '__'));
  fs.copyFileSync(source, target);
  return path.relative(PROJECT_ROOT, target);
}

function ensureDependencies() {
  const actions = [];
  const backendPkg = getPackage('backend/package.json');
  const frontendPkg = getPackage('frontend/package.json');
  const backendRequired = { cors: '^2.8.5', dotenv: '^16.4.7', express: '^4.19.2', multer: '^1.4.5-lts.1', stripe: '^17.5.0', '@supabase/supabase-js': '^2.49.1' };
  const frontendRequired = { react: '^18.3.1', 'react-dom': '^18.3.1', '@supabase/supabase-js': '^2.49.1', leaflet: '^1.9.4', 'react-leaflet': '^4.2.1', recharts: '^2.15.0' };
  const frontendDevRequired = { vite: '^5.4.10', '@vitejs/plugin-react': '^4.3.3' };
  backendPkg.dependencies = backendPkg.dependencies || {};
  frontendPkg.dependencies = frontendPkg.dependencies || {};
  frontendPkg.devDependencies = frontendPkg.devDependencies || {};
  for (const [name, version] of Object.entries(backendRequired)) if (!backendPkg.dependencies[name]) { backendPkg.dependencies[name] = version; actions.push(`Dependência backend adicionada: ${name}`); }
  for (const [name, version] of Object.entries(frontendRequired)) if (!frontendPkg.dependencies[name]) { frontendPkg.dependencies[name] = version; actions.push(`Dependência frontend adicionada: ${name}`); }
  for (const [name, version] of Object.entries(frontendDevRequired)) if (!frontendPkg.devDependencies[name]) { frontendPkg.devDependencies[name] = version; actions.push(`DevDependency frontend adicionada: ${name}`); }
  backendPkg.version = '26.0.0';
  frontendPkg.version = '26.0.0';
  if (actions.length) {
    backupFile('backend/package.json'); backupFile('frontend/package.json');
    fs.writeFileSync(full('backend/package.json'), JSON.stringify(backendPkg, null, 2) + '\n');
    fs.writeFileSync(full('frontend/package.json'), JSON.stringify(frontendPkg, null, 2) + '\n');
  }
  return actions;
}

function sanitizeEnv() {
  const actions = [];
  if (exists('frontend/.env')) {
    backupFile('frontend/.env');
    const lines = readText('frontend/.env').split(/\r?\n/);
    const output = [];
    let sawApi = false;
    for (const line of lines) {
      if (/^\s*VITE_GOOGLE_MAPS_API_KEY=AIza/.test(line)) { actions.push('Google Maps key removida de frontend/.env'); continue; }
      if (/^\s*VITE_API_URL=/.test(line)) {
        if (sawApi) { actions.push('VITE_API_URL duplicado removido de frontend/.env'); continue; }
        sawApi = true;
      }
      output.push(line);
    }
    if (!output.some((line) => /^\s*VITE_GOOGLE_MAPS_API_KEY=/.test(line))) output.push('VITE_GOOGLE_MAPS_API_KEY=');
    fs.writeFileSync(full('frontend/.env'), output.join('\n').trim() + '\n');
    actions.push('frontend/.env higienizado');
  }
  if (!exists('frontend/.env.example')) {
    fs.writeFileSync(full('frontend/.env.example'), 'VITE_API_URL=http://localhost:10000\nVITE_GOOGLE_MAPS_API_KEY=your_google_maps_key_here\n');
    actions.push('frontend/.env.example criado');
  }
  return actions;
}

function heal() {
  const before = diagnose();
  const actions = [...ensureDependencies(), ...sanitizeEnv()];
  const after = diagnose();
  const entry = { ok: true, executedAt: now(), beforeScore: before.score, afterScore: after.score, actions, remainingCritical: after.critical };
  const logs = readJson(LOG_FILE, []);
  logs.unshift(entry);
  writeJson(LOG_FILE, logs.slice(0, 100));
  return entry;
}

function getLogs() { return readJson(LOG_FILE, []); }
function getState() { return readJson(STATE_FILE, { lastDiagnosis: null }); }
function rollbackPlan() { return { ok: true, backupsRoot: 'backend/data/repair-26-backups', message: 'Backups são criados antes de alterações sensíveis. Restaure manualmente o arquivo desejado para evitar rollback destrutivo.' }; }

module.exports = { diagnose, heal, getLogs, getState, rollbackPlan };
