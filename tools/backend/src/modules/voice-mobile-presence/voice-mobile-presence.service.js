
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../data');
const STATE_FILE = path.join(DATA_DIR, 'voice-mobile-presence-state.json');

function nowIso() { return new Date().toISOString(); }

function ensureState() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STATE_FILE)) {
    const now = nowIso();
    const initial = {
      updatedAt: now,
      mode: 'supervised_continuous_presence',
      wakeWord: { phrase: 'Ok Megan', status: 'configured', sensitivity: 'balanced', privacy: 'local_first_supervised' },
      devices: [
        { id: 'android-main', name: 'Android principal', platform: 'Android', status: 'ready', batteryMode: 'adaptive', microphone: 'permission_required', notifications: 'ready', lastSeen: now },
        { id: 'iphone-main', name: 'iPhone principal', platform: 'iOS', status: 'planned', batteryMode: 'ios_background_limited', microphone: 'permission_required', notifications: 'planned', lastSeen: now },
        { id: 'web-pwa', name: 'PWA Megan', platform: 'Web/PWA', status: 'ready', batteryMode: 'browser_controlled', microphone: 'permission_required', notifications: 'ready', lastSeen: now }
      ],
      capabilities: [
        { id: 'wake-word', title: 'Wake word “Ok Megan”', status: 'ready_supervised', detail: 'Ativação por voz com confirmação visual antes de ações sensíveis.' },
        { id: 'voice-commands', title: 'Comandos por voz', status: 'ready', detail: 'Transforma fala em intenção operacional e envia para agentes.' },
        { id: 'mobile-presence', title: 'Presença contínua mobile', status: 'ready', detail: 'Mantém estado, localização autorizada, notificações e retomada rápida.' },
        { id: 'hands-free', title: 'Modo mãos livres', status: 'ready', detail: 'Executa leitura, resumo, lembretes e respostas assistidas.' },
        { id: 'safety-gate', title: 'Portão de segurança', status: 'active', detail: 'Bloqueia ações críticas sem confirmação do usuário.' }
      ],
      commandExamples: [
        { text: 'Ok Megan, leia minhas pendências de hoje', intent: 'daily_focus', risk: 'low', action: 'Resumo de agenda, tarefas e prioridades.' },
        { text: 'Ok Megan, responder esse cliente', intent: 'customer_reply', risk: 'medium', action: 'Preparar resposta e pedir confirmação antes de enviar.' },
        { text: 'Ok Megan, iniciar navegação para casa', intent: 'navigation_start', risk: 'medium', action: 'Abrir navegação com rota confirmada.' },
        { text: 'Ok Megan, publicar deploy', intent: 'deploy_publish', risk: 'high', action: 'Exigir confirmação e validação antes de publicar.' }
      ],
      sessions: [
        { id: 'voice-session-001', source: 'PWA', command: 'Ok Megan, organizar meu dia', intent: 'daily_focus', status: 'completed', createdAt: now },
        { id: 'voice-session-002', source: 'Android', command: 'Ok Megan, verificar clientes sem resposta', intent: 'crm_followup', status: 'waiting_permission', createdAt: now }
      ],
      metrics: { devicesReady: 2, wakeWordHealth: 94, commandsToday: 12, continuousPresence: 88, safetyBlocks: 3, averageLatencyMs: 420 }
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(initial, null, 2));
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  state.updatedAt = nowIso();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}

function classifyCommand(text = '') {
  const lower = String(text).toLowerCase();
  if (lower.includes('agenda') || lower.includes('dia') || lower.includes('pendência')) return { intent: 'daily_focus', risk: 'low', nextAction: 'Montar foco diário com agenda, metas e lembretes.' };
  if (lower.includes('cliente') || lower.includes('responder') || lower.includes('lead')) return { intent: 'customer_reply', risk: 'medium', nextAction: 'Preparar resposta comercial e pedir confirmação antes de enviar.' };
  if (lower.includes('naveg')) return { intent: 'navigation_start', risk: 'medium', nextAction: 'Abrir painel de navegação e confirmar destino.' };
  if (lower.includes('deploy') || lower.includes('publicar')) return { intent: 'deploy_publish', risk: 'high', nextAction: 'Executar checklist de deploy e exigir confirmação manual.' };
  if (lower.includes('cobran') || lower.includes('pagamento')) return { intent: 'billing_followup', risk: 'medium', nextAction: 'Consultar cobrança, preparar mensagem e registrar no CRM.' };
  return { intent: 'general_voice_command', risk: 'low', nextAction: 'Responder por voz e registrar preferência.' };
}

function getDashboard() {
  const state = ensureState();
  return { ok: true, title: 'Megan OS 4.8 — VOZ + CELULAR + PRESENÇA REAL', focus: 'App Android/iPhone, wake word “Ok Megan”, comandos por voz e uso contínuo supervisionado.', status: 'voice_mobile_presence_ready', ...state };
}

function registerDevice(payload = {}) {
  const state = ensureState();
  const platform = payload.platform || 'Web/PWA';
  const device = { id: payload.id || `device-${Date.now()}`, name: payload.name || `Dispositivo ${platform}`, platform, status: 'ready', batteryMode: payload.batteryMode || 'adaptive', microphone: payload.microphone || 'permission_required', notifications: payload.notifications || 'ready', lastSeen: nowIso() };
  const index = state.devices.findIndex((item) => item.id === device.id);
  if (index >= 0) state.devices[index] = { ...state.devices[index], ...device };
  else state.devices.unshift(device);
  state.metrics.devicesReady = state.devices.filter((item) => item.status === 'ready').length;
  saveState(state);
  return { ok: true, device };
}

function runVoiceCommand(payload = {}) {
  const state = ensureState();
  const command = payload.command || 'Ok Megan, organizar meu dia';
  const classified = classifyCommand(command);
  const requiresConfirmation = classified.risk !== 'low';
  const session = { id: `voice-session-${Date.now()}`, source: payload.source || 'Web/PWA', command, intent: classified.intent, risk: classified.risk, status: requiresConfirmation ? 'waiting_permission' : 'completed', nextAction: classified.nextAction, createdAt: nowIso() };
  state.sessions.unshift(session);
  state.metrics.commandsToday += 1;
  if (requiresConfirmation) state.metrics.safetyBlocks += 1;
  saveState(state);
  return { ok: true, session, requiresConfirmation, spokenResponse: requiresConfirmation ? 'Encontrei uma ação que precisa da sua confirmação.' : 'Pronto, Luiz. Executei a ação segura e registrei no histórico.' };
}

module.exports = { getDashboard, registerDevice, runVoiceCommand };
