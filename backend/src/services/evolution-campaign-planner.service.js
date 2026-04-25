import fs from 'fs';
import path from 'path';
import { resolveDataPath } from '../utils/data-path.js';
import { getGoalsState } from './goal-decomposer.service.js';
import { getExecutionRoadmapState } from './execution-roadmap.service.js';
import { getStrategicReviewState } from './strategic-review.service.js';
import { getControlledExpansionState } from './controlled-expansion.service.js';
import { getImprovementProposalsState } from './improvement-proposal.service.js';
import { getEvolutionGovernanceState } from './evolution-governance.service.js';
import { getEvolutionModeState } from './evolution-mode.service.js';

const DATA_DIR = resolveDataPath();
const STATE_PATH = path.join(DATA_DIR, 'evolution-campaign-planner-state.json');

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
function makeId(prefix='campaign') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function ensureUserBucket(state, userId='luiz') {
  if (!state.users[userId]) {
    state.users[userId] = {
      userId,
      activeCampaign: null,
      queuedCampaigns: [],
      suggestedCampaigns: [],
      campaignBudget: 0,
      releaseWindow: 'guarded',
      planningMode: 'controlled',
      plannerScore: 0,
      lastCampaignSummary: 'Nenhuma campanha de evolução planejada ainda.',
      runCount: 0,
      history: [],
      updatedAt: nowIso(),
      createdAt: nowIso()
    };
  }
  return state.users[userId];
}

function buildTracks({ goalsState, roadmapState, proposalsState, expansionState }) {
  const tracks = [];
  const tasks = goalsState?.activeGoal?.tasks || [];
  if (tasks.length) {
    tracks.push({
      id: 'core_goal_delivery',
      label: 'Entrega da meta ativa',
      owner: 'goal_decomposer',
      status: 'active',
      items: tasks.slice(0, 5).map((task) => task?.title || task?.label || 'Subtarefa')
    });
  }
  const nextAction = roadmapState?.nextAction?.title || roadmapState?.currentAction?.title;
  if (nextAction) {
    tracks.push({
      id: 'execution_roadmap',
      label: 'Execução imediata',
      owner: 'execution_roadmap',
      status: 'active',
      items: [nextAction]
    });
  }
  const safeProposals = (proposalsState?.proposals || []).filter((item) => item?.safeToApply);
  if (safeProposals.length) {
    tracks.push({
      id: 'safe_improvement',
      label: 'Melhoria segura',
      owner: 'auto_improvement',
      status: 'ready',
      items: safeProposals.slice(0, 4).map((item) => item?.title || item?.summary || 'Melhoria segura')
    });
  }
  const approved = expansionState?.approvedExpansions || [];
  if (approved.length) {
    tracks.push({
      id: 'controlled_expansion',
      label: 'Expansão controlada',
      owner: 'controlled_expansion',
      status: 'conditional',
      items: approved.slice(0, 4).map((item) => item?.label || item?.reason || item?.laneId || 'Expansão aprovada')
    });
  }
  return tracks.slice(0, 4);
}

function buildSuggestedCampaigns({ goalsState, strategicState, proposalsState }) {
  const campaigns = [];
  if (goalsState?.activeGoal?.title) {
    campaigns.push({
      id: makeId('campaign'),
      title: `Campanha foco: ${goalsState.activeGoal.title}`,
      objective: 'Concluir a meta ativa com menor risco operacional.',
      phase: 'execution_focus',
      priority: 'high'
    });
  }
  const safeProposals = (proposalsState?.proposals || []).filter((item) => item?.safeToApply).length;
  if (safeProposals > 0) {
    campaigns.push({
      id: makeId('campaign'),
      title: `Campanha de melhoria segura (${safeProposals})`,
      objective: 'Aplicar ajustes seguros sem degradar a base estável.',
      phase: 'safe_improvement',
      priority: safeProposals > 2 ? 'high' : 'medium'
    });
  }
  if ((strategicState?.opportunities || []).length) {
    campaigns.push({
      id: makeId('campaign'),
      title: 'Campanha de oportunidade estratégica',
      objective: String(strategicState.opportunities[0] || 'Consolidar oportunidade estratégica atual'),
      phase: 'strategic_window',
      priority: 'medium'
    });
  }
  return campaigns.slice(0, 5);
}

export function getEvolutionCampaignPlannerState({ userId='luiz' } = {}) {
  const state = safeRead();
  return clone(ensureUserBucket(state, String(userId || 'luiz')));
}

export function runEvolutionCampaignPlanner({ userId='luiz', source='manual' } = {}) {
  const state = safeRead();
  const bucket = ensureUserBucket(state, String(userId || 'luiz'));

  const goalsState = getGoalsState({ userId });
  const roadmapState = getExecutionRoadmapState({ userId });
  const strategicState = getStrategicReviewState({ userId });
  const expansionState = getControlledExpansionState({ userId });
  const proposalsState = getImprovementProposalsState({ userId });
  const governanceState = getEvolutionGovernanceState({ userId });
  const modeState = getEvolutionModeState({ userId });

  const tracks = buildTracks({ goalsState, roadmapState, proposalsState, expansionState });
  const suggestedCampaigns = buildSuggestedCampaigns({ goalsState, strategicState, proposalsState });
  const blocked = Number((roadmapState?.blockedActions || []).length || 0);
  const reviewScore = Number(strategicState?.reviewScore || 0);
  const expansionScore = Number(expansionState?.expansionScore || 0);
  const governanceScore = Number(governanceState?.governanceScore || 0);

  const plannerScore = Math.max(0, Math.min(100, Math.round((reviewScore * 0.4) + (expansionScore * 0.25) + (governanceScore * 0.2) + (tracks.length * 5) - (blocked * 8))));
  const planningMode = modeState?.selectedMode === 'aggressive' ? 'aggressive' : modeState?.selectedMode === 'supervised' ? 'supervised' : 'controlled';
  const releaseWindow = plannerScore >= 80 ? 'release_ready' : plannerScore >= 60 ? 'controlled_window' : 'guarded_window';
  const campaignBudget = Math.max(1, Math.min(5, Math.ceil(plannerScore / 20)));

  const primary = suggestedCampaigns[0] || {
    id: makeId('campaign'),
    title: 'Campanha de consolidação',
    objective: 'Consolidar base atual antes de expandir.',
    phase: 'stabilization',
    priority: 'medium'
  };

  const activeCampaign = {
    id: primary.id,
    title: primary.title,
    objective: primary.objective,
    phase: primary.phase,
    priority: primary.priority,
    progress: Number(goalsState?.activeGoal?.progress || roadmapState?.progress || 0),
    releaseWindow,
    tracks,
    status: releaseWindow === 'release_ready' ? 'ready' : releaseWindow === 'controlled_window' ? 'controlled' : 'guarded',
    createdAt: bucket.activeCampaign?.createdAt || nowIso(),
    updatedAt: nowIso()
  };

  bucket.activeCampaign = activeCampaign;
  bucket.queuedCampaigns = suggestedCampaigns.slice(1);
  bucket.suggestedCampaigns = suggestedCampaigns;
  bucket.campaignBudget = campaignBudget;
  bucket.releaseWindow = releaseWindow;
  bucket.planningMode = planningMode;
  bucket.plannerScore = plannerScore;
  bucket.lastCampaignSummary = `Campanha ativa ${activeCampaign.title}. Janela ${releaseWindow}. Score ${plannerScore}. Trilhas ${tracks.length}.`;
  bucket.runCount = Number(bucket.runCount || 0) + 1;
  bucket.updatedAt = nowIso();
  bucket.history = [{
    id: makeId('campaign-run'),
    source,
    title: activeCampaign.title,
    plannerScore,
    releaseWindow,
    createdAt: nowIso()
  }, ...(bucket.history || [])].slice(0, 20);

  state.updatedAt = nowIso();
  safeWrite(state);

  return {
    ok: true,
    state: getEvolutionCampaignPlannerState({ userId }),
    inputs: {
      goalsState,
      roadmapState,
      strategicState,
      expansionState,
      proposalsState,
      governanceState,
      modeState
    }
  };
}
