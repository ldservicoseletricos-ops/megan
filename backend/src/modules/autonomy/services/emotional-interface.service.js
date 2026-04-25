function buildInterfaceProfile(context = {}, state = {}) {
  const pressure = context.pressureScore || 0;
  const mode = context.mode || 'balanced_support';
  const profile = {
    ok: true,
    version: '3.4.0',
    interfaceMode: pressure >= 60 ? 'focus_repair_mode' : mode === 'direct_execution' ? 'fast_action_mode' : 'premium_guided_mode',
    visualPriority: pressure >= 60 ? 'mostrar erro, causa e correção primeiro' : 'mostrar visão geral e próximos passos',
    responseStyle: {
      tone: context.recommendedResponse?.tone || 'claro e prático',
      density: context.recommendedResponse?.density || 'normal',
      structure: pressure >= 60 ? 'diagnóstico → correção → teste' : 'objetivo → ação → validação',
    },
    activeHumanState: {
      urgency: Boolean(context.signals?.urgency),
      frustration: Boolean(context.signals?.frustration),
      needsValidation: Boolean(context.signals?.precisionNeed),
    },
    updatedAt: new Date().toISOString(),
  };
  return profile;
}

function adaptInterface(payload = {}, context = {}, state = {}) {
  const profile = buildInterfaceProfile(context, state);
  const adaptation = {
    ok: true,
    version: '3.4.0',
    profile,
    applied: {
      compactErrors: true,
      prioritizeDownloadValidation: Boolean(context.signals?.buildMode),
      reduceVisualNoise: true,
      keepExistingStructure: true,
    },
    requestedBy: payload.source || 'autonomy_center',
    updatedAt: new Date().toISOString(),
  };
  return adaptation;
}

module.exports = { buildInterfaceProfile, adaptInterface };
