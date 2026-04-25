import { getEnvChecklist, getReadiness } from './env-check.service.js';

export function getDeployGuide() {
  const checklist = getEnvChecklist();
  const readiness = getReadiness(checklist);

  return {
    checklist,
    readiness,
    steps: [
      { id: 'step-01', title: 'Preencher variáveis do backend', target: 'C:\\megan\\backend\\.env', done: readiness.backendReady },
      { id: 'step-02', title: 'Executar SQL do Supabase', target: 'C:\\megan\\backend\\supabase\\init.sql', done: checklist.SUPABASE_URL && checklist.SUPABASE_SERVICE_ROLE_KEY },
      { id: 'step-03', title: 'Subir backend no Render', target: 'C:\\megan\\backend\\render.yaml', done: readiness.renderReady },
      { id: 'step-04', title: 'Subir frontend na Vercel', target: 'C:\\megan\\frontend\\vercel.json', done: readiness.vercelReady }
    ]
  };
}
