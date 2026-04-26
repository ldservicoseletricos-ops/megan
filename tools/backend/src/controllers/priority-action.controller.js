function now() {
  return new Date().toISOString();
}

function generatePriority() {
  const currentPriority = 'Corrigir gargalos do chat';
  const mappedAction = 'Executar revisão do fluxo de conversa';
  return { currentPriority, mappedAction };
}

export function getPriorityActionOverviewController(req, res) {
  try {
    const { currentPriority, mappedAction } = generatePriority();
    return res.json({
      ok: true,
      version: '126.0.0',
      generatedAt: now(),
      currentPriority,
      mappedAction,
      status: 'pronta_para_acao'
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha no overview de prioridade' });
  }
}

export function runPriorityActionController(req, res) {
  try {
    const { currentPriority, mappedAction } = generatePriority();
    return res.json({
      ok: true,
      version: '126.0.0',
      generatedAt: now(),
      currentPriority,
      mappedAction,
      executed: true,
      result: `Ação executada com foco em: ${currentPriority}`
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error?.message || 'Falha ao executar ação por prioridade' });
  }
}
