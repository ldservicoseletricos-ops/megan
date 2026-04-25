const phases = [
  { id: '4.1', name: 'Agentes especializados reais', area: 'inteligência', status: 'online' },
  { id: '4.2', name: 'Automação total entre apps', area: 'automação', status: 'online' },
  { id: '4.3', name: 'Autoempresa', area: 'empresa', status: 'online' },
  { id: '4.4', name: 'Copiloto pessoal total', area: 'vida', status: 'online' },
  { id: '4.5', name: 'Aprendizado contínuo real', area: 'aprendizado', status: 'online' },
  { id: '4.6', name: 'Agentes autônomos reais', area: 'autonomia', status: 'online' },
  { id: '4.7', name: 'Multicanal total', area: 'canais', status: 'online' },
  { id: '4.8', name: 'Voz, celular e presença real', area: 'voz', status: 'online' },
  { id: '4.9', name: 'Central de comando global', area: 'comando', status: 'online' },
  { id: '5.0', name: 'Ecossistema', area: 'saas', status: 'online' },
  { id: '5.1', name: 'Marketplace de agentes', area: 'marketplace', status: 'online' },
  { id: '5.2', name: 'Megan Business Cloud', area: 'empresa', status: 'online' },
  { id: '5.3', name: 'Megan Personal Life OS', area: 'vida', status: 'online' },
  { id: '5.4', name: 'Megan Voice', area: 'voz', status: 'online' },
  { id: '5.5', name: 'Megan App Store', area: 'loja', status: 'online' },
  { id: '6.0', name: 'Megan Nation', area: 'rede global', status: 'online' },
  { id: '6.5', name: 'Megan Operating Network', area: 'rede operacional', status: 'unificado' }
];

const pillars = [
  'dashboard executivo',
  'times',
  'CRM',
  'financeiro',
  'metas',
  'BI',
  'rotina',
  'saúde',
  'produtividade',
  'voz',
  'marketplace',
  'comunidade',
  'jobs executados',
  'empresas rodando sobre a Megan'
];

function getOperatingNetwork() {
  const online = phases.filter((phase) => phase.status === 'online' || phase.status === 'unificado').length;
  return {
    ok: true,
    version: '6.5.0',
    name: 'Megan Operating Network',
    mission: 'Unificar todos os módulos da Megan OS em uma rede operacional para pessoas, empresas, agentes, lojas, voz e comunidade.',
    status: 'unified',
    onlineModules: online,
    totalModules: phases.length,
    pillars,
    phases,
    layers: [
      { name: 'Pessoa', modules: ['Personal Life OS', 'Copiloto Pessoal', 'Saúde', 'Rotina', 'Foco'] },
      { name: 'Empresa', modules: ['Business Cloud', 'CRM', 'Financeiro', 'Times', 'BI'] },
      { name: 'IA', modules: ['Agentes', 'Autonomia', 'Aprendizado Contínuo', 'Execução de Jobs'] },
      { name: 'Rede', modules: ['Megan Nation', 'Marketplace Humano + IA', 'App Store', 'Comunidade'] },
      { name: 'Presença', modules: ['Megan Voice', 'Celular', 'Carro', 'Casa', 'Escritório'] }
    ],
    nextStep: 'Conectar dados reais, autenticação completa, banco Supabase e deploy Render/Vercel em produção.'
  };
}

module.exports = { getOperatingNetwork };
