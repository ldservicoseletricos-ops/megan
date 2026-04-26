const { allocateFocus } = require('./focus-allocation.service');
const { buildPriorityCalendar } = require('./priority-calendar.service');
function buildExecutiveToday(goals = [], state = {}) {
  const focus = allocateFocus(goals, state); const calendar = buildPriorityCalendar(goals, focus); const top = focus.primaryFocus;
  return { ok: true, date: new Date().toISOString().slice(0, 10), executiveMode: 'real_assistant', headline: top ? `Hoje o foco principal é: ${top.title}` : 'Hoje a prioridade é definir foco executivo.', focus, calendar: calendar.items, checklist: [{ label: 'Validar backend local', status: 'pending', priority: 'high' }, { label: 'Validar frontend local', status: 'pending', priority: 'high' }, { label: 'Registrar decisão/erro no ledger executivo', status: 'ready', priority: 'medium' }], followUps: ['Conferir se /api/health responde antes de abrir o frontend.', 'Evitar evoluir nova versão se download ou build estiver falhando.', 'Priorizar limpeza visual quando o painel começar a poluir a execução.'], updatedAt: new Date().toISOString() };
}
function buildExecutivePlan(goals = [], payload = {}, state = {}) {
  const focus = allocateFocus(goals, state);
  return { ok: true, planId: `executive-plan-${Date.now()}`, intent: payload.intent || 'organizar execução diária da Megan OS', primary: focus.primaryFocus, steps: [{ order: 1, title: 'Confirmar estado real', action: 'testar backend, frontend e download', risk: 'low' }, { order: 2, title: 'Executar prioridade humana principal', action: focus.primaryFocus?.title || 'definir foco', risk: 'medium' }, { order: 3, title: 'Registrar aprendizado', action: 'salvar decisão no ledger executivo', risk: 'low' }], focus, estimatedImpact: focus.primaryFocus?.score || 60, createdAt: new Date().toISOString() };
}
module.exports = { buildExecutiveToday, buildExecutivePlan };
