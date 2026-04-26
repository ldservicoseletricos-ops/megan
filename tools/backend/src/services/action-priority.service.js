import { getAutoFixSuggestions } from './auto-fix.service.js';

export function getActionPriority() {
  const autoFix = getAutoFixSuggestions();
  const queue = autoFix.suggestions.map((item, index) => ({
    order: index + 1,
    id: item.id,
    title: item.problem,
    action: item.action,
    priority: item.priority,
    impact: item.impact,
  }));

  return {
    queue,
    criticalCount: queue.filter((item) => item.priority === 'alta').length,
    immediateAction: queue[0] || null,
    status: queue.length === 0 ? 'sem ações pendentes' : 'ações imediatas disponíveis',
  };
}
