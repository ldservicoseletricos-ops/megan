function scoreCommunication(context = {}, history = []) {
  const clarity = context.signals?.precisionNeed ? 92 : 84;
  const actionability = context.signals?.buildMode ? 95 : 86;
  const empathy = context.signals?.frustration ? 94 : 82;
  const noiseControl = 88;
  const score = Math.round((clarity + actionability + empathy + noiseControl) / 4);
  return {
    ok: true,
    version: '3.4.0',
    score,
    dimensions: { clarity, actionability, empathy, noiseControl },
    recommendations: [
      'começar pelo diagnóstico real',
      'entregar comandos completos quando houver alteração técnica',
      'não apagar estrutura existente sem necessidade',
      'validar download/build antes da entrega',
    ],
    recentInteractions: history.slice(0, 5),
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { scoreCommunication };
