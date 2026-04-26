import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STATE_FILE = path.join(DATA_DIR, 'multi-brains-state.json');

const DEFAULT_STATE = {
  activeBrain: 'operational',
  confidence: 0,
  routingReason: 'Nenhuma missão classificada ainda',
  availableBrains: [
    { id: 'founder', label: 'Founder Brain', specialty: 'negócio, direção, receita, crescimento' },
    { id: 'strategic', label: 'Strategic Brain', specialty: 'planejamento, priorização, direção' },
    { id: 'technical', label: 'Technical Brain', specialty: 'backend, frontend, rotas, correções' },
    { id: 'commercial', label: 'Commercial Brain', specialty: 'oferta, venda, conversão, proposta' },
    { id: 'operational', label: 'Operational Brain', specialty: 'execução, tarefas, fluxo' },
    { id: 'editorial', label: 'Editorial Brain', specialty: 'livros, conteúdo, KDP, texto' }
  ],
  history: [],
  updatedAt: null
};

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function normalizeState(state) {
  const base = state && typeof state === 'object' ? state : {};
  return {
    ...DEFAULT_STATE,
    ...base,
    history: Array.isArray(base.history) ? base.history.slice(-30) : [],
    availableBrains: Array.isArray(base.availableBrains) ? base.availableBrains : DEFAULT_STATE.availableBrains
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

export async function getMultiBrainsState() {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(STATE_FILE, 'utf-8');
    return normalizeState(JSON.parse(raw));
  } catch {
    const initial = normalizeState(DEFAULT_STATE);
    await writeState(initial);
    return initial;
  }
}

function classifyBrain(message = '') {
  const text = String(message || '').toLowerCase().trim();

  if (!text) {
    return {
      activeBrain: 'operational',
      confidence: 55,
      routingReason: 'Sem mensagem específica, mantendo roteamento operacional padrão.'
    };
  }

  if (
    text.includes('negócio') || text.includes('negocio') || text.includes('empresa') || text.includes('receita') ||
    text.includes('vender') || text.includes('monetização') || text.includes('monetizacao') || text.includes('growth') ||
    text.includes('escala') || text.includes('mercado') || text.includes('fundador') || text.includes('founder')
  ) {
    return {
      activeBrain: 'founder',
      confidence: 95,
      routingReason: 'Missão detectada como founder por conter receita, negócio, crescimento ou direção de empresa.'
    };
  }

  if (
    text.includes('comercial') || text.includes('lead') || text.includes('proposta') || text.includes('cliente') ||
    text.includes('conversão') || text.includes('conversao') || text.includes('onboarding')
  ) {
    return {
      activeBrain: 'commercial',
      confidence: 91,
      routingReason: 'Missão detectada como comercial por conter vendas, leads, conversão ou cliente.'
    };
  }

  if (
    text.includes('backend') || text.includes('frontend') || text.includes('api') || text.includes('rota') ||
    text.includes('erro') || text.includes('bug') || text.includes('patch')
  ) {
    return {
      activeBrain: 'technical',
      confidence: 92,
      routingReason: 'Missão detectada como técnica por conter contexto de código, rota, API ou correção.'
    };
  }

  if (
    text.includes('estratégia') || text.includes('estrategia') || text.includes('plano') || text.includes('direção') ||
    text.includes('objetivo') || text.includes('prioridade')
  ) {
    return {
      activeBrain: 'strategic',
      confidence: 90,
      routingReason: 'Missão detectada como estratégica por conter planejamento, direção ou priorização.'
    };
  }

  if (
    text.includes('livro') || text.includes('kdp') || text.includes('amazon') || text.includes('texto') ||
    text.includes('capa') || text.includes('descrição') || text.includes('descricao')
  ) {
    return {
      activeBrain: 'editorial',
      confidence: 91,
      routingReason: 'Missão detectada como editorial por conter publicação, texto ou KDP.'
    };
  }

  return {
    activeBrain: 'operational',
    confidence: 86,
    routingReason: 'Missão detectada como operacional por envolver execução e andamento geral.'
  };
}

export async function routeMissionToBrain(message = '') {
  const current = await getMultiBrainsState();
  const routed = classifyBrain(message);

  const nextState = normalizeState({
    ...current,
    ...routed,
    updatedAt: new Date().toISOString(),
    history: [
      {
        createdAt: new Date().toISOString(),
        message: String(message || '').trim(),
        activeBrain: routed.activeBrain,
        confidence: routed.confidence,
        routingReason: routed.routingReason
      },
      ...current.history
    ]
  });

  await writeState(nextState);
  return nextState;
}
