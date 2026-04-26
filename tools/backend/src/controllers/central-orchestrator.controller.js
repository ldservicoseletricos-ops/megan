import { getCentralOrchestratorState, runCentralOrchestrator } from '../services/central-orchestrator.service.js';
export function getState(_req,res){ return res.json({ok:true,state:getCentralOrchestratorState()});}
export function run(_req,res){ return res.json({ok:true,state:runCentralOrchestrator()});}
