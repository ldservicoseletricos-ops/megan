const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const BACKEND_ROOT = path.join(PROJECT_ROOT, 'backend');
const FRONTEND_ROOT = path.join(PROJECT_ROOT, 'frontend');
const DATA_DIR = path.join(BACKEND_ROOT, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'real-action-engine-24-history.json');

const ALLOWED_ACTIONS = [
  { id: 'system_status', label: 'Status do sistema', command: null, cwd: PROJECT_ROOT, risk: 'baixo', mutates: false, description: 'Lê informações reais do processo Node, sistema operacional e estrutura do projeto.' },
  { id: 'backend_check', label: 'Validar backend', command: 'node --check src/app.js && node --check src/server.js', cwd: BACKEND_ROOT, risk: 'baixo', mutates: false, description: 'Valida sintaxe dos arquivos principais do backend.' },
  { id: 'frontend_package_check', label: 'Validar package do frontend', command: 'node -e "JSON.parse(require(\'fs\').readFileSync(\'package.json\',\'utf8\')); console.log(\'frontend package.json ok\')"', cwd: FRONTEND_ROOT, risk: 'baixo', mutates: false, description: 'Confere se o package.json do frontend é JSON válido.' },
  { id: 'backend_package_check', label: 'Validar package do backend', command: 'node -e "JSON.parse(require(\'fs\').readFileSync(\'package.json\',\'utf8\')); console.log(\'backend package.json ok\')"', cwd: BACKEND_ROOT, risk: 'baixo', mutates: false, description: 'Confere se o package.json do backend é JSON válido.' },
  { id: 'git_status', label: 'Git status', command: 'git status --short', cwd: PROJECT_ROOT, risk: 'baixo', mutates: false, description: 'Consulta alterações no Git sem modificar arquivos.' },
  { id: 'npm_install_backend', label: 'Instalar dependências backend', command: 'npm install', cwd: BACKEND_ROOT, risk: 'médio', mutates: true, description: 'Instala dependências do backend. Pode alterar package-lock.json.' },
  { id: 'npm_install_frontend', label: 'Instalar dependências frontend', command: 'npm install', cwd: FRONTEND_ROOT, risk: 'médio', mutates: true, description: 'Instala dependências do frontend. Pode alterar package-lock.json.' },
  { id: 'frontend_build', label: 'Build frontend', command: 'npm run build', cwd: FRONTEND_ROOT, risk: 'médio', mutates: true, description: 'Executa build de produção do frontend.' }
];

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]');
}

function readJson(file, fallback) {
  try { ensureDataFile(); return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_error) { return fallback; }
}

function writeJson(file, value) {
  ensureDataFile(); fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function record(entry) {
  const history = readJson(HISTORY_FILE, []);
  const item = { id: `rae24_${Date.now()}`, at: new Date().toISOString(), ...entry };
  history.unshift(item);
  writeJson(HISTORY_FILE, history.slice(0, 200));
  return item;
}

function safeStat(file) {
  try {
    const stat = fs.statSync(file);
    return { exists: true, size: stat.size, modifiedAt: stat.mtime.toISOString() };
  } catch (_error) {
    return { exists: false, size: 0, modifiedAt: null };
  }
}

function importantFiles() {
  return [
    'backend/src/app.js', 'backend/src/server.js', 'backend/package.json',
    'frontend/src/App.jsx', 'frontend/package.json', 'frontend/src/lib/api.js',
    '.env.example', '.gitignore'
  ].map((relative) => ({ relative, ...safeStat(path.join(PROJECT_ROOT, relative)) }));
}

function runAllowedCommand(action) {
  if (!action.command) return { ok: true, output: 'Ação informativa executada sem comando shell.', command: null, cwd: action.cwd };
  try {
    const output = childProcess.execSync(action.command, {
      cwd: action.cwd,
      encoding: 'utf8',
      timeout: 45000,
      maxBuffer: 1024 * 1024 * 3,
      windowsHide: true
    });
    return { ok: true, command: action.command, cwd: action.cwd, output: output.trim() || 'Comando executado sem saída.' };
  } catch (error) {
    return {
      ok: false,
      command: action.command,
      cwd: action.cwd,
      output: String(error.stdout || '').trim(),
      error: String(error.stderr || error.message || 'Erro ao executar comando.').trim()
    };
  }
}

function listAllowedActions() {
  return ALLOWED_ACTIONS.map(({ id, label, risk, mutates, description }) => ({ id, label, risk, mutates, description }));
}

function getAction(actionId) {
  return ALLOWED_ACTIONS.find((action) => action.id === actionId);
}

function getHistory() { return readJson(HISTORY_FILE, []); }

function getStatus() {
  const mem = process.memoryUsage();
  const total = os.totalmem();
  const free = os.freemem();
  const files = importantFiles();
  const present = files.filter((item) => item.exists).length;
  const healthScore = Math.round((present / files.length) * 70 + Math.min(30, (free / total) * 30));
  return {
    ok: true,
    module: 'Megan OS 24.0 Real Action Engine',
    version: '24.0.0',
    mode: 'executor real supervisionado',
    healthScore,
    now: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    platform: process.platform,
    node: process.version,
    projectRoot: PROJECT_ROOT,
    backendRoot: BACKEND_ROOT,
    frontendRoot: FRONTEND_ROOT,
    memory: {
      processMB: Math.round(mem.rss / 1024 / 1024),
      totalMB: Math.round(total / 1024 / 1024),
      freeMB: Math.round(free / 1024 / 1024)
    },
    importantFiles: files,
    allowedActions: listAllowedActions(),
    historyCount: getHistory().length
  };
}

function executeAction(actionId, approval = null) {
  const action = getAction(actionId);
  if (!action) return { ok: false, error: 'Ação não permitida ou inexistente.', allowedActions: listAllowedActions() };

  if (action.mutates && !approval?.approved) {
    const proposal = { actionId: action.id, label: action.label, command: action.command, cwd: action.cwd, risk: action.risk, reason: action.description };
    record({ type: 'approval_required', actionId, proposal });
    return { ok: true, mode: 'approval_required', message: 'Essa ação altera o projeto e precisa da sua aprovação.', proposal };
  }

  const result = action.id === 'system_status' ? { ok: true, output: JSON.stringify(getStatus(), null, 2), command: null, cwd: PROJECT_ROOT } : runAllowedCommand(action);
  record({ type: 'action_executed', actionId, ok: result.ok, command: action.command, cwd: action.cwd, output: result.output, error: result.error });
  return { ok: result.ok, mode: 'executed', action: { id: action.id, label: action.label, risk: action.risk }, result };
}

function classifyMessage(message) {
  const text = String(message || '').toLowerCase();
  if (/(status|como estamos|saúde|saude|resumo)/.test(text)) return 'system_status';
  if (/(validar backend|checar backend|backend check)/.test(text)) return 'backend_check';
  if (/(validar frontend|package frontend|checar frontend)/.test(text)) return 'frontend_package_check';
  if (/(validar package backend|package backend)/.test(text)) return 'backend_package_check';
  if (/(git status|status git)/.test(text)) return 'git_status';
  if (/(instalar backend|npm install backend)/.test(text)) return 'npm_install_backend';
  if (/(instalar frontend|npm install frontend)/.test(text)) return 'npm_install_frontend';
  if (/(build frontend|gerar build|npm run build)/.test(text)) return 'frontend_build';
  if (/(logs|ler logs|últimos erros|ultimos erros)/.test(text)) return 'logs';
  if (/(arquivos|listar arquivos|estrutura)/.test(text)) return 'files';
  return 'general';
}

function readLogs() {
  const candidates = [
    path.join(BACKEND_ROOT, 'logs', 'app.log'),
    path.join(BACKEND_ROOT, 'npm-debug.log'),
    path.join(PROJECT_ROOT, 'npm-debug.log')
  ];
  const logs = candidates.map((file) => {
    if (!fs.existsSync(file)) return { file, exists: false, lines: [] };
    const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).slice(-80);
    return { file, exists: true, lines };
  });
  return { ok: true, logs, message: logs.some((log) => log.exists) ? 'Logs encontrados.' : 'Nenhum arquivo de log padrão encontrado.' };
}

function listProjectFiles(scope = 'root') {
  const base = scope === 'frontend' ? FRONTEND_ROOT : scope === 'backend' ? BACKEND_ROOT : PROJECT_ROOT;
  try {
    const entries = fs.readdirSync(base, { withFileTypes: true }).map((entry) => ({ name: entry.name, type: entry.isDirectory() ? 'folder' : 'file' }));
    return { ok: true, scope, base, entries };
  } catch (error) {
    return { ok: false, scope, base, error: error.message };
  }
}

function humanAnswerForExecution(payload) {
  if (payload.mode === 'approval_required') {
    return `Encontrei uma ação real para executar: ${payload.proposal.label}. Como ela pode alterar arquivos ou instalar dependências, preciso da sua aprovação antes de continuar.`;
  }
  if (payload.result?.ok) return `Ação executada com sucesso: ${payload.action?.label || 'ação real'}.`;
  return `Tentei executar a ação, mas encontrei erro: ${payload.result?.error || payload.error || 'erro não informado'}.`;
}

function handleChat(message = '', approval = null) {
  const text = String(message || '').trim();
  if (!text) return { ok: false, error: 'Mensagem vazia.' };

  if (approval?.approved && approval?.actionId) {
    const executed = executeAction(approval.actionId, { approved: true });
    return { ...executed, data: { executiveAnswer: humanAnswerForExecution(executed), suggestions: ['validar backend', 'git status', 'resumo do sistema'] } };
  }

  const intent = classifyMessage(text);
  if (intent === 'logs') {
    const logs = readLogs();
    record({ type: 'chat_logs', message: text });
    return { ok: true, mode: 'logs', data: { executiveAnswer: logs.message, findings: logs.logs.map((log) => `${log.exists ? 'Encontrado' : 'Ausente'}: ${log.file}`), suggestions: ['validar backend', 'status git'] }, logs };
  }
  if (intent === 'files') {
    const files = listProjectFiles(/frontend/.test(text.toLowerCase()) ? 'frontend' : /backend/.test(text.toLowerCase()) ? 'backend' : 'root');
    record({ type: 'chat_files', message: text });
    return { ok: true, mode: 'files', data: { executiveAnswer: `Listei a estrutura real de arquivos em ${files.base}.`, findings: (files.entries || []).slice(0, 20).map((item) => `${item.type}: ${item.name}`), suggestions: ['listar arquivos backend', 'listar arquivos frontend'] }, files };
  }

  if (intent !== 'general') {
    const result = executeAction(intent, approval);
    return { ...result, data: { executiveAnswer: humanAnswerForExecution(result), suggestions: result.mode === 'approval_required' ? ['aprovar ação', 'cancelar', 'ver status primeiro'] : ['validar backend', 'git status', 'build frontend'] } };
  }

  const status = getStatus();
  record({ type: 'chat_general', message: text });
  return {
    ok: true,
    mode: 'general',
    data: {
      executiveAnswer: 'Estou no modo Real Action Engine. Posso ler status real, arquivos, logs e executar apenas ações permitidas com aprovação quando houver risco.',
      findings: [`Saúde atual: ${status.healthScore}%`, `Backend: ${status.backendRoot}`, `Frontend: ${status.frontendRoot}`, `Ações permitidas: ${status.allowedActions.length}`],
      suggestions: ['resumo do sistema', 'validar backend', 'git status', 'instalar frontend', 'build frontend']
    },
    status
  };
}

module.exports = { getStatus, listAllowedActions, getHistory, executeAction, handleChat, readLogs, listProjectFiles };
