function normalizeText(value = '') {
  return String(value || '').toLowerCase();
}

function detectSignals(text) {
  const normalized = normalizeText(text);
  return {
    urgency: /(agora|urgente|rapido|rápido|travou|erro|nao baixa|não baixa|quebrado)/.test(normalized),
    frustration: /(ruim|baguncado|bagunçado|erro|travado|sem condicoes|não funciona|nao funciona)/.test(normalized),
    precisionNeed: /(analise|certeza|validar|teste|profundamente|sem erro)/.test(normalized),
    buildMode: /(zip|arquivo|download|git|render|vercel|backend|frontend)/.test(normalized),
  };
}

function analyzeHumanContext(payload = {}, state = {}) {
  const message = payload.message || payload.text || payload.intent || state.lastHumanMessage || '';
  const signals = detectSignals(message);
  const pressureScore = [signals.urgency, signals.frustration, signals.precisionNeed].filter(Boolean).length * 25;
  const mode = signals.frustration ? 'reassurance_and_fix' : signals.urgency ? 'direct_execution' : signals.precisionNeed ? 'validated_guidance' : 'balanced_support';
  const density = signals.urgency ? 'compacta' : signals.precisionNeed ? 'detalhada_validada' : 'normal';

  return {
    ok: true,
    version: '3.4.0',
    mode,
    pressureScore: Math.min(100, pressureScore + (signals.buildMode ? 10 : 0)),
    signals,
    recommendedResponse: {
      tone: signals.frustration ? 'calmo, objetivo e corretivo' : 'claro e prático',
      density,
      firstAction: signals.buildMode ? 'validar estrutura e entregar arquivo testado' : 'organizar próximo passo com segurança',
      avoid: ['respostas genéricas', 'prometer trabalho futuro', 'alterar partes não relacionadas'],
    },
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { analyzeHumanContext };
