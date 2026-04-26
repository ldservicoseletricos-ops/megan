const express = require('express');
const os = require('os');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ROOT_DIR = path.resolve(__dirname, '../../../..');
const DATA_DIR = path.join(ROOT_DIR, 'backend', 'data');
const AUTONOMY_FILE = path.join(DATA_DIR, 'autonomy-core-18-state.json');
const TASKS_FILE = path.join(DATA_DIR, 'autonomy-core-18-tasks.json');
const REPORTS_FILE = path.join(DATA_DIR, 'autonomy-core-18-reports.json');
const DECISIONS_FILE = path.join(DATA_DIR, 'autonomy-core-18-decisions.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const defaults = [
    [AUTONOMY_FILE, {
      mode: 'supervisionada',
      version: '18.0.0-autonomy-core',
      mission: 'Observar, analisar, priorizar e executar somente com aprovação humana.',
      active: true,
      lastCycleAt: null,
      cycleCount: 0,
    }],
    [TASKS_FILE, []],
    [REPORTS_FILE, []],
    [DECISIONS_FILE, []],
  ];

  defaults.forEach(([file, value]) => {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(value, null, 2));
  });
}

function readJson(file, fallback) {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureStore();
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function safeList(relativePath) {
  const target = path.join(ROOT_DIR, relativePath);
  if (!fs.existsSync(target)) return { path: relativePath, exists: false, count: 0, files: [] };
  const files = fs.readdirSync(target);
  return { path: relativePath, exists: true, count: files.length, files: files.slice(0, 30) };
}

function safePackage(relativePath) {
  const file = path.join(ROOT_DIR, relativePath, 'package.json');
  if (!fs.existsSync(file)) return { exists: false, path: `${relativePath}/package.json` };

  try {
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      exists: true,
      name: pkg.name || relativePath,
      version: pkg.version || '0.0.0',
      scripts: Object.keys(pkg.scripts || {}),
      dependencyCount: Object.keys(pkg.dependencies || {}).length,
      devDependencyCount: Object.keys(pkg.devDependencies || {}).length,
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

function getSnapshot() {
  const memoryTotal = os.totalmem();
  const memoryFree = os.freemem();
  const memoryUsed = memoryTotal - memoryFree;
  const backendPackage = safePackage('backend');
  const frontendPackage = safePackage('frontend');
  const backendSrc = safeList('backend/src');
  const frontendSrc = safeList('frontend/src');

  const checks = [
    { key: 'backend_package', label: 'Backend package.json', ok: backendPackage.exists, severity: 'critical' },
    { key: 'frontend_package', label: 'Frontend package.json', ok: frontendPackage.exists, severity: 'critical' },
    { key: 'backend_src', label: 'Backend src', ok: backendSrc.exists && backendSrc.count > 0, severity: 'high' },
    { key: 'frontend_src', label: 'Frontend src', ok: frontendSrc.exists && frontendSrc.count > 0, severity: 'high' },
    { key: 'memory', label: 'Memória abaixo de 85%', ok: Math.round((memoryUsed / memoryTotal) * 100) < 85, severity: 'medium' },
  ];

  const failedCritical = checks.filter((check) => !check.ok && ['critical', 'high'].includes(check.severity)).length;
  const failedMedium = checks.filter((check) => !check.ok && check.severity === 'medium').length;
  const healthScore = Math.max(35, 100 - failedCritical * 18 - failedMedium * 8 - Math.round((memoryUsed / memoryTotal) * 8));

  return {
    ok: true,
    version: '18.0.0-autonomy-core',
    timestamp: new Date().toISOString(),
    healthScore,
    autonomy: readJson(AUTONOMY_FILE, {}),
    system: {
      node: process.version,
      platform: `${os.platform()} ${os.release()}`,
      uptimeSeconds: Math.round(process.uptime()),
      cwd: process.cwd(),
      memory: {
        totalMb: Math.round(memoryTotal / 1024 / 1024),
        usedMb: Math.round(memoryUsed / 1024 / 1024),
        freeMb: Math.round(memoryFree / 1024 / 1024),
        usedPercent: Math.round((memoryUsed / memoryTotal) * 100),
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'desconhecido',
        loadAverage: os.loadavg(),
      },
    },
    project: {
      root: ROOT_DIR,
      backendPackage,
      frontendPackage,
      backendSrc,
      frontendSrc,
      docs: safeList('docs'),
      data: safeList('backend/data'),
    },
    checks,
    tasks: readJson(TASKS_FILE, []),
    reports: readJson(REPORTS_FILE, []).slice(0, 12),
    decisions: readJson(DECISIONS_FILE, []).slice(0, 20),
  };
}

function classifyPriority(check) {
  if (check.ok) return 'baixa';
  if (check.severity === 'critical') return 'urgente';
  if (check.severity === 'high') return 'alta';
  return 'media';
}

function buildTaskFromCheck(check) {
  return {
    id: `auto18_${check.key}_${Date.now()}`,
    title: `Corrigir: ${check.label}`,
    description: `A autonomia 18.0 detectou falha em ${check.label}. Ação criada automaticamente para validação humana antes de executar.`,
    priority: classifyPriority(check),
    status: 'pendente_validacao',
    source: 'autonomy_core_18',
    createdAt: new Date().toISOString(),
    approvalRequired: true,
  };
}

function runAutonomyCycle(reason = 'ciclo manual') {
  const snapshot = getSnapshot();
  const state = readJson(AUTONOMY_FILE, {});
  const existingTasks = readJson(TASKS_FILE, []);
  const existingKeys = new Set(existingTasks.map((task) => task.sourceKey));

  const newTasks = snapshot.checks
    .filter((check) => !check.ok && !existingKeys.has(check.key))
    .map((check) => ({ ...buildTaskFromCheck(check), sourceKey: check.key }));

  const updatedTasks = [...newTasks, ...existingTasks].slice(0, 250);
  writeJson(TASKS_FILE, updatedTasks);

  const decision = {
    id: `decision_${Date.now()}`,
    reason,
    healthScore: snapshot.healthScore,
    createdTasks: newTasks.length,
    status: newTasks.length ? 'tarefas_criadas_para_validacao' : 'nenhuma_acao_critica',
    createdAt: new Date().toISOString(),
  };

  const decisions = readJson(DECISIONS_FILE, []);
  writeJson(DECISIONS_FILE, [decision, ...decisions].slice(0, 200));

  const nextState = {
    ...state,
    active: true,
    mode: 'supervisionada',
    lastCycleAt: new Date().toISOString(),
    cycleCount: Number(state.cycleCount || 0) + 1,
    lastHealthScore: snapshot.healthScore,
  };
  writeJson(AUTONOMY_FILE, nextState);

  return {
    ok: true,
    decision,
    newTasks,
    snapshot: getSnapshot(),
    message: newTasks.length
      ? `Ciclo concluído. ${newTasks.length} tarefa(s) criada(s) para validação humana.`
      : 'Ciclo concluído. Nenhuma falha crítica nova encontrada.',
  };
}

function generateReport() {
  const snapshot = getSnapshot();
  const urgentTasks = snapshot.tasks.filter((task) => ['urgente', 'alta'].includes(task.priority) && task.status !== 'concluida');
  const report = {
    id: `report_${Date.now()}`,
    title: 'Relatório Autonomy Core 18.0',
    createdAt: new Date().toISOString(),
    healthScore: snapshot.healthScore,
    summary: `Saúde ${snapshot.healthScore}%. ${urgentTasks.length} tarefa(s) de prioridade alta/urgente em aberto. Backend e frontend ${snapshot.project.backendPackage.exists && snapshot.project.frontendPackage.exists ? 'detectados' : 'precisam validação'}.`,
    recommendations: [
      snapshot.healthScore < 80 ? 'Priorizar correções pendentes antes de novo deploy.' : 'Sistema apto para próxima evolução supervisionada.',
      'Manter execução sensível somente após aprovação humana.',
      'Rodar validação local após cada pacote gerado.',
    ],
  };

  const reports = readJson(REPORTS_FILE, []);
  writeJson(REPORTS_FILE, [report, ...reports].slice(0, 120));
  return report;
}

function buildChatAnswer(message) {
  const text = String(message || '').toLowerCase();
  const snapshot = getSnapshot();

  if (text.includes('ciclo') || text.includes('autonomia') || text.includes('analise') || text.includes('analisar')) {
    const result = runAutonomyCycle(message || 'chat autonomy cycle');
    return {
      ok: true,
      answer: result.message,
      actions: ['Ver tarefas criadas', 'Gerar relatório', 'Aprovar tarefas'],
      result,
    };
  }

  if (text.includes('relatório') || text.includes('relatorio')) {
    const report = generateReport();
    return {
      ok: true,
      answer: report.summary,
      actions: report.recommendations,
      report,
      snapshot,
    };
  }

  if (text.includes('prioridade') || text.includes('tarefas')) {
    const openTasks = snapshot.tasks.filter((task) => task.status !== 'concluida');
    return {
      ok: true,
      answer: openTasks.length ? `Existem ${openTasks.length} tarefa(s) abertas. Prioridade maior: ${openTasks[0]?.priority || 'media'}.` : 'Nenhuma tarefa aberta no Autonomy Core 18.0.',
      actions: ['Aprovar prioridade alta', 'Concluir tarefas resolvidas'],
      snapshot,
    };
  }

  return {
    ok: true,
    answer: `Autonomy Core 18.0 ativo em modo supervisionado. Saúde atual: ${snapshot.healthScore}%. Posso analisar, criar tarefas, gerar relatório e preparar execução com aprovação.`,
    actions: ['Rodar ciclo de autonomia', 'Gerar relatório', 'Listar tarefas'],
    snapshot,
  };
}

router.get('/status', (_req, res) => {
  res.json(getSnapshot());
});

router.post('/cycle', (req, res) => {
  res.json(runAutonomyCycle(req.body?.reason || 'ciclo solicitado pelo operador'));
});

router.post('/report', (_req, res) => {
  res.json({ ok: true, report: generateReport(), snapshot: getSnapshot() });
});

router.get('/tasks', (_req, res) => {
  res.json({ ok: true, tasks: readJson(TASKS_FILE, []) });
});

router.post('/tasks/:id/status', (req, res) => {
  const allowed = ['pendente_validacao', 'aprovada', 'em_execucao', 'concluida', 'cancelada'];
  const status = req.body?.status;
  if (!allowed.includes(status)) return res.status(400).json({ ok: false, error: 'Status inválido.' });

  const tasks = readJson(TASKS_FILE, []);
  const updated = tasks.map((task) => task.id === req.params.id ? { ...task, status, updatedAt: new Date().toISOString() } : task);
  writeJson(TASKS_FILE, updated);
  res.json({ ok: true, task: updated.find((task) => task.id === req.params.id) });
});

router.post('/chat', (req, res) => {
  res.json(buildChatAnswer(req.body?.message));
});

module.exports = router;
