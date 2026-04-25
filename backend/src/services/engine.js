function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

const state = {
  cycles: 0,
  readiness: 74,
  memory: 69,
  critic: 66,
  regression: 54,
  growthHealth: 52,
  financeHealth: 48,
  priority: 'growth',
  strategy: 'controlled-expansion',
  mrr: 320,
  experiments: [
    { id: 'pricing_v1', score: 61, status: 'running', uplift: 4 },
    { id: 'retention_flow', score: 73, status: 'running', uplift: 7 },
    { id: 'onboarding_v2', score: 68, status: 'queued', uplift: 5 }
  ],
  decisions: [],
  logs: []
};

function runGrowthCycle() {
  state.cycles += 1;

  state.memory = clamp(state.memory + (state.cycles % 4 === 0 ? 0 : 1), 45, 90);
  state.critic = clamp(state.critic + (state.cycles % 3 === 0 ? 0 : 1), 40, 88);
  state.regression = clamp(state.regression + 1, 35, 84);
  state.growthHealth = clamp(state.growthHealth + 2, 35, 86);
  state.financeHealth = clamp(state.financeHealth + 2, 30, 83);

  state.experiments = state.experiments.map((item, idx) => {
    const drift = (state.cycles % (idx + 2)) + 1;
    const score = clamp(item.score + drift, 40, 92);
    const uplift = clamp(item.uplift + (idx === 1 ? 1 : 0), 1, 18);
    const status = score > 82 ? 'winning' : (item.status === 'queued' && score > 70 ? 'running' : item.status);
    return { ...item, score, uplift, status };
  });

  const winning = [...state.experiments].sort((a, b) => b.score - a.score)[0];
  state.strategy =
    winning.id === 'retention_flow'
      ? 'retention-max'
      : winning.id === 'pricing_v1'
        ? 'revenue-focus'
        : 'controlled-expansion';
  state.priority = state.growthHealth <= state.financeHealth ? 'growth' : 'finance';

  state.mrr = clamp(state.mrr + winning.uplift + (state.cycles % 3), 0, 50000);
  state.readiness = Math.round(
    (state.memory + state.critic + state.regression + state.growthHealth + state.financeHealth) / 5
  );

  const timestamp = new Date().toISOString();
  state.decisions.unshift({
    id: Date.now(),
    title: 'Ciclo autônomo de crescimento executado',
    detail: `Estratégia ${state.strategy} | prioridade ${state.priority} | MRR ${state.mrr}`,
    winner: winning.id,
    uplift: winning.uplift,
    score: winning.score,
    time: timestamp
  });
  state.decisions = state.decisions.slice(0, 20);

  state.logs.unshift({
    id: Date.now() + 1,
    title: 'Growth cycle atualizado',
    detail: `Experimento vencedor ${winning.id} com score ${winning.score}.`,
    time: timestamp
  });
  state.logs = state.logs.slice(0, 40);

  return state;
}

function get() {
  return state;
}

module.exports = { runGrowthCycle, get };
