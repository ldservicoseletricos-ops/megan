import { getEvolutionCampaignPlannerState, runEvolutionCampaignPlanner } from '../services/evolution-campaign-planner.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getEvolutionCampaignPlannerStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getEvolutionCampaignPlannerState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar evolution campaign planner');
  }
}

export function runEvolutionCampaignPlannerController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const source = req.body?.source ? String(req.body.source) : 'manual';
    return res.json(runEvolutionCampaignPlanner({ userId, source }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao executar evolution campaign planner');
  }
}
