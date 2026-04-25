import { generateImprovementProposals, getImprovementProposalsState, markImprovementProposalApplied } from '../services/improvement-proposal.service.js';

function jsonError(res, status, message) {
  return res.status(status).json({ ok: false, error: message });
}

export function getImprovementProposalsStateController(req, res) {
  try {
    const userId = String(req.query?.userId || 'luiz');
    return res.json({ ok: true, state: getImprovementProposalsState({ userId }) });
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao carregar improvement proposals');
  }
}

export function generateImprovementProposalsController(req, res) {
  try {
    const userId = String(req.body?.userId || req.query?.userId || 'luiz');
    return res.json(generateImprovementProposals({ userId }));
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao gerar improvement proposals');
  }
}

export function applyImprovementProposalController(req, res) {
  try {
    const userId = String(req.body?.userId || 'luiz');
    const proposalId = String(req.body?.proposalId || '');
    const result = markImprovementProposalApplied({ userId, proposalId });
    if (!result.ok) return jsonError(res, 400, result.error || 'Falha ao aplicar proposta');
    return res.json(result);
  } catch (error) {
    return jsonError(res, 500, error?.message || 'Falha ao aplicar proposta');
  }
}
