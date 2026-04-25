const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../../../data');
const filePath = path.join(dataDir, 'continuous-learning-state.json');

const initialState = {
  version: '4.5.0',
  status: 'active',
  title: 'Megan OS 4.5 — APRENDIZADO CONTÍNUO REAL',
  focus: 'Megan aprende com o uso diário, detecta padrões e otimiza rotinas com supervisão.',
  events: [
    { id: 'evt-001', type: 'rotina', text: 'Usuário costuma pedir pacotes ZIP completos e validados.', weight: 96 },
    { id: 'evt-002', type: 'preferencia', text: 'Preferência forte por arquivos completos prontos para colar.', weight: 98 },
    { id: 'evt-003', type: 'foco', text: 'Projeto principal atual é Megan OS com evolução por fases.', weight: 94 }
  ],
  patterns: [
    { id: 'pat-zip-validado', label: 'Entrega validada', confidence: 98, evidence: 'Pedidos recorrentes para gerar ZIP novo, testar e entregar pronto.' },
    { id: 'pat-preservar-base', label: 'Preservar base existente', confidence: 96, evidence: 'Sempre alterar somente o necessário sem apagar o restante.' },
    { id: 'pat-evolucao-fases', label: 'Evolução por fases', confidence: 93, evidence: 'Sequência 4.1, 4.2, 4.3, 4.4 e 4.5.' }
  ],
  preferences: {
    delivery: 'arquivos completos em ZIP validado',
    codeStyle: 'completo para colar, sem trechos soltos',
    stack: 'Node + React + Vite',
    backendPort: 10000,
    language: 'pt-BR'
  },
  predictions: [
    { id: 'pred-next', need: 'Próxima fase com automação mais autônoma e memória operacional', confidence: 88, action: 'preparar ciclo de aprendizado e otimização' },
    { id: 'pred-test', need: 'Validar build antes de entregar', confidence: 95, action: 'executar checagens de estrutura e ZIP' },
    { id: 'pred-ui', need: 'Mostrar painel visual claro para acompanhar aprendizado', confidence: 86, action: 'exibir padrões, preferências e recomendações' }
  ],
  optimizations: [
    { id: 'opt-001', area: 'rotina', suggestion: 'Carregar contexto do projeto antes de responder sobre evolução.', impact: 'menos repetição e mais continuidade' },
    { id: 'opt-002', area: 'resposta', suggestion: 'Priorizar entrega direta do arquivo quando o pedido for gerar fase.', impact: 'fluxo mais rápido' }
  ],
  responseImprovements: [
    { id: 'resp-001', rule: 'Quando houver arquivo, entregar link direto e status de validação.', active: true },
    { id: 'resp-002', rule: 'Quando houver código, entregar arquivo inteiro e caminho correto.', active: true }
  ],
  lastLearningCycle: null
};

function ensureStore() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(filePath)) save(initialState);
}

function read() {
  ensureStore();
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (_error) { save(initialState); return { ...initialState }; }
}

function save(state) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  return state;
}

module.exports = { read, save, initialState };
