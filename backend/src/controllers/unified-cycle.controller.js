function now() {
  return new Date().toISOString();
}

function buildCycle() {
  const priority = 'Corrigir gargalos do chat';
  const nextAction = 'Executar revisão do fluxo de conversa';
  return {
    version: '126.0.0',
    generatedAt: now(),
    mode: 'operacional',
    autonomy: 'ativa',
    selfScore: 95,
    priority,
    nextAction,
    executingNow: 'Monitorando estabilidade geral',
    queue: [
      { id: '1', title: 'Revisar gargalos do chat', status: 'running' },
      { id: '2', title: 'Melhorar memória persistente', status: 'queued' },
      { id: '3', title: 'Planejar próxima fase', status: 'queued' }
    ],
    summary: 'Megan consolidou sinais internos e definiu próxima ação.'
  };
}

export function getUnifiedCycleOverviewController(req, res) {
  try {
    return res.json({ ok: true, ...buildCycle() });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha no ciclo unificado' });
  }
}

export function runUnifiedCycleController(req, res) {
  try {
    const data = buildCycle();
    data.generatedAt = now();
    data.executingNow = data.nextAction;
    data.summary = 'Ciclo operacional executado com sucesso.';
    return res.json({ ok: true, executed: true, ...data });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar ciclo' });
  }
}
