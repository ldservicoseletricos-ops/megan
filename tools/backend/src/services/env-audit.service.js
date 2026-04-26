const fs = require('fs');
const path = require('path');

const REQUIRED_KEYS = [
  'PORT',
  'FRONTEND_URL',
  'REPO_ROOT',
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .reduce((acc, line) => {
      const index = line.indexOf('=');
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

function buildEnvStatus(projectRoot) {
  const root = path.resolve(projectRoot || path.join(__dirname, '..', '..', '..'));
  const backendRoot = path.join(root, 'backend');
  const rootEnvPath = path.join(root, '.env');
  const backendEnvPath = path.join(backendRoot, '.env');
  const rootExamplePath = path.join(root, '.env.example');
  const backendExamplePath = path.join(backendRoot, '.env.example');

  const rootEnv = parseEnvFile(rootEnvPath);
  const backendEnv = parseEnvFile(backendEnvPath);
  const rootExample = parseEnvFile(rootExamplePath);
  const backendExample = parseEnvFile(backendExamplePath);

  const effective = {
    ...rootExample,
    ...backendExample,
    ...rootEnv,
    ...backendEnv,
  };

  const checks = REQUIRED_KEYS.map((key) => {
    const value = effective[key];
    return {
      id: key.toLowerCase(),
      key,
      ok: Boolean(value),
      valuePreview: value ? (String(value).length > 48 ? `${String(value).slice(0, 48)}...` : String(value)) : 'ausente',
      source: backendEnv[key] ? 'backend/.env' : rootEnv[key] ? '.env' : backendExample[key] ? 'backend/.env.example' : rootExample[key] ? '.env.example' : 'não encontrado',
    };
  });

  const presentCount = checks.filter((item) => item.ok).length;
  const score = Math.round((presentCount / Math.max(checks.length, 1)) * 100);

  return {
    root,
    files: [
      { path: rootEnvPath, exists: fs.existsSync(rootEnvPath) },
      { path: backendEnvPath, exists: fs.existsSync(backendEnvPath) },
      { path: rootExamplePath, exists: fs.existsSync(rootExamplePath) },
      { path: backendExamplePath, exists: fs.existsSync(backendExamplePath) },
    ],
    checks,
    score,
    ok: checks.every((item) => item.ok),
    summary: checks.every((item) => item.ok)
      ? 'Configuração mínima detectada.'
      : 'Há variáveis obrigatórias ausentes para operação consistente.',
  };
}

module.exports = { buildEnvStatus };
