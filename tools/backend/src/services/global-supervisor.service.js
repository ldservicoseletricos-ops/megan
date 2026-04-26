import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getBrainCoordinatorState } from './brain-coordinator.service.js';
import { getConsensusEngineState } from './consensus-engine.service.js';
import { getEvolutionGovernanceState } from './evolution-governance.service.js';
import { getStrategicReviewState } from './strategic-review.service.js';
import { getControlledExpansionState } from './controlled-expansion.service.js';
import { getAutoImprovementState } from './auto-improvement.service.js';
import { getFeedbackLoopState } from './feedback-loop.service.js';
import { getEvolutionCampaignPlannerState } from './evolution-campaign-planner.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'global-supervisor-state.json');

const DEFAULT_STATE = {
  version: '8.0.0',
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
function makeId(prefix='supervisor') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      supervisionMode: 'balanced',
      systemAlignment: 'guarded',
      supervisorScore: 0,
      recommendedDirective: 'Consolidar execução estável',
      activeCampaignId: null,
      approvals: [],
      blockers: [],
      watchpoints: [],
      consultedBrains: [],
      lastSupervisionSummary: 'Nenhuma supervisão global executada ainda.',
      runCount: 0,
      history: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

export function getGlobalSupervisorState({ userId='luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runGlobalSupervisor({ userId='luiz', source='manual' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const coordinatorState = getBrainCoordinatorState({ userId });
  const consensusState = getConsensusEngineState({ userId });
  const governanceState = getEvolutionGovernanceState({ userId });
  const strategicState = getStrategicReviewState({ userId });
  const expansionState = getControlledExpansionState({ userId });
  const autoImprovementState = getAutoImprovementState({ userId });
  const feedbackState = getFeedbackLoopState({ userId });
  const campaignState = getEvolutionCampaignPlannerState({ userId });

  const consensusScore = Number(consensusState?.consensusScore || 0);
  const governanceScore = Number(governanceState?.governanceScore || 0);
  const strategicScore = Number(strategicState?.reviewScore || 0);
  const expansionScore = Number(expansionState?.expansionScore || 0);
  const autoImprovementScore = Number(autoImprovementState?.improvementScore || 0);
  const failures = Number(feedbackState?.totals?.failures || 0);
  const successes = Number(feedbackState?.totals?.successes || 0);

  const supervisorScore = Math.max(0, Math.min(100, Math.round(
    (consensusScore * 0.25) +
    (governanceScore * 0.25) +
    (strategicScore * 0.2) +
    (expansionScore * 0.1) +
    (autoImprovementScore * 0.1) +
    (Math.max(successes - failures, 0) * 5) -
    (failures * 7)
  )));

  const blockers = [];
  if ((governanceState?.blockers || []).length) blockers.push(...governanceState.blockers.map((item) => String(item)));
  if (failures > successes) blockers.push('Falhas recentes superam sucessos.');
  if ((campaignState?.releaseWindow || '').includes('guarded')) blockers.push('Campanha atual ainda está em janela protegida.');

  const approvals = [];
  if (consensusScore >= 70) approvals.push(`Consenso operacional em ${consensusScore}%`);
  if (strategicScore >= 70) approvals.push(`Revisão estratégica sólida com score ${strategicScore}`);
  if (Number(campaignState?.plannerScore || 0) >= 70) approvals.push(`Campanha de evolução pronta com score ${campaignState.plannerScore}`);
  if (autoImprovementScore >= 60) approvals.push(`Auto melhoria estável em ${autoImprovementScore}`);

  const watchpoints = [
    `Feedback: ${successes} sucesso(s) e ${failures} falha(s).`,
    `Janela de campanha: ${campaignState?.releaseWindow || 'guarded_window'}.`,
    `Modo de evolução: ${governanceState?.allowedMode || 'guided_safe'}.`
  ];

  const systemAlignment = blockers.length ? (supervisorScore >= 60 ? 'controlled' : 'guarded') : (supervisorScore >= 80 ? 'high' : 'balanced');
  const supervisionMode = blockers.length ? 'protective' : supervisorScore >= 75 ? 'accelerated' : 'balanced';
  const recommendedDirective = blockers.length
    ? 'Reduzir risco, desbloquear gargalos e manter modo controlado.'
    : campaignState?.activeCampaign?.title
      ? `Executar campanha ativa: ${campaignState.activeCampaign.title}`
      : 'Manter evolução guiada com foco na meta ativa.';

  const consultedBrains = Array.from(new Set([
    coordinatorState?.activeBrain || 'operational',
    ...(coordinatorState?.consultedBrains || []),
    'consensus_engine',
    'evolution_governance',
    'strategic_review',
    'campaign_planner'
  ].filter(Boolean))).slice(0, 8);

  bucket.supervisionMode = supervisionMode;
  bucket.systemAlignment = systemAlignment;
  bucket.supervisorScore = supervisorScore;
  bucket.recommendedDirective = recommendedDirective;
  bucket.activeCampaignId = campaignState?.activeCampaign?.id || null;
  bucket.approvals = approvals;
  bucket.blockers = blockers;
  bucket.watchpoints = watchpoints;
  bucket.consultedBrains = consultedBrains;
  bucket.lastSupervisionSummary = `Diretriz ${recommendedDirective}. Alinhamento ${systemAlignment}. Score ${supervisorScore}.`;
  bucket.runCount = Number(bucket.runCount || 0) + 1;
  bucket.updatedAt = nowIso();
  bucket.history = [{
    id: makeId('supervision-run'),
    source,
    supervisorScore,
    systemAlignment,
    summary: bucket.lastSupervisionSummary,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getGlobalSupervisorState({ userId }),
    inputs: {
      coordinatorState,
      consensusState,
      governanceState,
      strategicState,
      expansionState,
      autoImprovementState,
      feedbackState,
      campaignState
    }
  };
}
