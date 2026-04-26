const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function projectRoot() {
  return path.resolve(__dirname, '../../../..');
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(projectRoot(), relativePath));
}

function countFiles(dir, max = 5000) {
  const root = path.join(projectRoot(), dir);
  if (!fs.existsSync(root)) return 0;
  let total = 0;
  const walk = (current) => {
    if (total >= max) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      if (entry.isFile()) total += 1;
    }
  };
  walk(root);
  return total;
}

function buildAudit() {
  const checks = [
    { id: 'backend-package', label: 'backend/package.json', ok: fileExists('backend/package.json') },
    { id: 'backend-server', label: 'backend/src/server.js', ok: fileExists('backend/src/server.js') },
    { id: 'backend-app', label: 'backend/src/app.js', ok: fileExists('backend/src/app.js') },
    { id: 'frontend-package', label: 'frontend/package.json', ok: fileExists('frontend/package.json') },
    { id: 'frontend-app', label: 'frontend/src/App.jsx', ok: fileExists('frontend/src/App.jsx') },
    { id: 'frontend-main', label: 'frontend/src/main.jsx', ok: fileExists('frontend/src/main.jsx') },
    { id: 'env-example', label: '.env.example', ok: fileExists('.env.example') },
    { id: 'docs', label: 'docs/', ok: fileExists('docs') }
  ];

  const score = Math.round((checks.filter((item) => item.ok).length / checks.length) * 100);

  return {
    ok: score >= 75,
    version: '19.0-self-evolution-engine-rebuild',
    score,
    status: score >= 90 ? 'excelente' : score >= 75 ? 'bom' : 'precisa de correção',
    files: {
      backend: countFiles('backend'),
      frontend: countFiles('frontend'),
      docs: countFiles('docs')
    },
    checks,
    priorities: [
      'Validar login persistente em frontend/src/hooks/useAuth.js',
      'Testar backend com npm install && npm start em backend',
      'Testar frontend com npm install && npm run build em frontend',
      'Conectar variáveis reais de Supabase, Render, Vercel e Gemini somente no .env local'
    ],
    safeActions: [
      { id: 'audit', title: 'Auditar estrutura do projeto', requiresApproval: false },
      { id: 'plan-upgrade', title: 'Gerar plano de upgrade supervisionado', requiresApproval: false },
      { id: 'validate-build', title: 'Validar comandos de build localmente', requiresApproval: true },
      { id: 'prepare-deploy', title: 'Preparar checklist de deploy', requiresApproval: true }
    ],
    generatedAt: new Date().toISOString()
  };
}

router.get('/status', (_req, res) => {
  res.json(buildAudit());
});

router.post('/chat', (req, res) => {
  const message = String(req.body?.message || '').toLowerCase();
  const audit = buildAudit();

  let answer = `Self Evolution 19.0 ativo. Saúde atual: ${audit.score}%. Backend: ${audit.files.backend} arquivos. Frontend: ${audit.files.frontend} arquivos.`;

  if (message.includes('erro') || message.includes('quebrado') || message.includes('validar')) {
    answer = `Validação 19.0 concluída: ${audit.status}. Pendências principais: ${audit.priorities.join(' | ')}`;
  }

  if (message.includes('tarefa') || message.includes('delegar')) {
    answer = `Tarefas supervisionadas disponíveis: ${audit.safeActions.map((action) => `${action.title}${action.requiresApproval ? ' (precisa aprovação)' : ''}`).join(' | ')}`;
  }

  res.json({
    ok: true,
    answer,
    audit,
    approvalRequired: message.includes('executar') || message.includes('corrigir') || message.includes('deploy')
  });
});

module.exports = router;
