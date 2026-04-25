const registry = require('./services/integration-registry.service');
const executor = require('./services/app-automation-executor.service');
const history = require('./services/automation-history.service');
function dashboard(_req,res){ const integrations=registry.getIntegrations(); const ready=integrations.filter((i)=>i.configured).length; res.json({ok:true,version:'4.2.0',title:'Megan OS 4.2 — Automação Total Entre Apps',status:ready>0?'partially_connected':'waiting_credentials',readyIntegrations:ready,totalIntegrations:integrations.length,integrations,result:'Megan preparada para executar tarefas reais em apps externos quando as credenciais forem configuradas.'}); }
async function run(req,res){ const result=await executor.executeAutomation(req.body||{}); res.status(result.ok?200:400).json(result); }
function workflow(req,res){ res.json(executor.buildWorkflow(req.body?.goal||req.body?.message||'')); }
function getHistory(_req,res){ res.json({ok:true,version:'4.2.0',items:history.readHistory()}); }
module.exports={dashboard,run,workflow,getHistory};
