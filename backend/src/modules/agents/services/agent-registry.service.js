const SPECIALIZED_AGENTS = [
  {
    id: 'architect',
    name: 'Arquiteta Técnica',
    type: 'technical_architecture',
    role: 'Organiza backend, frontend, banco, deploy e estrutura de arquivos.',
    strengths: ['Node', 'React', 'Vite', 'Supabase', 'Render', 'Vercel'],
    triggers: ['erro', 'backend', 'frontend', 'api', 'deploy', 'render', 'vercel', 'supabase', 'código', 'arquivo'],
    priority: 96,
  },
  {
    id: 'frontend',
    name: 'Especialista Frontend',
    type: 'frontend_experience',
    role: 'Cuida do visual, responsividade, organização de telas e experiência do usuário.',
    strengths: ['UI premium', 'CSS', 'componentes', 'mobile', 'animações'],
    triggers: ['visual', 'tela', 'botão', 'layout', 'mobile', 'css', 'animação', 'frontend'],
    priority: 92,
  },
  {
    id: 'backend',
    name: 'Especialista Backend',
    type: 'backend_execution',
    role: 'Cuida das rotas, controladores, serviços, validações, integrações e saúde da API.',
    strengths: ['Express', 'rotas', 'serviços', 'validação', 'logs', 'porta 10000'],
    triggers: ['rota', 'controller', 'service', 'endpoint', 'api', 'porta', 'server', 'node'],
    priority: 93,
  },
  {
    id: 'autonomy',
    name: 'Agente de Autonomia',
    type: 'controlled_autonomy',
    role: 'Planeja evolução supervisionada, autocorreção segura e melhorias progressivas.',
    strengths: ['missões', 'prioridade', 'autocorreção', 'governança', 'rollback'],
    triggers: ['evoluir', 'autonomia', 'sozinha', 'melhoria', 'corrigir', 'fase', 'missão'],
    priority: 95,
  },
  {
    id: 'business',
    name: 'Estrategista de Negócio',
    type: 'business_strategy',
    role: 'Transforma recursos da Megan OS em produto, planos, receita e valor comercial.',
    strengths: ['planos', 'CRM', 'billing', 'precificação', 'produto'],
    triggers: ['vender', 'cliente', 'plano', 'stripe', 'assinatura', 'valor', 'negócio'],
    priority: 87,
  },
  {
    id: 'editorial',
    name: 'Agente Editorial',
    type: 'content_creation',
    role: 'Apoia livros, textos, descrições, estrutura editorial e publicação digital.',
    strengths: ['KDP', 'livros', 'copy', 'roteiros', 'conteúdo'],
    triggers: ['livro', 'kdp', 'história', 'capa', 'texto', 'descrição', 'amazon'],
    priority: 84,
  },
  {
    id: 'operator',
    name: 'Operadora de Execução',
    type: 'operational_execution',
    role: 'Transforma pedidos em passos executáveis, checklist e entregas prontas para uso.',
    strengths: ['passo a passo', 'checklist', 'PowerShell', 'validação', 'entrega'],
    triggers: ['passo', 'instalar', 'rodar', 'subir git', 'comando', 'powershell', 'agora'],
    priority: 90,
  },
];

function normalizeText(value = '') {
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function getAgents() {
  return SPECIALIZED_AGENTS.map((agent) => ({ ...agent, status: 'online' }));
}

function scoreAgent(agent, text) {
  const normalized = normalizeText(text);
  const triggerHits = agent.triggers.filter((trigger) => normalized.includes(normalizeText(trigger)));
  const typeHit = normalized.includes(normalizeText(agent.type)) ? 1 : 0;
  const score = Math.min(100, Math.round(agent.priority * 0.55 + triggerHits.length * 12 + typeHit * 10));
  return { ...agent, score, triggerHits, status: score >= 55 ? 'selected' : 'standby' };
}

function selectAgents(input = '') {
  const ranked = SPECIALIZED_AGENTS.map((agent) => scoreAgent(agent, input)).sort((a, b) => b.score - a.score);
  const selected = ranked.filter((agent) => agent.score >= 55).slice(0, 3);
  return selected.length ? selected : ranked.slice(0, 2);
}

module.exports = { getAgents, selectAgents };
