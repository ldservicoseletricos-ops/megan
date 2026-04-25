const unified = require('./services/unified-core.service');
const intelligence = require('./services/persistent-intelligence.service');
const central = require('./services/central-os.service');
const life = require('./services/life-operations.service');
const enterprise = require('./services/enterprise-command.service');
function handle(res, fn){try{return res.json(fn());}catch(error){return res.status(500).json({ok:false,reason:error.message});}}
module.exports={
  status(_req,res){return handle(res,()=>unified.getUnifiedCoreStatus());},
  dashboard(_req,res){return handle(res,()=>central.getCentralDashboard());},
  priorities(_req,res){return handle(res,()=>central.getPriorities());},
  recommendations(_req,res){return handle(res,()=>intelligence.getRecommendations());},
  liveContext(_req,res){return handle(res,()=>intelligence.getLiveContext());},
  execute(req,res){return handle(res,()=>central.executeCoreAction(req.body||{}));},
  life(_req,res){return handle(res,()=>life.getLifeOperations());},
  enterprise(_req,res){return handle(res,()=>enterprise.getEnterpriseCommand());},
  unified(_req,res){return handle(res,()=>unified.buildUnifiedSnapshot());},
};
