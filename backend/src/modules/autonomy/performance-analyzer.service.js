const fs = require('fs');
const path = require('path');

function safeStatSize(target) {
  try {
    return fs.statSync(target).size;
  } catch (_error) {
    return 0;
  }
}

function buildPerformanceReport() {
  const rootDir = path.join(__dirname, '..', '..', '..', '..');
  const frontendPkg = path.join(rootDir, 'frontend', 'package.json');
  const frontendApp = path.join(rootDir, 'frontend', 'src', 'App.jsx');
  const admPanel = path.join(rootDir, 'frontend', 'src', 'pages', 'AdmPanel.jsx');
  const backendApp = path.join(rootDir, 'backend', 'src', 'app.js');

  const frontendWeight = safeStatSize(frontendApp) + safeStatSize(admPanel);
  const backendWeight = safeStatSize(backendApp);

  const findings = [
    {
      id: 'perf-admin-panel',
      area: 'frontend',
      metric: 'Peso do painel ADM',
      value: `${Math.round(frontendWeight / 1024)} KB de código principal`,
      severity: frontendWeight > 32000 ? 'warning' : 'info',
      recommendation: 'Separar blocos pesados do ADM em componentes/abas menores para reduzir render inicial.',
    },
    {
      id: 'perf-backend-entry',
      area: 'backend',
      metric: 'Peso do app principal',
      value: `${Math.round(backendWeight / 1024)} KB no entrypoint`,
      severity: backendWeight > 12000 ? 'warning' : 'info',
      recommendation: 'Manter o app principal fino e concentrar lógica nos módulos para reduzir risco de regressão.',
    },
    {
      id: 'perf-build-path',
      area: 'frontend-build',
      metric: 'Caminho de build',
      value: fs.existsSync(frontendPkg) ? 'frontend pronto para build via Vite' : 'frontend ausente',
      severity: fs.existsSync(frontendPkg) ? 'info' : 'danger',
      recommendation: 'Continuar validando build antes de cada pacote para evitar zip quebrado.',
    },
  ];

  const score = findings.some((item) => item.severity === 'danger') ? 58 : findings.some((item) => item.severity === 'warning') ? 78 : 90;

  return {
    ok: true,
    score,
    findings,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildPerformanceReport };
