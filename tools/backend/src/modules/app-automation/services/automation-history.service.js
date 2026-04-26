const fs = require('fs');
const path = require('path');
const DATA_DIR = path.resolve(__dirname, '../../../../data');
const HISTORY_FILE = path.join(DATA_DIR, 'app-automation-history-state.json');
function ensureStore(){ if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true}); if(!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, JSON.stringify({items:[]}, null, 2)); }
function readHistory(){ ensureStore(); try { const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE,'utf8') || '{}'); return Array.isArray(parsed.items) ? parsed.items : []; } catch { return []; } }
function addHistory(entry){ const items = readHistory(); const next = [{ id:'auto_' + Date.now(), createdAt:new Date().toISOString(), ...entry }, ...items].slice(0,200); fs.writeFileSync(HISTORY_FILE, JSON.stringify({items:next}, null, 2)); return next[0]; }
module.exports = { readHistory, addHistory };
