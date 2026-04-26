const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'megan-voice-state.json');

function nowIso() { return new Date().toISOString(); }
function ensureDataDir() { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); }
function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }

function buildInitialState() {
  const now = nowIso();
  return {
    updatedAt: now,
    version: '5.4.0',
    title: 'Megan OS 5.4 — MEGAN VOICE',
    focus: 'Assistente por voz total para celular, carro, casa e escritório com wake word Ok Megan.',
    mode: 'voice_total_assistant',
    readiness: {
      score: 94,
      status: 'pronto_para_comandos_de_voz_supervisionados',
      safety: 'ações críticas exigem confirmação explícita antes de executar',
      nextRelease: '5.5 execução multimodal com voz, visão, localização e automações conectadas'
    },
    wakeWord: {
      phrase: 'Ok Megan',
      enabled: true,
      sensitivity: 'média',
      lastDetectedAt: null,
      status: 'aguardando_chamada'
    },
    voiceCore: {
      listening: false,
      assistantStatus: 'online',
      activeContext: 'geral',
      language: 'pt-BR',
      responseVoice: 'feminina_natural',
      continuousUse: 'supervisionado',
      privacy: 'microfone controlado pelo usuário e pelo sistema operacional'
    },
    environments: [
      { id: 'mobile', name: 'Celular', status: 'ativo', capabilities: ['wake_word', 'comandos_rapidos', 'lembretes', 'agenda', 'localizacao'], riskLevel: 'médio' },
      { id: 'car', name: 'Carro', status: 'preparado', capabilities: ['navegacao', 'mensagens_por_voz', 'alertas', 'modo_maos_livres'], riskLevel: 'alto' },
      { id: 'home', name: 'Casa', status: 'preparado', capabilities: ['rotina', 'tarefas', 'lembretes', 'controle_contextual'], riskLevel: 'baixo' },
      { id: 'office', name: 'Escritório', status: 'preparado', capabilities: ['reunioes', 'email', 'crm', 'produtividade', 'resumos'], riskLevel: 'médio' }
    ],
    devices: [
      { id: 'device-001', name: 'Celular principal', type: 'mobile', platform: 'pwa_android_ios', status: 'conectado', lastSeenAt: now },
      { id: 'device-002', name: 'Modo carro', type: 'car', platform: 'bluetooth_android_auto_carplay_ready', status: 'preparado', lastSeenAt: now }
    ],
    commands: [
      { id: 'cmd-001', phrase: 'Ok Megan, organizar meu dia', intent: 'daily_planning', environment: 'mobile', safety: 'normal', status: 'pronto' },
      { id: 'cmd-002', phrase: 'Ok Megan, iniciar navegação', intent: 'navigation_start', environment: 'car', safety: 'confirmacao', status: 'pronto' },
      { id: 'cmd-003', phrase: 'Ok Megan, responder cliente', intent: 'customer_reply', environment: 'office', safety: 'confirmacao', status: 'pronto' },
      { id: 'cmd-004', phrase: 'Ok Megan, lembrar pagamento', intent: 'reminder_finance', environment: 'home', safety: 'normal', status: 'pronto' }
    ],
    activeSession: {
      id: 'voice-session-001', environment: 'mobile', startedAt: null,
      state: 'idle', lastCommand: null,
      pendingConfirmation: null
    },
    safetyQueue: [],
    activity: [
      { id: 'voice-act-001', type: 'voice_boot', title: 'Megan Voice 5.4 iniciado', detail: 'Wake word, celular, carro, casa e escritório preparados.', createdAt: now }
    ]
  };
}

function ensureState() {
  ensureDataDir();
  if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify(buildInitialState(), null, 2));
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  state.updatedAt = nowIso();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function pushActivity(state, type, title, detail) {
  state.activity.unshift({ id: makeId('voice-act'), type, title, detail, createdAt: nowIso() });
  state.activity = state.activity.slice(0, 80);
}

function getDashboard() {
  const state = ensureState();
  const activeDevices = state.devices.filter((device) => device.status === 'conectado').length;
  const preparedEnvironments = state.environments.filter((item) => ['ativo', 'preparado'].includes(item.status)).length;
  return {
    ok: true,
    ...state,
    summary: {
      activeDevices,
      preparedEnvironments,
      availableCommands: state.commands.length,
      pendingConfirmations: state.safetyQueue.length,
      wakeWord: state.wakeWord.phrase,
      voiceStatus: state.voiceCore.assistantStatus
    }
  };
}

function wake(payload = {}) {
  const state = ensureState();
  const environment = payload.environment || 'mobile';
  state.wakeWord.lastDetectedAt = nowIso();
  state.wakeWord.status = 'chamada_detectada';
  state.voiceCore.listening = true;
  state.voiceCore.activeContext = environment;
  state.activeSession = {
    id: makeId('voice-session'),
    environment,
    startedAt: nowIso(),
    state: 'listening',
    lastCommand: null,
    pendingConfirmation: null
  };
  pushActivity(state, 'wake_word_detected', 'Wake word detectada', `Frase "${state.wakeWord.phrase}" detectada no ambiente ${environment}.`);
  return { ok: true, message: 'Estou ouvindo, Luiz.', dashboard: saveState(state) };
}

function detectSafety(intent = '', environment = '') {
  const riskyIntents = ['navigation_start', 'payment_send', 'deploy_publish', 'customer_reply', 'email_send', 'contract_send'];
  if (environment === 'car') return 'confirmacao';
  if (riskyIntents.includes(intent)) return 'confirmacao';
  return 'normal';
}

function executeVoiceCommand(payload = {}) {
  const state = ensureState();
  const phrase = payload.phrase || 'Ok Megan, executar comando';
  const environment = payload.environment || state.activeSession.environment || 'mobile';
  const intent = payload.intent || 'general_assistant';
  const safety = payload.safety || detectSafety(intent, environment);
  const command = {
    id: makeId('cmd'),
    phrase,
    intent,
    environment,
    safety,
    status: safety === 'confirmacao' ? 'aguardando_confirmacao' : 'executado',
    createdAt: nowIso()
  };
  state.commands.unshift(command);
  state.commands = state.commands.slice(0, 100);
  state.activeSession.lastCommand = command;
  state.voiceCore.listening = false;

  if (safety === 'confirmacao') {
    const confirmation = {
      id: makeId('confirm'),
      commandId: command.id,
      phrase,
      intent,
      environment,
      reason: 'Ação sensível detectada. Confirme por voz ou toque antes de executar.',
      status: 'pendente',
      createdAt: nowIso()
    };
    state.safetyQueue.unshift(confirmation);
    state.activeSession.pendingConfirmation = confirmation;
    pushActivity(state, 'voice_command_pending_confirmation', 'Comando aguardando confirmação', `${phrase} precisa de confirmação antes de executar.`);
    return { ok: true, requiresConfirmation: true, command, confirmation, dashboard: saveState(state) };
  }

  pushActivity(state, 'voice_command_executed', 'Comando de voz executado', `${phrase} executado no ambiente ${environment}.`);
  return { ok: true, requiresConfirmation: false, command, result: buildExecutionResult(command), dashboard: saveState(state) };
}

function buildExecutionResult(command) {
  const actions = {
    daily_planning: 'Agenda, foco e prioridades do dia organizados.',
    reminder_finance: 'Lembrete financeiro criado e colocado na lista do dia.',
    general_assistant: 'Comando interpretado e registrado para execução assistida.',
    productivity: 'Bloco de produtividade criado.',
    navigation_start: 'Navegação preparada para iniciar após confirmação.',
    customer_reply: 'Resposta ao cliente preparada para revisão.'
  };
  return { status: 'done', action: actions[command.intent] || 'Ação de voz registrada e encaminhada para o módulo responsável.' };
}

function registerDevice(payload = {}) {
  const state = ensureState();
  const device = {
    id: payload.id || makeId('device'),
    name: payload.name || 'Novo dispositivo Megan Voice',
    type: payload.type || 'mobile',
    platform: payload.platform || 'pwa_android_ios',
    status: payload.status || 'conectado',
    lastSeenAt: nowIso()
  };
  const index = state.devices.findIndex((item) => item.id === device.id);
  if (index >= 0) state.devices[index] = { ...state.devices[index], ...device };
  else state.devices.unshift(device);
  pushActivity(state, 'voice_device_registered', 'Dispositivo registrado', `${device.name} conectado ao Megan Voice.`);
  return { ok: true, device, dashboard: saveState(state) };
}

function setMode(payload = {}) {
  const state = ensureState();
  const environment = payload.environment || 'mobile';
  const found = state.environments.find((item) => item.id === environment);
  if (found) found.status = payload.status || 'ativo';
  state.voiceCore.activeContext = environment;
  state.activeSession.environment = environment;
  pushActivity(state, 'voice_mode_changed', 'Modo de voz alterado', `Ambiente ativo: ${environment}.`);
  return { ok: true, environment: found || { id: environment, status: 'ativo' }, dashboard: saveState(state) };
}

function confirmSafety(payload = {}) {
  const state = ensureState();
  const confirmation = state.safetyQueue.find((item) => item.id === payload.confirmationId) || state.safetyQueue[0];
  if (!confirmation) return { ok: false, reason: 'Nenhuma confirmação pendente.', dashboard: getDashboard() };
  confirmation.status = payload.approved === false ? 'negado' : 'aprovado';
  confirmation.resolvedAt = nowIso();
  state.safetyQueue = state.safetyQueue.filter((item) => item.id !== confirmation.id);
  state.activeSession.pendingConfirmation = null;
  const title = confirmation.status === 'aprovado' ? 'Ação de voz confirmada' : 'Ação de voz cancelada';
  pushActivity(state, 'voice_safety_confirmed', title, `${confirmation.phrase} foi ${confirmation.status}.`);
  return { ok: true, confirmation, result: confirmation.status === 'aprovado' ? buildExecutionResult(confirmation) : { status: 'cancelled' }, dashboard: saveState(state) };
}

module.exports = { getDashboard, wake, executeVoiceCommand, registerDevice, setMode, confirmSafety };
