export const AGENT_CATALOG = [
  {
    id: "research_agent",
    name: "Research Agent",
    role: "research",
    description: "Busca contexto, referências e informações úteis para a tarefa.",
    strengths: ["research", "analysis", "context gathering"],
    enabled: true
  },
  {
    id: "technical_agent",
    name: "Technical Agent",
    role: "technical",
    description: "Resolve tarefas técnicas, estrutura lógica e detalhes de implementação.",
    strengths: ["code", "architecture", "debugging"],
    enabled: true
  },
  {
    id: "writer_agent",
    name: "Writer Agent",
    role: "writing",
    description: "Refina escrita, clareza, organização e comunicação final.",
    strengths: ["writing", "editing", "clarity"],
    enabled: true
  },
  {
    id: "operator_agent",
    name: "Operator Agent",
    role: "operations",
    description: "Executa fluxo operacional, transforma plano em etapas objetivas.",
    strengths: ["execution", "operations", "task flow"],
    enabled: true
  },
  {
    id: "supervisor_agent",
    name: "Supervisor Agent",
    role: "supervision",
    description: "Revisa, valida consistência e supervisiona o pipeline dos agentes.",
    strengths: ["review", "quality control", "supervision"],
    enabled: true
  }
];

export function getAgentCatalog() {
  return AGENT_CATALOG;
}

export function listAgents() {
  return AGENT_CATALOG;
}

export function getEnabledAgents() {
  return AGENT_CATALOG.filter((agent) => agent.enabled);
}

export function findAgentById(agentId) {
  return AGENT_CATALOG.find((agent) => agent.id === agentId) || null;
}

export function getAgentById(agentId) {
  return findAgentById(agentId);
}

const agentCatalog = {
  AGENT_CATALOG,
  getAgentCatalog,
  listAgents,
  getEnabledAgents,
  findAgentById,
  getAgentById
};

export default agentCatalog;