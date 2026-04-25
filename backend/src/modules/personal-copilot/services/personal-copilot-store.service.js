const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../../data');
const STORE_FILE = path.join(DATA_DIR, 'personal-copilot-state.json');
const today = new Date().toISOString().slice(0, 10);

const initialState = {
  agenda: [
    { id: 'agenda_001', title: 'Revisar prioridades da Megan OS', time: '09:00', type: 'foco', status: 'planned', date: today },
    { id: 'agenda_002', title: 'Bloco de saúde e pausa ativa', time: '12:30', type: 'saude', status: 'planned', date: today },
    { id: 'agenda_003', title: 'Organizar finanças pessoais do dia', time: '18:00', type: 'financas', status: 'planned', date: today }
  ],
  goals: [
    { id: 'goal_001', title: 'Evoluir Megan OS com segurança', area: 'projeto', progress: 68, priority: 'alta', nextStep: 'executar fase 4.4 com copiloto pessoal total' },
    { id: 'goal_002', title: 'Melhorar rotina diária', area: 'vida', progress: 42, priority: 'media', nextStep: 'definir foco principal de hoje' }
  ],
  health: [
    { id: 'health_001', mood: 'focado', energy: 78, sleepHours: 7, water: 4, note: 'Base inicial saudável para operação do dia.', createdAt: new Date().toISOString() }
  ],
  finances: [
    { id: 'fin_001', title: 'Reserva operacional', type: 'income', amount: 1500, category: 'projeto', dueDate: today, status: 'planned' },
    { id: 'fin_002', title: 'Assinaturas e ferramentas', type: 'expense', amount: 320, category: 'software', dueDate: today, status: 'pending' }
  ],
  reminders: [
    { id: 'rem_001', title: 'Checar agenda do dia', when: `${today}T09:00:00.000Z`, channel: 'in_app', status: 'scheduled' }
  ],
  decisions: [],
  activity: [
    { id: 'act_001', type: 'focus', text: 'Foco diário preparado para execução pessoal.', createdAt: new Date().toISOString() },
    { id: 'act_002', type: 'life', text: 'Copiloto pessoal 4.4 inicializado.', createdAt: new Date().toISOString() }
  ]
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(initialState, null, 2));
}
function readStore() {
  ensureStore();
  try { return { ...initialState, ...JSON.parse(fs.readFileSync(STORE_FILE, 'utf8') || '{}') }; }
  catch { return { ...initialState }; }
}
function writeStore(next) { ensureStore(); fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2)); return next; }
function addActivity(store, type, text) { const item = { id: `act_${Date.now()}`, type, text, createdAt: new Date().toISOString() }; store.activity = [item, ...(store.activity || [])].slice(0, 120); return item; }

module.exports = { readStore, writeStore, addActivity };
