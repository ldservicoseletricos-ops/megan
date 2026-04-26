function startExternalNegotiation(payload = {}, state = {}) {
  const target = payload.target || payload.vendor || 'fornecedor externo';
  const negotiation = { id: `deal-${Date.now()}`, target, objective: payload.objective || 'melhorar custo-benefício e reduzir risco operacional', status: 'drafted', openingPosition: payload.openingPosition || 'Solicitar melhor SLA, menor lock-in e período de teste.', requestedTerms: payload.requestedTerms || ['desconto inicial', 'SLA claro', 'limite de gasto', 'cancelamento simples'], fallback: payload.fallback || 'manter fornecedor atual até validação técnica', riskGuardrails: ['não aceitar contrato longo sem teste', 'não expor credenciais', 'não migrar produção sem rollback'], createdAt: new Date().toISOString() };
  const deals = [negotiation, ...(state.deals || [])].slice(0, 30);
  return { ok: true, version: '3.5.0', negotiation, deals };
}
module.exports = { startExternalNegotiation };
