function buildUnifiedCognition(state = {}) {
  const crisisActive = state.crisisMode?.active || false;
  return {
    ok: true,
    mode: 'unified_cognition',
    organismState: crisisActive ? 'protected' : 'stable_growth',
    activeMission: state.state?.currentMission || 'Coordenar evolução segura da Megan OS',
    synchronizedDomains: [
      { id: 'strategy', label: 'Estratégia', status: 'online', weight: 0.21 },
      { id: 'execution', label: 'Execução', status: 'online', weight: 0.19 },
      { id: 'governance', label: 'Governança', status: 'online', weight: 0.18 },
      { id: 'economy', label: 'Economia cognitiva', status: 'online', weight: 0.15 },
      { id: 'emergency', label: 'Proteção e crise', status: crisisActive ? 'guarded' : 'standby', weight: 0.14 },
      { id: 'learning', label: 'Aprendizado', status: 'online', weight: 0.13 }
    ],
    metrics: { stability: crisisActive ? 62 : 88, coordination: state.state?.coordinationScore || 82, governanceReadiness: 91, evolutionReadiness: 86, continuityReadiness: 89 },
    generatedAt: new Date().toISOString()
  };
}
module.exports = { buildUnifiedCognition };
