import { deployRollback } from '../services/deploy.service.js'; export function deployRollbackController(req,res){res.json({ok:true,data:deployRollback()});}
