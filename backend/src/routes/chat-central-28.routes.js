const express = require('express');

const router = express.Router();

const bootTime = Date.now();
const memory = {
  project: 'Megan OS 28.0',
  activeGoal: 'Chat central inteligente + memória + tempo real',
  lastActions: [
    'Frontend 27.1 preservado e organizado',
    'Dev Studio 27.0 mantido',
    'Chat Central 28.0 conectado aos módulos',
    'Memória local operacional ativada',
    'Status em tempo real disponível'
  ],
  preferences: [
    'Manter todos os módulos de fase',
    'Entregar arquivos completos',
    'Não apagar o restante do projeto',
    'Usar visual premium e operação simples'
  ]
};

const modules = [
  { id: 'core', label: 'Megan OS 4.2', status: 'online', category: 'base' },
  { id: 'command', label: 'Command Center 17.0', status: 'online', category: 'comando' },
  { id: 'selfEvolution', label: 'Self Evolution 19.0', status: 'online', category: 'autonomia' },
  { id: 'realAction', label: 'Real Action Engine 24.0', status: 'online', category: 'acoes' },
  { id: 'health', label: 'System Health 25.0', status: 'online', category: 'sistema' },
  { id: 'repair', label: 'Autonomous Repair 26.0', status: 'online', category: 'sistema' },
  { id: 'devStudio', label: 'Dev Studio 27.0', status: 'online', category: 'criacao' },
  { id: 'chatCentral', label: 'Chat Central 28.0', status: 'online', category: 'ia' }
];

function uptimeSeconds() {
  return Math.floor((Date.now() - bootTime) / 1000);
}

function buildAnswer(message = '') {
  const text = String(message || '').trim();
  const low = text.toLowerCase();

  if (!text) {
    return 'Envie um comando para a Megan executar, abrir módulo, criar projeto, organizar rotina ou diagnosticar o sistema.';
  }

  if (low.includes('dev') || low.includes('criar') || low.includes('projeto') || low.includes('site') || low.includes('app')) {
    return 'Entendi. Vou direcionar esse pedido para o Dev Studio 27.0: criar estrutura, organizar arquivos, gerar código e preparar publicação sem quebrar os módulos existentes.';
  }

  if (low.includes('erro') || low.includes('corrigir') || low.includes('quebrou') || low.includes('bug')) {
    return 'Vou tratar como diagnóstico técnico: verificar frontend, backend, rotas, dependências, package.json, imports e integração entre os módulos antes de propor a correção.';
  }

  if (low.includes('memoria') || low.includes('lembrar') || low.includes('contexto')) {
    return `Memória ativa: projeto ${memory.project}, objetivo atual: ${memory.activeGoal}. Estou preservando os módulos de fase e mantendo a operação unificada.`;
  }

  if (low.includes('status') || low.includes('tempo real') || low.includes('online')) {
    return `Status em tempo real: backend online, ${modules.length} módulos principais monitorados, uptime ${uptimeSeconds()}s.`;
  }

  return 'Comando recebido pela Megan OS 28.0. Vou classificar o pedido, escolher o módulo correto, preservar o projeto existente e entregar a próxima ação de forma organizada.';
}

router.get('/status', (_req, res) => {
  res.json({
    ok: true,
    version: '28.0.0',
    module: 'Chat Central + Memoria + Tempo Real',
    status: 'online',
    uptimeSeconds: uptimeSeconds(),
    modulesOnline: modules.length,
    memory,
    modules,
    timestamp: new Date().toISOString()
  });
});

router.get('/memory', (_req, res) => {
  res.json({ ok: true, memory, timestamp: new Date().toISOString() });
});

router.post('/message', (req, res) => {
  const message = req.body?.message || '';
  const answer = buildAnswer(message);

  memory.lastActions = [
    `Comando recebido: ${String(message).slice(0, 120) || 'mensagem vazia'}`,
    ...memory.lastActions
  ].slice(0, 8);

  res.json({
    ok: true,
    answer,
    routedTo: answer.includes('Dev Studio') ? 'devStudio270' : 'chatCentral280',
    memory,
    realtime: {
      backend: 'online',
      uptimeSeconds: uptimeSeconds(),
      modulesOnline: modules.length,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
