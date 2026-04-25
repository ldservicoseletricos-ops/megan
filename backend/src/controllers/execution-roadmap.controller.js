import { advanceExecutionRoadmap, failExecutionRoadmap, syncRoadmapFromGoals } from '../services/execution-roadmap.service.js';
import { registerFeedback } from '../services/feedback-loop.service.js';
import { runTacticalAdjustment } from '../services/tactical-adjuster.service.js';
import { runBrainCoordination } from '../services/brain-coordinator.service.js';
import { runConsensusEvaluation } from '../services/consensus-engine.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getExecutionRoadmapStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: syncRoadmapFromGoals({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar roadmap');
  }
}

export async function advanceExecutionRoadmapController(req, res) {
  try {
    const payload = req.body || {};
    const result = advanceExecutionRoadmap(payload);
    if (!result.ok) return jsonError(res, 400, result.error || 'Falha ao avançar roadmap');
    const userId = payload.userId || 'luiz';
    const title = result?.state?.completedActions?.slice(-1)[0]?.title || result?.state?.currentAction?.title || 'Ação concluída';
    const feedback = registerFeedback({ userId, type: 'roadmap_advance', outcome: 'success', title, reason: 'Etapa concluída no roadmap', source: 'execution_roadmap' });
    const tactical = runTacticalAdjustment({ userId, apply: true });
    const brain = await runBrainCoordination({ userId, source: 'roadmap_advance' });
    const consensus = await runConsensusEvaluation({ userId, source: 'roadmap_advance' });
    return res.json({ ...result, feedbackState: feedback.state, tacticalState: tactical.state, brainState: brain.state, consensusState: consensus.state });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao avançar roadmap');
  }
}

export async function failExecutionRoadmapController(req, res) {
  try {
    const payload = req.body || {};
    const result = failExecutionRoadmap(payload);
    if (!result.ok) return jsonError(res, 400, result.error || 'Falha ao marcar falha no roadmap');
    const userId = payload.userId || 'luiz';
    const title = result?.state?.failedActions?.slice(-1)[0]?.title || 'Ação falhada';
    const reason = payload.reason || result?.state?.failedActions?.slice(-1)[0]?.blockedReason || 'Falha registrada';
    const feedback = registerFeedback({ userId, type: 'roadmap_fail', outcome: 'failure', title, reason, source: 'execution_roadmap' });
    const tactical = runTacticalAdjustment({ userId, apply: true });
    const brain = await runBrainCoordination({ userId, source: 'roadmap_fail' });
    const consensus = await runConsensusEvaluation({ userId, source: 'roadmap_fail' });
    return res.json({ ...result, feedbackState: feedback.state, tacticalState: tactical.state, brainState: brain.state, consensusState: consensus.state });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao marcar falha no roadmap');
  }
}
