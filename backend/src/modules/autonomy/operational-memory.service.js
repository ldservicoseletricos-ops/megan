const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'autonomy-core.json');

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const defaultState = {
  state: {
    enabled: true,
    mode: 'validated_execution',
    activeBrain: 'autonomy',
    currentMission: 'Evoluir Megan OS mantendo estabilidade e preservando a base existente.',
    currentGoal: 'Consolidar o núcleo autônomo com ciclo, decisão, validação e memória.',
    currentPriority: 'stability_and_decision_core',
    currentPriorityLabel: 'Estabilidade e núcleo de decisão',
    autonomyScore: 24,
    stabilityScore: 78,
    maturityScore: 22,
    assertivenessScore: 43,
    operationalRiskScore: 48,
    resolutionVelocityScore: 44,
    coordinationScore: 58,
    consensusScore: 66,
    strategicScore: 69,
    auditScore: 74,
    riskLevel: 'medium',
    timerEnabled: false,
    timerIntervalMs: 30000,
    continuousMode: false,
    currentMissionId: null,
    nextMissionSuggestion: null,
    lastPatch: null,
    lastPatchStatus: null,
    lastMultiPatch: null,
    lastMultiPatchStatus: null,
    lastAutoSelection: null,
    lastTimerRunAt: null,
    lastDecision: null,
    lastExecution: null,
    lastValidation: null,
    updatedAt: nowIso(),
  },
  goals: [
    {
      id: 'goal-core-1',
      title: 'Consolidar núcleo autônomo',
      summary: 'Fortalecer observação, decisão, execução segura e aprendizado contínuo.',
      type: 'system_evolution',
      status: 'active',
      priority: 'critical',
      successCriteria: [
        'Score de autonomia acima de 45',
        'Ciclos executando sem regressão estrutural',
        'Histórico de decisões e validações disponível no painel',
      ],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  policies: {
    modes: ['observer', 'supervised_autonomy', 'validated_execution', 'continuous_autonomy'],
    currentMode: 'supervised_autonomy',
    consensusRequiredActions: ['apply_multi_file_patch', 'execute_shared_goal', 'coordinated_execution'],
    allowedWithoutApproval: [
      'analyze_system',
      'prioritize_tasks',
      'generate_patch_plan',
      'organize_backlog',
      'record_learning',
      'update_internal_state',
      'simulate_decision',
    ],
    allowedWithValidation: [
      'apply_safe_local_patch',
      'update_non_critical_config',
      'prepare_build',
      'run_integrity_checks',
      'run_safe_repair',
      'run_safe_patch',
      'apply_multi_file_patch',
      'validate_multi_file_patch',
    ],
    blockedWithoutExplicitApproval: [
      'delete_critical_files',
      'modify_production_credentials',
      'drop_database_data',
      'rewrite_auth_core',
      'deploy_to_production',
      'change_billing_rules',
    ],
    updatedAt: nowIso(),
  },
  history: [],
  missions: [
    {
      id: 'mission-stability-1',
      title: 'Blindar estabilidade do núcleo autônomo',
      summary: 'Executar ciclos seguros, manter rollback pronto e reduzir falhas recorrentes.',
      status: 'active',
      priority: 'critical',
      progress: 42,
      owner: 'autonomy',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: 'mission-ui-approval-1',
      title: 'Conectar aprovação e rollback ao painel',
      summary: 'Dar visibilidade executiva para aprovar, rejeitar e reverter ações sensíveis.',
      status: 'queued',
      priority: 'high',
      progress: 8,
      owner: 'autonomy',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ],
  events: [
    {
      id: 'evt-bootstrap',
      type: 'bootstrap',
      severity: 'info',
      source: 'autonomy-core',
      title: 'Autonomy Core inicializado',
      details: 'Núcleo de observabilidade e reparo seguro pronto para operar no backend principal.',
      createdAt: nowIso(),
    },
  ],
  errors: [
    {
      id: 'err-frontend-duplication',
      eventId: 'evt-bootstrap',
      module: 'frontend-architecture',
      errorType: 'consolidation_gap',
      probableCause: 'A Megan cresceu com experiências em camadas diferentes e precisa consolidar autonomia.',
      impactLevel: 'medium',
      status: 'open',
      title: 'Consolidação estrutural ainda em andamento',
      createdAt: nowIso(),
      resolvedAt: null,
    },
  ],
  repairs: [
    {
      id: 'rep-safe-mode',
      errorId: 'err-frontend-duplication',
      actionType: 'safe_mode_guard',
      executionMode: 'automatic',
      status: 'applied',
      resultSummary: 'Fluxos premium foram integrados ao frontend principal sem desligar a base anterior.',
      createdAt: nowIso(),
    },
  ],
  approvalBacklog: [
    {
      id: 'apr-bootstrap-1',
      title: 'Validar patch local seguro',
      actionType: 'apply_safe_local_patch',
      status: 'pending',
      priority: 'high',
      reason: 'Melhoria segura pronta para avançar com validação humana opcional.',
      createdAt: nowIso(),
    },
  ],
  rollbackQueue: [],
  improvements: [
    {
      id: 'imp-autonomy-core',
      category: 'autonomy',
      title: 'Ativar ciclo contínuo de diagnóstico',
      description: 'Rodar diagnósticos periódicos e acumular memória operacional para reduzir recorrência de falhas.',
      priority: 'high',
      affectedArea: 'backend/frontend',
      status: 'ready',
      createdAt: nowIso(),
    },
  ],

  internalBrains: [
    { id: 'strategic', status: 'online', autonomyLevel: 82, load: 54 },
    { id: 'operational', status: 'online', autonomyLevel: 88, load: 63 },
    { id: 'technical', status: 'online', autonomyLevel: 84, load: 58 },
    { id: 'guardian', status: 'online', autonomyLevel: 90, load: 37 }
  ],
  delegationHistory: [],
  consensusHistory: [],
  coordinationHistory: [],
  generatedCapabilities: [],
  auditReports: [],
  fusionHistory: [],
  retirementHistory: [],
  intelligenceRebalance: null,
  marketAllocations: [],
  priorityBidding: [],
  marketHistory: [],
  memory: [
    {
      id: 'mem-ports',
      memoryKey: 'port_conflict_pattern',
      context: 'Ambientes temporários frequentemente colidem em portas padrão durante validações.',
      resolutionPattern: 'Subir backend em porta isolada de teste antes de validar endpoints.',
      confidence: 0.91,
      lastSeenAt: nowIso(),
    },
  ],
  lastDiagnosticAt: null,
  lastRepairAt: null,
};

function normalize(rawState = {}) {
  const merged = {
    ...clone(defaultState),
    ...rawState,
    state: { ...clone(defaultState.state), ...(rawState.state || {}) },
    policies: { ...clone(defaultState.policies), ...(rawState.policies || {}) },
  };

  merged.goals = Array.isArray(rawState.goals) && rawState.goals.length > 0 ? rawState.goals : clone(defaultState.goals);
  merged.history = Array.isArray(rawState.history) ? rawState.history : [];
  merged.missions = Array.isArray(rawState.missions) && rawState.missions.length > 0 ? rawState.missions : clone(defaultState.missions);
  merged.events = Array.isArray(rawState.events) ? rawState.events : clone(defaultState.events);
  merged.errors = Array.isArray(rawState.errors) ? rawState.errors : clone(defaultState.errors);
  merged.repairs = Array.isArray(rawState.repairs) ? rawState.repairs : clone(defaultState.repairs);
  merged.approvalBacklog = Array.isArray(rawState.approvalBacklog) ? rawState.approvalBacklog : clone(defaultState.approvalBacklog);
  merged.rollbackQueue = Array.isArray(rawState.rollbackQueue) ? rawState.rollbackQueue : [];
  merged.patchHistory = Array.isArray(rawState.patchHistory) ? rawState.patchHistory : [];
  merged.missionImpactHistory = Array.isArray(rawState.missionImpactHistory) ? rawState.missionImpactHistory : [];
  merged.internalBrains = Array.isArray(rawState.internalBrains) ? rawState.internalBrains : clone(defaultState.internalBrains || []);
  merged.delegationHistory = Array.isArray(rawState.delegationHistory) ? rawState.delegationHistory : [];
  merged.consensusHistory = Array.isArray(rawState.consensusHistory) ? rawState.consensusHistory : [];
  merged.coordinationHistory = Array.isArray(rawState.coordinationHistory) ? rawState.coordinationHistory : [];
  merged.fusionHistory = Array.isArray(rawState.fusionHistory) ? rawState.fusionHistory : [];
  merged.retirementHistory = Array.isArray(rawState.retirementHistory) ? rawState.retirementHistory : [];
  merged.intelligenceRebalance = rawState.intelligenceRebalance || null;
  merged.marketAllocations = Array.isArray(rawState.marketAllocations) ? rawState.marketAllocations : [];
  merged.priorityBidding = Array.isArray(rawState.priorityBidding) ? rawState.priorityBidding : [];
  merged.marketHistory = Array.isArray(rawState.marketHistory) ? rawState.marketHistory : [];
  merged.improvements = Array.isArray(rawState.improvements) ? rawState.improvements : clone(defaultState.improvements);
  merged.memory = Array.isArray(rawState.memory) ? rawState.memory : clone(defaultState.memory);
  merged.lastDiagnosticAt = rawState.lastDiagnosticAt || null;
  merged.lastRepairAt = rawState.lastRepairAt || null;
  return merged;
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
  }
}

function readState() {
  ensureFile();
  try {
    return normalize(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  } catch (_error) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
    return normalize(clone(defaultState));
  }
}

function writeState(nextState) {
  ensureFile();
  const normalized = normalize(nextState);
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2));
  return normalized;
}

function appendEntry(collectionName, entry, limit = 40) {
  const state = readState();
  state[collectionName] = [entry, ...(state[collectionName] || [])].slice(0, limit);
  writeState(state);
  return entry;
}

function updateCoreState(partial = {}) {
  const state = readState();
  state.state = {
    ...state.state,
    ...partial,
    updatedAt: nowIso(),
  };
  writeState(state);
  return state.state;
}

function setGoals(goals = []) {
  const state = readState();
  state.goals = goals;
  state.state.updatedAt = nowIso();
  writeState(state);
  return state.goals;
}

function setPolicies(policies = {}) {
  const state = readState();
  state.policies = {
    ...state.policies,
    ...policies,
    updatedAt: nowIso(),
  };
  if (policies.currentMode) state.state.mode = policies.currentMode;
  state.state.updatedAt = nowIso();
  writeState(state);
  return state.policies;
}

module.exports = {
  readState,
  writeState,
  appendEntry,
  updateCoreState,
  setGoals,
  setPolicies,
  DATA_FILE,
};
