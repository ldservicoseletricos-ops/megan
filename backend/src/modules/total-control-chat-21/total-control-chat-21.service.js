const os = require('os');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const BACKEND_ROOT = path.resolve(PROJECT_ROOT, 'backend');
const FRONTEND_ROOT = path.resolve(PROJECT_ROOT, 'frontend');
const DATA_DIR = path.resolve(BACKEND_ROOT, 'data');
const TASK_FILE = path.resolve(DATA_DIR, 'total-control-tasks.json');
const HISTORY_FILE = path.resolve(DATA_DIR, 'total-control-history.json');

function ensureDataFiles() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TASK_FILE)) fs.writeFileSync(TASK_FILE, '[]');
  if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]');
}

function readJson(file, fallback) {
  try {
    ensureDataFiles();
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_error) {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDataFiles();
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function pushHistory(entry) {
  const history = readJson(HISTORY_FILE, []);
  history.unshift({ id: `hist_${Date.now()}`, at: new Date().toISOString(), ...entry });
  writeJson(HISTORY_FILE, history.slice(0, 80));
}

function runCommand(command, cwd = PROJECT_ROOT) {
  try {
    const output = childProcess.execSync(command, {
      cwd,
      encoding: 'utf8',
      timeout: 15000,
      maxBuffer: 1024 * 1024
    });
    return { ok: true, command, cwd, output: output.trim() || 'Comando executado sem saída.' };
  } catch (error) {
    return {
      ok: false,
      command,
      cwd,
      output: String(error.stdout || '').trim(),
      error: String(error.stderr || error.message || 'Erro ao executar comando.').trim()
    };
  }
}

function projectSummary() {
  const roots = [PROJECT_ROOT, BACKEND_ROOT, FRONTEND_ROOT];
  const exists = Object.fromEntries(roots.map((item) => [path.basename(item) || 'megan', fs.existsSync(item)]));
  const packageFiles = [path.join(BACKEND_ROOT, 'package.json'), path.join(FRONTEND_ROOT, 'package.json')]
    .filter(fs.existsSync)
    .map((file) => {
      const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      return { file: path.relative(PROJECT_ROOT, file), name: pkg.name, version: pkg.version, scripts: pkg.scripts || {} };
    });

  return { projectRoot: PROJECT_ROOT, backendRoot: BACKEND_ROOT, frontendRoot: FRONTEND_ROOT, exists, packages: packageFiles };
}

function getSystemStatus() {
  const memoryTotal = os.totalmem();
  const memoryFree = os.freemem();
  const memoryUsed = memoryTotal - memoryFree;
  const tasks = readJson(TASK_FILE, []);
  return {
    ok: true,
    module: 'Megan OS 21.0 Total Control Chat Core',
    now: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    platform: process.platform,
    node: process.version,
    cpuCores: os.cpus()?.length || 0,
    memory: { totalMB: Math.round(memoryTotal / 1024 / 1024), usedMB: Math.round(memoryUsed / 1024 / 1024), freeMB: Math.round(memoryFree / 1024 / 1024) },
    project: projectSummary(),
    pendingTasks: tasks.filter((task) => task.status !== 'done').length
  };
}

function listImportantFiles() {
  const targets = ['backend/package.json','backend/src/app.js','backend/src/server.js','frontend/package.json','frontend/src/App.jsx','frontend/src/lib/api.js','.env.example'];
  return targets.map((relative) => {
    const absolute = path.join(PROJECT_ROOT, relative);
    return { file: relative, exists: fs.existsSync(absolute), size: fs.existsSync(absolute) ? fs.statSync(absolute).size : 0 };
  });
}

function auditProject() {
  const backendCheck = runCommand('node --check src/app.js && node --check src/server.js', BACKEND_ROOT);
  return {
    ok: backendCheck.ok,
    title: 'Auditoria rápida do projeto',
    backendSyntax: backendCheck,
    importantFiles: listImportantFiles(),
    expectedRoutes: ['/api/health','/api/operator/chat','/api/autonomy-core-18','/api/self-evolution-19','/api/total-control-21/chat'],
    recommendation: backendCheck.ok ? 'Backend principal passou na checagem de sintaxe. Próximo passo: rodar npm install e npm start localmente.' : 'Existe erro de sintaxe no backend. Veja o campo error/output.'
  };
}

function createTask(text, priority = 'normal') {
  const tasks = readJson(TASK_FILE, []);
  const task = { id: `task_${Date.now()}`, text, priority, status: 'pending', createdAt: new Date().toISOString(), source: 'total-control-chat-21' };
  tasks.unshift(task);
  writeJson(TASK_FILE, tasks);
  pushHistory({ type: 'task_created', task });
  return task;
}
function listTasks() { return readJson(TASK_FILE, []); }

function safeCommandFromMessage(message) {
  const text = message.toLowerCase();
  if (text.includes('status') || text.includes('saúde') || text.includes('saude') || text.includes('online')) return { type: 'status', payload: getSystemStatus() };
  if (text.includes('auditoria') || text.includes('auditar') || text.includes('validar') || text.includes('verificar erro')) return { type: 'audit', payload: auditProject() };
  if (text.includes('listar tarefas') || text.includes('tarefas pendentes')) return { type: 'tasks', payload: listTasks() };
  if (text.includes('npm install backend')) return { type: 'proposal', requiresApproval: true, action: 'install_backend', command: 'npm install', cwd: BACKEND_ROOT };
  if (text.includes('npm install frontend')) return { type: 'proposal', requiresApproval: true, action: 'install_frontend', command: 'npm install', cwd: FRONTEND_ROOT };
  if (text.includes('build frontend') || text.includes('npm run build')) return { type: 'proposal', requiresApproval: true, action: 'build_frontend', command: 'npm run build', cwd: FRONTEND_ROOT };
  if (text.startsWith('criar tarefa') || text.includes('delegar tarefa')) {
    const cleaned = message.replace(/criar tarefa:?/i, '').replace(/delegar tarefa:?/i, '').trim();
    return { type: 'task_created', payload: createTask(cleaned || message, text.includes('urgente') ? 'urgent' : 'normal') };
  }
  return { type: 'assistant', payload: { answer: 'Entendi. Posso consultar status real, auditar arquivos, listar/criar tarefas, propor comandos e executar ações críticas somente quando você aprovar.', examples: ['validar sistema agora','status real do sistema','criar tarefa: revisar deploy Render','npm install backend','build frontend'] } };
}

function handleChat(message = '', approval = null) {
  const trimmed = String(message || '').trim();
  if (!trimmed) return { ok: false, error: 'Mensagem vazia.' };
  if (approval?.approved && approval?.command && approval?.cwd) {
    const result = runCommand(approval.command, approval.cwd);
    pushHistory({ type: 'approved_command', message: trimmed, result });
    return { ok: result.ok, mode: 'executed_after_approval', result };
  }
  const interpreted = safeCommandFromMessage(trimmed);
  pushHistory({ type: 'chat', message: trimmed, interpreted });
  if (interpreted.type === 'proposal') return { ok: true, mode: 'approval_required', message: 'Ação crítica detectada. Confirme no painel antes de executar.', proposal: interpreted };
  return { ok: true, mode: interpreted.type, data: interpreted.payload };
}

module.exports = { getSystemStatus, auditProject, handleChat, createTask, listTasks };
