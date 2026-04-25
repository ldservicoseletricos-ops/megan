import { deploySupervised } from '../services/deploy.service.js'; export function deploySupervisedController(req,res){res.json({ok:true,data:deploySupervised()});}
