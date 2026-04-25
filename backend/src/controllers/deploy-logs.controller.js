import { deployLogs } from '../services/deploy.service.js'; export function deployLogsController(req,res){res.json({ok:true,data:deployLogs()});}
