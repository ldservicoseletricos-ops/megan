const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const router = express.Router();

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const DATA_DIR = path.join(ROOT_DIR, 'backend', 'data');
const TASKS_FILE = path.join(DATA_DIR, 'operator-command-tasks.json');
const LOG_FILE = path.join(DATA_DIR, 'operator-command-log.json');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TASKS_FILE)) fs.writeFileSync(TASKS_FILE, JSON.stringify([], null, 2));
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
}

function readJson(file, fallback) {
  ensureDataFiles();
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDataFiles();
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function addLog(type, payload) {
  const logs = readJson(LOG_FILE, []);
  logs.unshift({ id: `log_${Date.now()}`, type, payload, createdAt: new Date().toISOString() });
  writeJson(LOG_FILE, logs.slice(0, 120));
}

function getDirectoryStatus(relativePath) {
  const target = path.join(ROOT_DIR, relativePath);
  const exists = fs.existsSync(target);
  return {
    path: relativePath || '.',
    exists,
    files: exists ? fs.readdirSync(target).slice(0, 25) : [],
  };
}

function getPackageInfo(relativePath) {
  const packageFile = path.join(ROOT_DIR, relativePath, 'package.json');
  if (!fs.existsSync(packageFile)) return { exists: false, path: path.join(relativePath, 'package.json') };

  try {
    const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    return {
      exists: true,
      path: path.join(relativePath, 'package.json'),
      name: pkg.name || null,
      version: pkg.version || null,
      scripts: pkg.scripts || {},
      dependencies: Object.keys(pkg.dependencies || {}),
      devDependencies: Object.keys(pkg.devDependencies || {}),
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

function getSystemSnapshot() {
  const memoryTotal = os.totalmem();
  const memoryFree = os.freemem();
  const memoryUsed = memoryTotal - memoryFree;
  const uptimeSeconds = process.uptime();

  return {
    ok: true,
    service: 'Megan OS Operator Command Center',
    version: '17.0.0-command-center',
    timestamp: new Date().toISOString(),
    node: process.version,
    platform: `${os.platform()} ${os.release()}`,
    arch: os.arch(),
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || 'desconhecido',
      loadAverage: os.loadavg(),
    },
    memory: {
      totalMb: Math.round(memoryTotal / 1024 / 1024),
      usedMb: Math.round(memoryUsed / 1024 / 1024),
      freeMb: Math.round(memoryFree / 1024 / 1024),
      usedPercent: Math.round((memoryUsed / memoryTotal) * 100),
    },
    process: {
      pid: process.pid,
      uptimeSeconds: Math.round(uptimeSeconds),
      cwd: process.cwd(),
      env: process.env.NODE_ENV || 'development',
    },
    project: {
      root: ROOT_DIR,
      backend: getPackageInfo('backend'),
      frontend: getPackageInfo('frontend'),
      importantFolders: [
        getDirectoryStatus('backend/src'),
        getDirectoryStatus('frontend/src'),
        getDirectoryStatus('backend/data'),
        getDirectoryStatus('docs'),
      ],
    },
    tasks: readJson(TASKS_FILE, []),
    recentLogs: readJson(LOG_FILE, []).slice(0, 20),
  };
}

function runGitStatus(callback) {
  execFile('git', ['status', '--short'], { cwd: ROOT_DIR, timeout: 7000 }, (error, stdout, stderr) => {
    if (error) {
      callback({ ok: false, error: stderr || error.message });
      return;
    }
    callback({ ok: true, output: stdout.trim() || 'Sem alterações pendentes.' });
  });
}

function classifyIntent(message) {
  const text = String(message || '').toLowerCase();

  if (!text.trim()) return 'empty';
  if (text.includes('status') || text.includes('sistema') || text.includes('funcionando') || text.includes('online')) return 'system_status';
  if (text.includes('validar') || text.includes('verificar') || text.includes('analisar') || text.includes('diagnosticar')) return 'validate_system';
  if (text.includes('git')) return 'git_status';
  if (text.includes('deploy') || text.includes('render') || text.includes('vercel')) return 'deploy_task';
  if (text.includes('delegar') || text.includes('tarefa') || text.includes('criar task') || text.includes('fazer')) return 'delegate_task';
  if (text.includes('log') || text.includes('erro')) return 'logs';

  return 'general';
}

function createTask(title, description, priority = 'media') {
  const tasks = readJson(TASKS_FILE, []);
  const task = {
    id: `task_${Date.now()}`,
    title,
    description,
    priority,
    status: 'pendente_validacao',
    createdAt: new Date().toISOString(),
    validation: 'Aguardando confirmação humana antes de executar ação sensível.',
  };
  tasks.unshift(task);
  writeJson(TASKS_FILE, tasks.slice(0, 200));
  addLog('task_created', task);
  return task;
}

function buildResponse(intent, message, snapshot) {
  const healthScore = snapshot.memory.usedPercent < 85 ? 92 : 68;
  const base = {
    ok: true,
    intent,
    healthScore,
    snapshot,
    actions: [],
    answer: '',
  };

  if (intent === 'system_status') {
    base.answer = `Sistema online. Backend rodando em Node ${snapshot.node}. Memória usada: ${snapshot.memory.usedPercent}%. Processo ativo há ${snapshot.process.uptimeSeconds}s.`;
    base.actions.push('Abrir diagnóstico completo', 'Validar backend', 'Validar frontend');
    return base;
  }

  if (intent === 'validate_system') {
    const checks = [];
    checks.push(snapshot.project.backend.exists ? 'Backend package.json encontrado' : 'Backend package.json não encontrado');
    checks.push(snapshot.project.frontend.exists ? 'Frontend package.json encontrado' : 'Frontend package.json não encontrado');
    checks.push(snapshot.memory.usedPercent < 85 ? 'Memória em nível seguro' : 'Memória alta, investigar processos');
    base.answer = `Validação inicial concluída. ${checks.join('. ')}.`;
    base.actions.push('Criar tarefa de correção', 'Rodar git status', 'Gerar relatório');
    return base;
  }

  if (intent === 'deploy_task') {
    const task = createTask('Validar e preparar deploy', message, 'alta');
    base.answer = 'Criei uma tarefa de deploy em modo seguro. Ela fica pendente de validação antes de qualquer ação real.';
    base.task = task;
    base.actions.push('Validar variáveis', 'Checar Render', 'Checar Vercel');
    return base;
  }

  if (intent === 'delegate_task') {
    const task = createTask('Tarefa delegada pelo chat operacional', message, 'media');
    base.answer = 'Tarefa registrada para validação. O sistema não executa ações perigosas sem confirmação.';
    base.task = task;
    base.actions.push('Aprovar tarefa', 'Detalhar tarefa', 'Marcar prioridade alta');
    return base;
  }

  if (intent === 'logs') {
    base.answer = `Encontrei ${snapshot.recentLogs.length} registros recentes do Command Center. Use o painel de logs para revisar eventos.`;
    base.actions.push('Ver logs recentes', 'Criar tarefa de correção');
    return base;
  }

  base.answer = 'Chat operacional ativo. Posso consultar status real, validar estrutura, registrar tarefas e preparar ações com aprovação.';
  base.actions.push('Status do sistema', 'Validar projeto', 'Delegar tarefa');
  return base;
}

router.get('/system', (_req, res) => {
  res.json(getSystemSnapshot());
});

router.get('/tasks', (_req, res) => {
  res.json({ ok: true, tasks: readJson(TASKS_FILE, []) });
});

router.post('/tasks/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = ['pendente_validacao', 'aprovada', 'em_execucao', 'concluida', 'cancelada'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ ok: false, error: 'Status inválido.' });
  }

  const tasks = readJson(TASKS_FILE, []);
  const updated = tasks.map((task) => task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task);
  writeJson(TASKS_FILE, updated);
  addLog('task_status_updated', { id, status });
  res.json({ ok: true, task: updated.find((task) => task.id === id) });
});

router.post('/chat', (req, res) => {
  const { message } = req.body || {};
  const intent = classifyIntent(message);
  const snapshot = getSystemSnapshot();
  const response = buildResponse(intent, message, snapshot);
  addLog('operator_chat', { message, intent, answer: response.answer });
  res.json(response);
});

router.post('/git/status', (_req, res) => {
  runGitStatus((result) => {
    addLog('git_status', result);
    res.json(result);
  });
});

module.exports = router;
