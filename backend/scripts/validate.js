import { execSync } from 'node:child_process';

const checks = [
  'node --check backend/server.js',
  'node --check backend/src/app.js',
  'node --check backend/src/routes/devStudio.route.js',
  'node --check backend/src/services/devStudio.service.js'
];

for (const command of checks) {
  execSync(command, { stdio: 'inherit' });
}

console.log('Validacao Megan OS 27.0 concluida sem erros de sintaxe no backend.');
