const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', '..');
const frontendPackage = path.join(projectRoot, 'frontend', 'package.json');
const backendSource = path.join(projectRoot, 'backend', 'src', 'app.js');

if (!fs.existsSync(frontendPackage)) {
  throw new Error('frontend/package.json nao encontrado.');
}

if (!fs.existsSync(backendSource)) {
  throw new Error('backend/src/app.js nao encontrado.');
}

console.log('[build] Estrutura principal validada com sucesso.');
console.log('[build] Para gerar o frontend de producao, execute no PowerShell:');
console.log('cd frontend');
console.log('npm install');
console.log('npm run build');
