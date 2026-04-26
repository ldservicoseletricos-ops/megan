const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const backendRoot = path.resolve(__dirname, '..', '..');
const projectRoot = path.resolve(backendRoot, '..', '..');
const dataDir = path.join(backendRoot, 'data');

function readJson(relativePath, fallback) {
  try {
    const fullPath = path.isAbsolute(relativePath) ? relativePath : path.join(dataDir, relativePath);
    if (!fs.existsSync(fullPath)) return fallback;
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(projectRoot, relativePath));
}

function listFilesSafe(relativePath) {
  try {
    const fullPath = path.join(projectRoot, relativePath);
    if (!fs.existsSync(fullPath)) return [];
    return fs.readdirSync(fullPath);
  } catch (error) {
    return [];
  }
}

function checkEnvironment() {
  const required = [
    'GEMINI_API_KEY',
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'GITHUB_TOKEN',
    'RENDER_API_KEY',
    'VERCEL_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  return required.map((key) => ({
    key,
    configured: Boolean(process.env[key]),
  }));
}

function buildProjectSummary() {
  const packageJson = readJson(path.join(projectRoot, 'package.json'), {});
  const backendPackage = readJson(path.join(projectRoot, 'backend', 'package.json'), {});
  const frontendPackage = readJson(path.join(projectRoot, 'frontend', 'package.json'), {});
  const logs = readJson('logs.json', []);
  const metrics = readJson('metrics.json', {});
  const state = readJson('master-state.json', readJson('autonomy-core-state.json', {}));
  const integrations = checkEnvironment();
  const missing = integrations.filter((item) => !item.configured);

  const modules = {
    backendRoutes: listFilesSafe('backend/src/modules'),
    frontendFeatures: listFilesSafe('frontend/src/features'),
    hasVoiceAlwaysOn: exists('frontend/src/features/voice/VoiceAlwaysOn.jsx'),
    hasSelfGrowth: exists('frontend/src/features/selfGrowth/SelfGrowthPage.jsx'),
    hasSelfInfrastructure: exists('frontend/src/features/selfInfrastructure/SelfInfrastructurePage.jsx'),
    hasDeployAutopilot: exists('frontend/src/features/deployAutopilot/DeployAutopilotPage.jsx'),
  };

  const health = {
    backend: true,
    frontendStructure: exists('frontend/src/App.jsx'),
    backendStructure: exists('backend/src/app.js'),
    voiceMode: modules.hasVoiceAlwaysOn,
    persistentData: exists('backend/src/modules/persistent-core/persistent-core.routes.js'),
    integrationsReady: missing.length === 0,
  };

  const priorities = [];
  if (!health.integrationsReady) priorities.push('Concluir integrações ausentes no painel ou .env seguro.');
  if (!health.persistentData) priorities.push('Ativar persistência real para impedir perda de configurações.');
  if (health.voiceMode) priorities.push('Testar comando de voz: Ok Megan, trazer resumo do projeto.');
  priorities.push('Validar backend /api/health antes do deploy.');
  priorities.push('Gerar relatório executivo antes de cada nova fase.');

  return {
    ok: true,
    project: {
      name: packageJson.name || 'Megan OS',
      version: packageJson.version || backendPackage.version || frontendPackage.version || '10.0',
      mode: 'Executive Operator AI',
      base: '9.5 funcional + operador executivo',
    },
    health,
    modules,
    integrations: {
      total: integrations.length,
      configured: integrations.filter((item) => item.configured).length,
      missing: missing.map((item) => item.key),
      score: Math.round((integrations.filter((item) => item.configured).length / integrations.length) * 100),
    },
    state: {
      mission: state.mission || state.activeMission || 'Expandir autonomia segura',
      brain: state.brain || state.activeBrain || 'Executive Operator',
      mode: state.mode || 'supervisionado',
    },
    metrics,
    recentLogs: Array.isArray(logs) ? logs.slice(-8).reverse() : [],
    priorities,
    summaryText: [
      'Luiz, resumo do projeto Megan OS:',
      `Backend: ${health.backend ? 'online' : 'pendente'}.`,
      `Frontend: ${health.frontendStructure ? 'estrutura encontrada' : 'estrutura não encontrada'}.`,
      `Voz: ${health.voiceMode ? 'ativa no navegador' : 'pendente'}.`,
      `Integrações: ${integrations.filter((item) => item.configured).length}/${integrations.length} configuradas.`,
      `Prioridade: ${priorities[0] || 'manter operação estável'}`,
    ].join(' '),
    timestamp: new Date().toISOString(),
  };
}

function buildTaskPlan(command = '') {
  const summary = buildProjectSummary();
  const text = String(command || '').toLowerCase();
  const actions = [];

  if (text.includes('resumo') || text.includes('projeto') || !text.trim()) {
    actions.push({ title: 'Gerar resumo executivo', status: 'feito', detail: 'Resumo atual do projeto montado com backend, frontend, módulos e integrações.' });
  }

  if (text.includes('tarefa') || text.includes('pendente') || text.includes('realizar')) {
    actions.push({ title: 'Listar tarefas pendentes', status: 'feito', detail: 'Prioridades calculadas com base no estado atual e integrações ausentes.' });
  }

  if (text.includes('corrigir') || text.includes('erro')) {
    actions.push({ title: 'Diagnosticar falhas seguras', status: 'supervisionado', detail: 'Correções críticas devem ser aprovadas antes de alterar arquivos ou deploy.' });
  }

  if (text.includes('deploy') || text.includes('publicar')) {
    actions.push({ title: 'Preparar deploy supervisionado', status: 'aguardando integração', detail: 'GitHub, Render, Vercel e Supabase precisam estar conectados.' });
  }

  if (!actions.length) {
    actions.push({ title: 'Interpretar comando', status: 'feito', detail: `Comando recebido: ${command}` });
  }

  return {
    ok: true,
    command,
    actions,
    nextStep: summary.priorities[0],
    summary: summary.summaryText,
    project: summary.project,
    health: summary.health,
    integrations: summary.integrations,
    timestamp: new Date().toISOString(),
  };
}

router.get('/health', (_req, res) => {
  res.json({ ok: true, module: 'executive-operator', status: 'ready', timestamp: new Date().toISOString() });
});

router.get('/summary', (_req, res) => {
  res.json(buildProjectSummary());
});

router.post('/summary', (_req, res) => {
  res.json(buildProjectSummary());
});

router.post('/tasks', (req, res) => {
  res.json(buildTaskPlan(req.body?.command || 'realizar tarefas pendentes e trazer resumo do projeto'));
});

router.post('/voice-command', (req, res) => {
  const command = req.body?.command || req.body?.message || '';
  const result = buildTaskPlan(command);
  res.json({
    ...result,
    reply: `${result.summary} Próxima ação recomendada: ${result.nextStep}`,
  });
});

module.exports = router;
