import { getEnvChecklist, getReadiness } from './env-check.service.js';

export function getFinalCheck() {
  const checklist = getEnvChecklist();
  const readiness = getReadiness(checklist);

  return {
    readiness,
    productionChecks: [
      { id: 'prod-01', title: 'Frontend publicado abre sem erro', status: 'manual' },
      { id: 'prod-02', title: 'Backend responde /api/health', status: 'manual' },
      { id: 'prod-03', title: 'Endpoint /api/env-check responde', status: 'manual' },
      { id: 'prod-04', title: 'Endpoint /api/deploy-guide responde', status: 'manual' },
      { id: 'prod-05', title: 'Endpoint /api/auto-fix responde', status: 'manual' },
      { id: 'prod-06', title: 'Endpoint /api/action-priority responde', status: 'manual' },
      { id: 'prod-07', title: 'Endpoint /api/safe-auto-run responde', status: 'manual' }
    ],
    finalStatus: readiness.overallReady ? 'pronto para validação final' : 'configuração incompleta',
  };
}
