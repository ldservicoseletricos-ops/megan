const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const BACKEND_ROOT = path.join(PROJECT_ROOT, 'backend');

function exists(relative) {
  const file = path.join(PROJECT_ROOT, relative);
  try {
    const stat = fs.statSync(file);
    return { relative, exists: true, size: stat.size, modifiedAt: stat.mtime.toISOString() };
  } catch (_error) {
    return { relative, exists: false, size: 0, modifiedAt: null };
  }
}

function readJson(relative) {
  try { return JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, relative), 'utf8')); }
  catch (error) { return { __error: error.message }; }
}

function scanEnvSafety() {
  const targets = ['.env', 'backend/.env', 'frontend/.env', '.env.example', 'backend/.env.example', 'frontend/.env.example'];
  const riskyPatterns = [/AIza[0-9A-Za-z_-]{20,}/, /sk_live_/i, /sk_test_/i, /postgres(?:ql)?:\/\/[^\s]+/i];
  return targets.map((relative) => {
    const file = path.join(PROJECT_ROOT, relative);
    if (!fs.existsSync(file)) return { relative, exists: false, safe: true, warnings: [] };
    const content = fs.readFileSync(file, 'utf8');
    const warnings = [];
    if (!relative.endsWith('.example') && relative.includes('.env')) warnings.push('Arquivo .env real dentro do projeto. Não subir para Git/ZIP público.');
    riskyPatterns.forEach((pattern) => { if (pattern.test(content)) warnings.push(`Possível segredo detectado: ${pattern}`); });
    if (/VITE_API_URL=.*\n[\s\S]*VITE_API_URL=/m.test(content)) warnings.push('VITE_API_URL duplicado.');
    return { relative, exists: true, safe: warnings.length === 0, warnings };
  });
}

function packageSummary() {
  const backend = readJson('backend/package.json');
  const frontend = readJson('frontend/package.json');
  return {
    backend: { name: backend.name, version: backend.version, scripts: backend.scripts || {}, dependencies: Object.keys(backend.dependencies || {}).sort(), error: backend.__error || null },
    frontend: { name: frontend.name, version: frontend.version, scripts: frontend.scripts || {}, dependencies: Object.keys(frontend.dependencies || {}).sort(), devDependencies: Object.keys(frontend.devDependencies || {}).sort(), error: frontend.__error || null }
  };
}

function routeInventory() {
  const modulesDir = path.join(BACKEND_ROOT, 'src', 'modules');
  const items = [];
  try {
    for (const name of fs.readdirSync(modulesDir).sort()) {
      const dir = path.join(modulesDir, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      const route = fs.readdirSync(dir).find((file) => file.endsWith('.routes.js'));
      items.push({ module: name, hasRoute: Boolean(route), routeFile: route || null });
    }
  } catch (_error) {}
  return items;
}

function getStatus() {
  const required = ['backend/src/app.js','backend/src/server.js','backend/package.json','frontend/src/App.jsx','frontend/src/main.jsx','frontend/src/lib/api.js','frontend/package.json','frontend/vite.config.js','.gitignore','.env.example'].map(exists);
  const env = scanEnvSafety();
  const packages = packageSummary();
  const modules = routeInventory();
  const requiredOk = required.filter((item) => item.exists).length;
  const envOk = env.filter((item) => item.safe).length;
  const moduleRoutes = modules.filter((item) => item.hasRoute).length;
  const score = Math.min(100, Math.round((requiredOk / required.length) * 45 + (envOk / env.length) * 25 + Math.min(30, moduleRoutes)));
  return { ok: true, module: 'Megan OS 25.0 System Health Center', version: '25.0.0', score, status: score >= 85 ? 'estável' : score >= 65 ? 'atenção' : 'crítico', now: new Date().toISOString(), projectRoot: PROJECT_ROOT, requiredFiles: required, envSafety: env, packages, modules: { total: modules.length, withRoutes: moduleRoutes, items: modules }, nextActions: ['Rodar npm install no backend e frontend','Executar npm run check no backend','Executar npm run build no frontend','Manter segredos somente em variáveis da Render/Vercel'] };
}

module.exports = { getStatus };
