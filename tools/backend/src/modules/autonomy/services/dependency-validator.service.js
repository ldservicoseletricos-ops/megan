function validateDependencies(plan = {}) {
  const files = Array.isArray(plan.files) ? plan.files : [];
  const hasBackend = files.some((item) => String(item.path || item).includes('/backend/'));
  const hasFrontend = files.some((item) => String(item.path || item).includes('/frontend/'));
  const hasApiClient = files.some((item) => String(item.path || item).includes('autonomyApi'));
  const hasRoute = files.some((item) => String(item.path || item).includes('autonomy.routes'));
  const rules = [];

  if (hasBackend && hasFrontend && !hasApiClient) rules.push({ ok: false, code: 'missing_api_client', message: 'Patch cruza backend e frontend mas não inclui integração da API.' });
  if (hasBackend && hasFrontend && !hasRoute) rules.push({ ok: false, code: 'missing_route_contract', message: 'Patch cruza backend e frontend mas não inclui atualização de rota/contrato.' });
  if (!rules.length) rules.push({ ok: true, code: 'dependencies_ok', message: 'Dependências mínimas do patch multiarquivo estão consistentes.' });

  return {
    ok: rules.every((item) => item.ok !== false),
    rules,
    summary: rules.every((item) => item.ok !== false) ? 'Dependências cruzadas validadas com sucesso.' : 'Validação de dependências encontrou bloqueios.',
  };
}

module.exports = { validateDependencies };
