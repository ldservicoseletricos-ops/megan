function buildAlert(level, title, body, pulse = false, icon = 'alert') {
  return {
    id: `${level}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    level,
    title,
    body,
    pulse,
    icon,
  };
}

function inferGpsQuality(currentLat, currentLng) {
  if (typeof currentLat !== 'number' || typeof currentLng !== 'number') return 'weak';
  return 'good';
}

function buildDriveMode() {
  return {
    overlayEnabled: true,
    voiceProfile: 'premium_ptbr_feminina_contextual_v36',
    mapProvider: 'openstreetmap_live_hud',
    alertsMode: 'war_room_live_ops_v36',
    continuousGps: true,
    realtimeTraffic: true,
    incidentWarnings: true,
    communityAlerts: true,
    fullscreenDriving: true,
    autoNightMode: true,
    giantManeuverPanel: true,
    premiumRouteDrawing: true,
    hudDirectionMode: true,
    laneFocusPanel: true,
    routeProgressBar: true,
    dangerMeter: true,
    autopilotAssist: true,
    predictiveTraffic: true,
    smartDepartureAdvisor: true,
    frequentRoutesLearning: true,
    fatigueAlerts: true,
    fuelStopAdvisor: true,
    commandCenter: true,
    cameraTelemetryPanel: true,
    voiceCommandCenter: true,
    fleetModePreview: true,
    executiveTravelPanel: true,
    fleetAdminCommand: true,
    alertCenter: true,
    adminSummaryPanel: true,
    enterpriseCommandCloud: true,
    multiBranchCommand: true,
    corporateMasterDashboard: true,
    enterpriseControlTower: true,
    slaWatch: true,
    executiveCommandQueue: true,
  };
}

function buildTraffic(numericSpeed = 0) {
  const severity = numericSpeed >= 70 ? 'moderate' : 'heavy';
  return {
    level: severity,
    delayText: severity === 'moderate' ? '+4 min' : '+7 min',
    averageSpeedText: severity === 'moderate' ? '42 km/h' : '28 km/h',
    summary: severity === 'moderate'
      ? 'Fluxo moderado no corredor principal com retenção curta.'
      : 'Trânsito pesado no corredor principal com retenção forte.',
    color: severity === 'moderate' ? 'orange' : 'red',
    criticalZone: severity === 'moderate' ? 'Ponte estaiada em fluxo moderado' : 'Corredor principal com trecho crítico',
  };
}

function buildIncidents() {
  return [
    {
      id: 'radar-1',
      type: 'radar',
      title: 'Radar à frente',
      distanceText: '350 m',
      severity: 'warning',
      description: 'Controle de velocidade no trecho urbano.',
    },
    {
      id: 'accident-1',
      type: 'accident',
      title: 'Acidente reportado',
      distanceText: '1,2 km',
      severity: 'danger',
      description: 'Faixa esquerda parcialmente bloqueada.',
    },
    {
      id: 'community-1',
      type: 'community',
      title: 'Alerta comunitário',
      distanceText: '2,0 km',
      severity: 'info',
      description: 'Motoristas reportam lentidão no acesso lateral.',
    },
  ];
}

function buildAlternatives() {
  return [
    { id: 'alt-1', label: 'Rota principal', etaText: '14 min', gainText: 'rota estável' },
    { id: 'alt-2', label: 'Alternativa via corredor', etaText: '11 min', gainText: 'economia de 3 min' },
  ];
}

function buildVoicePrompts(destination, fastDriving) {
  return [
    `Rota ativa para ${destination}.`,
    'Atenção: radar à frente.',
    fastDriving ? 'Velocidade alta detectada. Reduza com segurança.' : 'Trânsito pesado detectado mais adiante.',
    'Nova rota mais rápida disponível.',
    'Mantenha-se na faixa central-direita para a próxima manobra.',
  ];
}

function buildGuidance() {
  return {
    laneRecommendation: 'Use a faixa central-direita para manter a melhor linha da rota.',
    nextManeuverDistance: '350 m',
    nextManeuverType: 'right',
    roadFocus: 'Av. dos Bandeirantes',
    routeStroke: 'strong_primary',
    recommendedLane: 'central-direita',
    laneDiagram: ['left', 'center', 'center-right', 'right'],
    preferredLaneIndex: 2,
  };
}

function buildRoute({ destination = 'Destino ativo', currentLat, currentLng, speedKmh = 0 }) {
  const startLabel = typeof currentLat === 'number' && typeof currentLng === 'number'
    ? `${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}`
    : 'posição atual';
  const numericSpeed = Number(speedKmh) || 0;
  const fastDriving = numericSpeed >= 80;
  const gpsQuality = inferGpsQuality(currentLat, currentLng);
  const traffic = buildTraffic(numericSpeed);
  const incidents = buildIncidents();
  const alternatives = buildAlternatives();
  const guidance = buildGuidance();
  const alertLevel = fastDriving || incidents.some((item) => item.severity === 'danger') ? 'danger' : 'warning';
  const progressPercent = numericSpeed >= 70 ? 64 : 52;
  const dangerScore = fastDriving ? 88 : traffic.level === 'heavy' ? 76 : 58;

  const visualAlerts = [
    buildAlert('danger', 'Radar à frente', 'Reduza gradualmente. Fiscalização eletrônica a 350 metros.', true, 'radar'),
    buildAlert('warning', 'Trânsito pesado', traffic.summary, true, 'traffic'),
    buildAlert('info', 'Faixa ideal', guidance.laneRecommendation, false, 'lane'),
  ];

  if (fastDriving) {
    visualAlerts.unshift(buildAlert('danger', 'Velocidade elevada', 'Trecho com atenção máxima. Reduza e mantenha distância segura.', true, 'speed'));
  }

  if (gpsQuality === 'weak') {
    visualAlerts.push(buildAlert('warning', 'GPS oscilando', 'Sinal de localização está fraco. A navegação continua em modo assistido.', false, 'gps'));
  }

  return {
    destination,
    startLabel,
    distanceText: '4.5 km',
    etaText: alternatives[1].etaText,
    autopilotSummary: {
      predictedDelayWindow: traffic.level === 'heavy' ? '+8 a +11 min' : '+3 a +5 min',
      departureAdvice: traffic.level === 'heavy' ? 'Saia 12 minutos antes para manter margem segura.' : 'Saída no horário ainda mantém boa janela de chegada.',
      frequentRouteConfidence: '84%',
      fatigueRisk: numericSpeed >= 80 ? 'moderado' : 'baixo',
      fuelSuggestion: 'Próximo posto recomendado em 2,8 km.',
      recommendedAction: traffic.level === 'heavy' ? 'Usar rota alternativa via corredor principal.' : 'Manter rota atual e monitorar tráfego.'
    },
    arrivalText: 'Chegada prevista às 12:18',
    arrivalWindowText: 'Janela estimada 12:18–12:21',
    currentRoad: guidance.roadFocus,
    laneHint: guidance.laneRecommendation,
    nextInstruction: `Em ${guidance.nextManeuverDistance}, vire à direita e siga para ${destination}.`,
    speedText: `${numericSpeed} km/h`,
    speedLimitText: '50 km/h',
    roadShield: 'SP-046',
    routeModeLabel: 'WAR ROOM LIVE OPS V36',
    alertLevel,
    gpsQuality,
    betterRouteAvailable: true,
    betterRouteText: 'Nova rota com economia estimada de 3 min via corredor principal.',
    traffic,
    incidents,
    alternatives,
    guidance,
    theme: traffic.level === 'heavy' ? 'night' : 'day',
    routePath: [
      { x: 12, y: 86 },
      { x: 24, y: 78 },
      { x: 37, y: 69 },
      { x: 49, y: 56 },
      { x: 63, y: 43 },
      { x: 79, y: 28 },
      { x: 89, y: 16 },
    ],
    maneuverBadge: 'DIREITA EM 350 M',
    laneFocusText: 'Faixa ideal: central-direita',
    trafficPanelTone: traffic.level === 'heavy' ? 'danger' : 'warning',
    communityAlerts: incidents.filter((item) => item.type === 'community'),
    voicePrompts: buildVoicePrompts(destination, fastDriving),
    visualAlerts,
    progressPercent,
    progressLabel: `${progressPercent}% da rota concluída`,
    dangerScore,
    dangerLabel: dangerScore >= 80 ? 'atenção máxima' : dangerScore >= 65 ? 'atenção elevada' : 'atenção moderada',
    laneGuidance: {
      lanes: guidance.laneDiagram,
      recommendedIndex: guidance.preferredLaneIndex,
      note: 'Prepare-se para posicionar o veículo na faixa recomendada.',
    },
    hudMetrics: [
      { id: 'speed-limit', label: 'Limite', value: '50 km/h' },
      { id: 'hazard', label: 'Perigo', value: `${dangerScore}%` },
      { id: 'lane', label: 'Faixa', value: 'C-DIR' },
      { id: 'eta-window', label: 'Janela', value: '12:18' },
    ],
    commandCenter: {
      executiveMode: 'ativo',
      cameraStatus: gpsQuality === 'weak' ? 'assistido' : 'ativo',
      telemetriaStatus: fastDriving ? 'alerta' : 'normal',
      voiceCommandExamples: ['Megan, mostrar câmeras', 'Megan, abrir painel executivo', 'Megan, focar riscos'],
      fleetSummary: { vehiclesOnline: 1, criticalAlerts: incidents.filter((item) => item.severity === 'danger').length, routeHealth: traffic.level === 'heavy' ? 'instável' : 'estável' },
      tripScore: fastDriving ? 82 : 94,
      travelModeLabel: 'Executivo premium',
    },
    telemetryPro: {
      averageSpeed: traffic.level === 'heavy' ? '31 km/h' : '46 km/h',
      stoppedTime: traffic.level === 'heavy' ? '6 min' : '2 min',
      tripRisk: dangerScore >= 80 ? 'alto' : dangerScore >= 65 ? 'médio' : 'baixo',
      efficiency: traffic.level === 'heavy' ? '78%' : '91%',
    },
    cameraSafety: {
      driverState: fastDriving ? 'atenção reforçada' : 'normal',
      frontalRisk: incidents.some((item) => item.severity === 'danger') ? 'monitorado' : 'baixo',
      fatigueWarning: numericSpeed >= 80 ? 'pausa recomendada em 25 min' : 'sem alerta crítico',
    },
    enterprisePanel: {
      managerMode: 'ativo',
      operationalSummary: traffic.level === 'heavy' ? 'Operação com retenção moderada e risco elevado.' : 'Operação estável com boa performance.',
      tripScoreLabel: fastDriving ? 'score 82/100' : 'score 94/100',
      executiveStatus: dangerScore >= 80 ? 'atenção executiva' : 'estável',
    },
    fleetAdmin: {
      commandCenter: 'ativo',
      onlineVehicles: 4,
      offlineVehicles: 1,
      highRiskVehicles: dangerScore >= 80 ? 1 : 0,
      dailyOperationalSummary: traffic.level === 'heavy' ? 'Frota com retenção no corredor principal e atenção operacional.' : 'Frota operando dentro da meta e sem criticidade alta.',
      priorityVehicles: ['Megan-01', 'Megan-02'],
      adminRecommendation: traffic.level === 'heavy' ? 'Redistribuir prioridade para rota sul e reduzir exposição no trecho crítico.' : 'Manter distribuição atual e acompanhar horário de pico.',
    },

    fleetAi: {
      vehiclesOnline: 4,
      activeTrips: 3,
      routeHistoryToday: 18,
      centralAlerts: incidents.length,
      webAdminStatus: 'painel web sincronizado',
      operationsMode: traffic.level === 'heavy' ? 'atenção operacional' : 'operação estável',
      nextRecommendation: traffic.level === 'heavy' ? 'Redistribuir veículos para rota alternativa sul.' : 'Manter distribuição atual e monitorar picos.',
      fleetScore: fastDriving ? 81 : 95,
    },
    centralizedAlerts: [
      { id: 'central-1', title: 'Frota monitorada', body: '4 veículos online e 3 viagens em andamento.', level: 'info' },
      { id: 'central-2', title: 'Painel web admin', body: 'Resumo executivo sincronizado em tempo real.', level: 'info' },
      { id: 'central-3', title: 'Risco operacional', body: traffic.level === 'heavy' ? 'Retenção moderada com impacto operacional.' : 'Operação dentro da meta esperada.', level: traffic.level === 'heavy' ? 'warning' : 'info' },
    ],

    enterpriseLiveOps: {
      tenant: 'Megan Enterprise',
      liveStatus: 'online',
      activeManagers: 3,
      activeUsers: 12,
      permissionsMode: 'granular',
      reportAutomation: '14 relatórios hoje',
      centralOpsNote: traffic.level === 'heavy' ? 'Priorizar equipe de operação no corredor principal.' : 'Operação empresarial dentro do SLA.',
    },
    multiUserAccess: [
      { id: 'mgr-1', role: 'Gestor master', status: 'online' },
      { id: 'mgr-2', role: 'Gestor operacional', status: 'online' },
      { id: 'ana-1', role: 'Analista', status: 'monitorando' },
    ],
    routeHistory: [
      { id: 'hist-1', label: 'Casa → Trabalho', etaText: '26 min', score: '94/100' },
      { id: 'hist-2', label: 'Trabalho → Cliente', etaText: '18 min', score: '91/100' },
      { id: 'hist-3', label: 'Cliente → Base', etaText: '22 min', score: '89/100' },
    ],
    controlTower: {
      globalVisibility: 'ativa',
      executiveSla: traffic.level === 'heavy' ? '92%' : '97%',
      commandQueue: [
        { id: 'cmd-1', label: 'Priorizar corredor sul', status: 'executando' },
        { id: 'cmd-2', label: 'Redistribuir equipe RJ', status: 'em análise' },
        { id: 'cmd-3', label: 'Conferir SLA São Paulo', status: 'ok' },
      ],
      matrixStatus: 'matriz sincronizada',
      activeRegions: 4,
      criticalUnits: traffic.level === 'heavy' ? 2 : 1,
      executiveNote: traffic.level === 'heavy' ? 'Torre de controle recomenda mitigação imediata no corredor principal.' : 'Torre de controle com operação estável e SLAs preservados.',
    },

    warRoom: {
      commandStatus: 'ativo',
      severity: dangerScore >= 80 ? 'crítica' : dangerScore >= 65 ? 'alta' : 'moderada',
      priorityOfDay: traffic.level === 'heavy' ? 'Mitigar corredor principal e preservar SLA executivo.' : 'Sustentar meta operacional sem escalonamento crítico.',
      severeIncidents: incidents.filter((item) => item.severity === 'danger').length,
      responseTime: traffic.level === 'heavy' ? '04m 20s' : '02m 10s',
      operationalScore: fastDriving ? '86/100' : '94/100',
      criticalRegions: traffic.level === 'heavy' ? ['São Paulo Sul', 'Corredor principal'] : ['São Paulo Sul'],
      urgentQueue: [
        { id: 'wr-1', label: 'Acionar mitigação do corredor principal', status: 'executando' },
        { id: 'wr-2', label: 'Escalonar alerta de radar para supervisão', status: 'pendente' },
        { id: 'wr-3', label: 'Confirmar meta horária da operação', status: 'ok' },
      ],
      escalationMode: 'automático',
      liveGoals: [
        { id: 'goal-1', label: 'SLA executivo', value: traffic.level === 'heavy' ? '92%' : '97%' },
        { id: 'goal-2', label: 'Tempo médio resposta', value: traffic.level === 'heavy' ? '04m 20s' : '02m 10s' },
        { id: 'goal-3', label: 'Incidentes severos', value: String(incidents.filter((item) => item.severity === 'danger').length) },
      ],
    },
    steps: [
      'Siga em frente por 350 metros.',
      'Mantenha-se na faixa central-direita.',
      'Vire à direita na próxima avenida.',
      'Continue por 2,1 km com atenção ao radar.',
      'Chegada ao destino.',
    ],
  };
}


function buildEnterpriseLiveOps() {
  return {
    ok: true,
    version: '36.0.0',
    generatedAt: new Date().toISOString(),
    liveOps: {
      tenant: 'Megan Enterprise',
      operationsStatus: 'online',
      managersOnline: 3,
      analystsOnline: 2,
      activePermissions: ['gestor_master', 'gestor_operacional', 'analista'],
      reportQueue: { pending: 2, generatedToday: 14, automated: true },
      alertsCenter: {
        critical: 1,
        warning: 3,
        info: 6,
      },
      dashboards: [
        'fleet_admin',
        'live_alerts',
        'daily_reports',
        'permissions_control',
      ],
      recommendedAction: 'Manter gestor master no corredor sul e revisar alertas críticos da manhã.',
    },
  };
}
function buildGovernanceStatus() {
  return {
    ok: true,
    version: '36.0.0',
    generatedAt: new Date().toISOString(),
    governance: {
      dashboardMode: 'web_admin_governance',
      loginVisual: 'corporate',
      accessProfiles: [
        { id: 'gov-1', role: 'Administrador master', status: 'online' },
        { id: 'gov-2', role: 'Gestor executivo', status: 'online' },
        { id: 'gov-3', role: 'Auditoria', status: 'monitorando' },
      ],
      auditTrail: { actionsToday: 42, criticalEvents: 1, integrity: 'ok' },
      compliance: { operational: 'ok', permissions: 'granular', review: 'sem pendências críticas' },
      executiveKpis: { activeUsers: 12, incidentsToday: 4, reportsReady: 16 },
      recommendedAction: 'Revisar eventos críticos da manhã e manter monitoramento executivo ativo.',
    },
  };
}

function buildTrafficFeed() {
  return {
    ok: true,
    version: '36.0.0',
    generatedAt: new Date().toISOString(),
    feed: {
      traffic: buildTraffic(35),
      incidents: buildIncidents(),
      alternatives: buildAlternatives(),
      guidance: buildGuidance(),
    },
  };
}


function buildEnterpriseCommandCloud() {
  return {
    ok: true,
    version: '36.0.0',
    cloud: {
      globalStatus: 'online',
      commandMode: 'war_room_live_ops_v36',
      totalBranches: 6,
      activeBranches: 5,
      branchGoals: [
        { id: 'sp', name: 'São Paulo', target: '98 entregas', progress: '91%' },
        { id: 'rj', name: 'Rio de Janeiro', target: '76 entregas', progress: '87%' },
        { id: 'bh', name: 'Belo Horizonte', target: '44 entregas', progress: '94%' },
      ],
      corporateAlerts: {
        critical: 2,
        warning: 5,
        info: 11,
      },
      globalComparison: {
        bestUnit: 'São Paulo',
        bestScore: '96/100',
        riskUnit: 'Rio de Janeiro',
        riskScore: '78/100',
      },
      masterNotes: [
        'Filial São Paulo acima da meta operacional.',
        'Rio de Janeiro requer atenção em incidentes críticos.',
        'Belo Horizonte lidera em eficiência de rota.',
      ],
    },
  };
}


function buildControlTowerStatus() {
  return {
    ok: true,
    version: '36.0.0',
    generatedAt: new Date().toISOString(),
    controlTower: {
      globalVisibility: 'ativa',
      headquarters: 'São Paulo',
      regionsOnline: 4,
      executiveSla: '97%',
      criticalUnits: 1,
      commandQueue: {
        total: 7,
        executing: 2,
        pending: 3,
        completedToday: 18,
      },
      executiveBoard: {
        bestRegion: 'São Paulo',
        riskRegion: 'Rio de Janeiro',
        liveKpi: '94/100',
      },
      recommendedAction: 'Manter torre executiva ativa e reduzir exposição operacional nas unidades com maior criticidade.',
    },
  };
}



function buildWarRoomStatus() {
  return {
    ok: true,
    version: '36.0.0',
    generatedAt: new Date().toISOString(),
    warRoom: {
      commandStatus: 'ativo',
      escalationMode: 'automático',
      priorityOfDay: 'Proteger SLA executivo e reduzir criticidade do corredor principal.',
      severeIncidents: 2,
      responseTime: '03m 40s',
      operationalScore: '93/100',
      criticalRegions: ['São Paulo Sul', 'Corredor principal'],
      urgentQueue: {
        total: 6,
        executing: 2,
        pending: 2,
        resolvedToday: 14,
      },
      liveGoals: [
        { id: 'goal-1', label: 'SLA executivo', value: '96%' },
        { id: 'goal-2', label: 'Tempo médio resposta', value: '03m 40s' },
        { id: 'goal-3', label: 'Incidentes severos', value: '2' },
      ],
      recommendedAction: 'Escalonar equipe do corredor principal e manter sala de crise monitorando metas em tempo real.',
    },
  };
}

module.exports = { buildRoute, buildDriveMode, buildTrafficFeed, buildEnterpriseLiveOps, buildGovernanceStatus, buildEnterpriseCommandCloud, buildControlTowerStatus, buildWarRoomStatus };
