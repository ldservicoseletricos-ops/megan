const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../../../data');
const STORE_FILE = path.join(DATA_DIR, 'autoempresa-state.json');

const initialState = {
  leads: [
    {
      id: 'lead_001',
      name: 'Clínica Vida Plena',
      company: 'Clínica Vida Plena',
      channel: 'WhatsApp',
      email: 'contato@vidaplena.local',
      phone: '+55 11 90000-0001',
      need: 'automatizar atendimento, agenda e cobrança',
      valueEstimate: 2800,
      stage: 'proposal',
      score: 92,
      createdAt: '2026-04-24T09:00:00.000Z',
      lastAction: 'Proposta automática pronta para envio',
    },
    {
      id: 'lead_002',
      name: 'Rosa Consultoria',
      company: 'Rosa Consultoria',
      channel: 'Gmail',
      email: 'diretoria@rosaconsultoria.local',
      phone: '+55 11 90000-0002',
      need: 'CRM vivo e follow-up automático para vendas B2B',
      valueEstimate: 4200,
      stage: 'follow_up',
      score: 87,
      createdAt: '2026-04-24T10:30:00.000Z',
      lastAction: 'Follow-up consultivo agendado',
    },
  ],
  proposals: [],
  followUps: [],
  billing: [],
  replies: [],
  activity: [
    { id: 'act_001', type: 'lead', text: 'Lead qualificado: Clínica Vida Plena', createdAt: '2026-04-24T09:03:00.000Z' },
    { id: 'act_002', type: 'proposal', text: 'Proposta sugerida para automação comercial', createdAt: '2026-04-24T09:15:00.000Z' },
  ],
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify(initialState, null, 2));
}

function readStore() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8') || '{}');
    return { ...initialState, ...parsed };
  } catch {
    return { ...initialState };
  }
}

function writeStore(next) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(next, null, 2));
  return next;
}

function addActivity(store, type, text) {
  const item = { id: `act_${Date.now()}`, type, text, createdAt: new Date().toISOString() };
  store.activity = [item, ...(store.activity || [])].slice(0, 100);
  return item;
}

module.exports = { readStore, writeStore, addActivity };
