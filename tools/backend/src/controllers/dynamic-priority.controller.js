import { getDynamicPriorityState, runDynamicPriority } from '../services/dynamic-priority.service.js';
export function getState(_req,res){ return res.json({ok:true,state:getDynamicPriorityState()});}
export function run(_req,res){ return res.json({ok:true,state:runDynamicPriority()});}
