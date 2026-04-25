import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../utils/data-path.js';

const FILE = path.join(DATA_DIR, 'dynamic-priority-state.json');

const DEFAULT_STATE = {
  ok:true,
  updatedAt:null,
  priorities:[
    { rank:1, title:'Validar rotas reais do backend', score:96, reason:'Desbloqueia evolução segura' },
    { rank:2, title:'Executar análise de gargalos', score:88, reason:'Reduz risco operacional' },
    { rank:3, title:'Planejar próxima melhoria', score:79, reason:'Mantém progresso contínuo' }
  ]
};

function ensure(){ if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true}); if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify(DEFAULT_STATE,null,2),'utf8');}
function read(){ ensure(); try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {...DEFAULT_STATE};}}
function write(v){ ensure(); fs.writeFileSync(FILE, JSON.stringify(v,null,2),'utf8'); return v; }

export function getDynamicPriorityState(){ return read(); }

export function runDynamicPriority(){
  const now = {
    ok:true,
    updatedAt:new Date().toISOString(),
    priorities:[
      { rank:1, title:'Validar rotas reais do backend', score:96, reason:'Maior impacto com baixo risco' },
      { rank:2, title:'Atualizar fluxo cognitivo', score:89, reason:'Melhora coordenação central' },
      { rank:3, title:'Escolher próxima melhoria', score:78, reason:'Mantém evolução incremental' }
    ]
  };
  return write(now);
}
