const blueprints = {
  site: ['Briefing', 'Identidade visual', 'Landing page', 'SEO inicial', 'Deploy Vercel'],
  app: ['Escopo', 'Telas', 'Backend', 'Banco de dados', 'Build mobile'],
  api: ['Rotas', 'Validações', 'Serviços', 'Logs', 'Documentação'],
  design: ['Referência', 'Paleta', 'Componentes', 'Mockup', 'Exportação'],
  deploy: ['Preflight', 'Variáveis', 'Build', 'Publicação', 'Teste final']
};

export function getDevStudioStatus() {
  return {
    ok: true,
    version: '27.0.0',
    name: 'Dev Studio Real Completo',
    capabilities: [
      'Criar sites e apps',
      'Gerar prompts profissionais',
      'Planejar projetos completos',
      'Organizar deploy Render/Vercel/Supabase',
      'Centralizar criação visual e técnica'
    ],
    modules: [
      { id: 'code', title: 'Code Creator', status: 'ativo' },
      { id: 'project', title: 'Project Builder', status: 'ativo' },
      { id: 'design', title: 'Design Creator', status: 'ativo' },
      { id: 'prompt', title: 'Prompt Lab', status: 'ativo' },
      { id: 'ideas', title: 'Idea Generator', status: 'ativo' },
      { id: 'deploy', title: 'Deploy Center', status: 'ativo' }
    ]
  };
}

export function createDevPlan(input = {}) {
  const type = String(input.type || 'site').toLowerCase();
  const objective = String(input.objective || 'Criar um projeto completo com Megan OS').trim();
  const steps = blueprints[type] || blueprints.site;

  return {
    ok: true,
    objective,
    type,
    plan: steps.map((step, index) => ({
      order: index + 1,
      title: step,
      action: `Executar ${step.toLowerCase()} para: ${objective}`
    })),
    nextCommand: `Megan, iniciar ${type} para ${objective}`
  };
}

export function generatePrompt(input = {}) {
  const target = String(input.target || 'projeto digital').trim();
  const style = String(input.style || 'premium, moderno e organizado').trim();

  return {
    ok: true,
    prompt: `Crie ${target} com visual ${style}, estrutura profissional, componentes reutilizaveis, responsividade, acessibilidade, estados de loading, tratamento de erro e instrucoes claras de deploy.`
  };
}
