import { preDeployCheck } from '../services/deploy.service.js'; export function preDeployController(req,res){res.json({ok:true,data:preDeployCheck()});}
