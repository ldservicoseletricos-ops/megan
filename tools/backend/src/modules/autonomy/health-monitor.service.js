const fs = require('fs');
const path = require('path');

function exists(target) {
  return fs.existsSync(target);
}

function buildHealthOverview() {
  const rootDir = path.join(__dirname, '..', '..', '..', '..');
  const frontendDir = path.join(rootDir, 'frontend');
  const backendDir = path.join(rootDir, 'backend');
  const mobileLegacyDir = path.join(rootDir, 'mobile-app');
  const packageFrontend = exists(path.join(frontendDir, 'package.json'));
  const packageBackend = exists(path.join(backendDir, 'package.json'));
  const legacyMobile = exists(path.join(mobileLegacyDir, 'package.json'));

  const modules = [
    { id: 'backend', label: 'Backend principal', status: packageBackend ? 'online' : 'offline', note: 'API central da Megan.' },
    { id: 'frontend', label: 'Frontend principal', status: packageFrontend ? 'online' : 'offline', note: 'Base unificada da experiência web.' },
    { id: 'navigation', label: 'Navegação premium', status: 'online', note: 'Integrada ao frontend principal após a fusão.' },
    { id: 'autonomy-core', label: 'Autonomy Core 1.3', status: 'online', note: 'Monitoramento, diagnóstico, score do projeto, detector de duplicações, performance e auto patch supervisionado.' },
    { id: 'mobile-legacy', label: 'Mobile legado', status: legacyMobile ? 'standby' : 'missing', note: 'Mantido como referência, fora do fluxo principal.' },
  ];

  const online = modules.filter((item) => item.status === 'online').length;
  const standby = modules.filter((item) => item.status === 'standby').length;
  const offline = modules.filter((item) => item.status === 'offline' || item.status === 'missing').length;

  return {
    ok: offline === 0,
    score: offline === 0 ? 90 : 78,
    mode: 'supervisioned_autonomy',
    summary: offline === 0
      ? 'Core principal íntegro com autonomia supervisionada pronta para agir em baixo risco.'
      : 'Há módulos ausentes ou fora do ar. A autonomia segue em observação segura.',
    modules,
    counters: { online, standby, offline },
    checkedAt: new Date().toISOString(),
  };
}

module.exports = {
  buildHealthOverview,
};
