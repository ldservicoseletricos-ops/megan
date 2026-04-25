const fs = require('fs');
const path = require('path');

function exists(target) {
  return fs.existsSync(target);
}

function buildDuplicateReport() {
  const rootDir = path.join(__dirname, '..', '..', '..', '..');
  const checks = [
    {
      id: 'dup-navigation-api',
      label: 'API de navegação duplicada',
      files: [
        path.join(rootDir, 'backend', 'src', 'routes', 'mobile-navigation.routes.js'),
        path.join(rootDir, 'backend-mobile', 'src', 'routes', 'mobile-navigation.routes.js'),
      ],
      impact: 'high',
      recommendation: 'Manter backend/src/routes/mobile-navigation.routes.js como fonte oficial e arquivar backend-mobile depois da consolidação total.',
    },
    {
      id: 'dup-navigation-ui',
      label: 'UI de navegação em duas bases',
      files: [
        path.join(rootDir, 'frontend', 'src', 'navigation', 'NavigationExperience.jsx'),
        path.join(rootDir, 'mobile-app', 'src', 'pages', 'RoutePage.jsx'),
      ],
      impact: 'high',
      recommendation: 'Usar frontend/src/navigation como base oficial e congelar a evolução visual direta no mobile-app.',
    },
    {
      id: 'dup-frontends',
      label: 'Frontends legados paralelos',
      files: [
        path.join(rootDir, 'frontend-base', 'package.json'),
        path.join(rootDir, 'frontend-user', 'package.json'),
      ],
      impact: 'medium',
      recommendation: 'Manter esses frontends apenas como legado/arquivo até a retirada controlada.',
    },
  ];

  const duplicates = checks
    .map((item) => ({
      ...item,
      detected: item.files.every((file) => exists(file)),
      existingFiles: item.files.filter((file) => exists(file)).map((file) => path.relative(rootDir, file)),
    }))
    .filter((item) => item.detected);

  return {
    ok: true,
    duplicateCount: duplicates.length,
    duplicates,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildDuplicateReport };
