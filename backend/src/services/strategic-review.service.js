import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getGoalsState } from './goal-decomposer.service.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getFeedbackLoopState } from './feedback-loop.service.js';
import { getConsensusEngineState } from './consensus-engine.service.js';
import { getEvolutionGovernanceState } from './evolution-governance.service.js';
import { getEvolutionModeState } from './evolution-mode.service.js';
import { getImprovementProposalsState } from './improvement-proposal.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'strategic-review-state.json');

const DEFAULT_STATE = {
  version: '7.0.0',
  updatedAt: null,
  users: {}
};

function ensureDir() { fs.mkdirSync(DATA_DIR, { recursive: true }); }
function nowIso() { return new Date().toISOString(); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function safeRead() {
  try {
    if (!fs.existsSync(STATE_PATH)) return structuredClone(DEFAULT_STATE);
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}
function safeWrite(state) {
  ensureDir();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      activeStrategicFocus: 'Consolidar execução estável',
      executionReadiness: 'guarded',
      reviewScore: 0,
      strengths: [],
      risks: [],
      opportunities: [],
      strategicPriorities: [],
      recommendations: [],
      lastReviewSummary: 'Nenhuma revisão estratégica executada ainda.',
      lastReviewAt: null,
      reviewCount: 0,
      history: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function buildPriorities({ goalsState, roadmapState, proposalsState }) {
  const priorities = [];
  if (goalsState?.activeGoal?.title) {
    priorities.push({
      title: `Concluir meta ativa: ${goalsState.activeGoal.title}`,
      lane: 'core_execution',
      owner: 'goal_decomposer',
      urgency: goalsState.activeGoal.progress >= 75 ? 'high' : 'medium'
    });
  }
  if (roadmapState?.nextAction?.title) {
    priorities.push({
      title: `Desbloquear próxima ação: ${roadmapState.nextAction.title}`,
      lane: 'execution_roadmap',
      owner: 'execution_priority',
      urgency: 'high'
    });
  }
  const safeProposals = (proposalsState?.proposals || []).filter((item) => item?.safeToApply).length;
  if (safeProposals > 0) {
    priorities.push({
      title: `Avaliar ${safeProposals} melhoria(s) segura(s)`,
      lane: 'safe_improvement',
      owner: 'auto_improvement',
      urgency: safeProposals > 2 ? 'high' : 'medium'
    });
  }
  return priorities.slice(0, 6);
}

export function getStrategicReviewState({ userId='luiz' }={}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runStrategicReview({ userId='luiz', source='manual' }={}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const goalsState = getGoalsState({ userId });
  const roadmapState = getExecutionRoadmapState({ userId });
  const feedbackState = getFeedbackLoopState({ userId });
  const consensusState = getConsensusEngineState({ userId });
  const governanceState = getEvolutionGovernanceState({ userId });
  const modeState = getEvolutionModeState({ userId });
  const proposalsState = getImprovementProposalsState({ userId });

  const failures = Number(feedbackState?.totals?.failures || 0);
  const successes = Number(feedbackState?.totals?.successes || 0);
  const consensus = Number(consensusState?.consensusScore || 0);
  const blocked = Number((roadmapState?.blockedActions || []).length || 0);
  const progress = Number(roadmapState?.progress || goalsState?.activeGoal?.progress || 0);
  const safeProposals = (proposalsState?.proposals || []).filter((item) => item?.safeToApply).length;
  const manualProposals = (proposalsState?.proposals || []).filter((item) => !item?.safeToApply).length;

  const strengths = [];
  if (consensus >= 70) strengths.push(`Consenso operacional em ${consensus}%`);
  if (successes > failures) strengths.push(`Feedback favorável com ${successes} sucesso(s)`);
  if (progress >= 50) strengths.push(`Roadmap com ${progress}% de progresso`);
  if (safeProposals > 0) strengths.push(`${safeProposals} proposta(s) segura(s) pronta(s) para avaliar`);

  const risks = [];
  if (failures > 0) risks.push(`Falhas recentes registradas: ${failures}`);
  if (blocked > 0) risks.push(`Ações bloqueadas no roadmap: ${blocked}`);
  if (manualProposals > safeProposals) risks.push('Há mais propostas manuais do que seguras');
  if ((governanceState?.blockers || []).length) risks.push(...governanceState.blockers.map((item) => String(item)));

  const opportunities = [];
  if (goalsState?.activeGoal?.title) opportunities.push(`Acelerar execução da meta ${goalsState.activeGoal.title}`);
  if (safeProposals > 0) opportunities.push('Aplicar melhoria segura alinhada ao consenso');
  if (consensus >= 75 && failures <= 1) opportunities.push('Expandir capacidade em trilha controlada');
  if (!opportunities.length) opportunities.push('Consolidar base atual antes de expandir');

  const strategicPriorities = buildPriorities({ goalsState, roadmapState, proposalsState });
  const recommendations = [
    progress < 40 ? 'Reforçar foco em execução básica antes de expandir escopo.' : 'Manter cadência de execução da meta ativa.',
    failures > 2 ? 'Usar modo seguro até reduzir falhas recorrentes.' : 'Permitir pequenas expansões controladas.',
    manualProposals > 0 ? 'Separar melhorias automáticas de mudanças que exigem revisão manual.' : 'Pode promover melhorias seguras automaticamente.'
  ];

  const reviewScore = Math.max(0, Math.min(100, Math.round((consensus * 0.35) + (progress * 0.35) + (Math.max(successes - failures, 0) * 10) + (safeProposals * 4) - (blocked * 8) - (failures * 6))));
  const executionReadiness = reviewScore >= 75 ? 'expand_ready' : reviewScore >= 55 ? 'controlled' : 'guarded';
  const activeStrategicFocus = strategicPriorities[0]?.title || 'Consolidar execução estável';
  const lastReviewSummary = `Foco ${activeStrategicFocus}. Prontidão ${executionReadiness}. Score ${reviewScore}. Modo ${modeState?.selectedMode || 'guided_safe'}.`;

  Object.assign(bucket, {
    activeStrategicFocus,
    executionReadiness,
    reviewScore,
    strengths,
    risks,
    opportunities,
    strategicPriorities,
    recommendations,
    lastReviewSummary,
    lastReviewAt: nowIso(),
    reviewCount: Number(bucket.reviewCount || 0) + 1,
    updatedAt: nowIso()
  });

  bucket.history = [{
    id: `strategic-review-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source,
    reviewScore,
    executionReadiness,
    summary: lastReviewSummary,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getStrategicReviewState({ userId }),
    inputs: {
      goalsState,
      roadmapState,
      feedbackState,
      consensusState,
      governanceState,
      modeState,
      proposalsState
    }
  };
}
