const areaWeights = {
  backend: 22, frontend: 16, autonomy: 28, auth: 30, navigation: 20, crm: 18, health: 18, styles: 10,
};

function inferAreaFromPath(filePath = '') {
  const normalized = String(filePath).toLowerCase();
  if (normalized.includes('/frontend/')) return 'frontend';
  if (normalized.includes('/backend/')) return 'backend';
  if (normalized.includes('auth')) return 'auth';
  if (normalized.includes('navigation')) return 'navigation';
  if (normalized.includes('crm')) return 'crm';
  if (normalized.includes('health')) return 'health';
  if (normalized.includes('styles')) return 'styles';
  return 'autonomy';
}

function buildChangeImpactMap(plan = {}) {
  const files = Array.isArray(plan.files) ? plan.files : [];
  const mapped = files.map((file) => {
    const path = typeof file === 'string' ? file : file.path;
    const role = typeof file === 'string' ? 'update' : (file.role || 'update');
    const area = inferAreaFromPath(path);
    const impact = (areaWeights[area] || 12) + (role === 'create' ? 4 : 0) + (role === 'critical' ? 8 : 0);
    return { path, role, area, impact };
  });

  return {
    files: mapped,
    totalImpact: mapped.reduce((sum, item) => sum + item.impact, 0),
    affectedAreas: [...new Set(mapped.map((item) => item.area))],
    complexity: files.length >= 5 ? 'high' : files.length >= 3 ? 'medium' : 'low',
  };
}

module.exports = { inferAreaFromPath, buildChangeImpactMap };
