const express = require('express');
const cors = require('cors');

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Megan OS Backend',
    version: '10.0-executive-operator-ai',
    status: 'online',
    autonomy: 'Self Growth AI com carregamento seguro de módulos',
    timestamp: new Date().toISOString()
  });
});

function safeUse(routePath, modulePath) {
  try {
    const route = require(modulePath);
    app.use(routePath, route);
    console.log(`[OK] rota carregada: ${routePath}`);
  } catch (error) {
    console.warn(`[AVISO] rota ignorada: ${routePath}`);
    console.warn(`Motivo: ${error.message}`);
  }
}

// Rotas principais que já existiam no pacote 8.5 funcional.
safeUse('/api/auth', './routes/auth.routes');
safeUse('/api/modules', './routes/module-access.routes');
safeUse('/api/crm', './routes/crm.routes');
safeUse('/api/billing', './routes/billing.routes');
safeUse('/api/mobile-navigation', './routes/mobile-navigation.routes');

// Módulos Megan OS 4.x a 6.5.
safeUse('/api/autonomy', './modules/autonomy/autonomy.routes');
safeUse('/api/core', './modules/core/core.routes');
safeUse('/api/agents', './modules/agents/agents.routes');
safeUse('/api/app-automation', './modules/app-automation/app-automation.routes');
safeUse('/api/autoempresa', './modules/autoempresa/autoempresa.routes');
safeUse('/api/personal-copilot', './modules/personal-copilot/personal-copilot.routes');
safeUse('/api/continuous-learning', './modules/continuous-learning/continuous-learning.routes');
safeUse('/api/autonomous-agents', './modules/autonomous-agents/autonomous-agents.routes');
safeUse('/api/multichannel', './modules/multichannel/multichannel.routes');
safeUse('/api/voice-mobile-presence', './modules/voice-mobile-presence/voice-mobile-presence.routes');
safeUse('/api/global-command-center', './modules/global-command-center/global-command-center.routes');
safeUse('/api/ecosystem', './modules/ecosystem/ecosystem.routes');
safeUse('/api/agent-marketplace', './modules/agent-marketplace/agent-marketplace.routes');
safeUse('/api/business-cloud', './modules/business-cloud/business-cloud.routes');
safeUse('/api/personal-life', './modules/personal-life/personal-life.routes');
safeUse('/api/megan-voice', './modules/megan-voice/megan-voice.routes');
safeUse('/api/megan-app-store', './modules/megan-app-store/megan-app-store.routes');
safeUse('/api/megan-nation', './modules/megan-nation/megan-nation.routes');
safeUse('/api/operating-network', './modules/operating-network/operating-network.routes');

// Módulos novos. Se algum arquivo faltar no futuro, o backend não cai.
safeUse('/api/deploy-autopilot', './modules/deploy-autopilot/deploy-autopilot.routes');
safeUse('/api/deploy-autopilot/api', './modules/deploy-autopilot/deploy-api.routes');
safeUse('/api/deploy-autopilot/one-click', './modules/deploy-autopilot/one-click-deploy.routes');
safeUse('/api/self-infrastructure', './modules/self-infrastructure/self-infrastructure.routes');
safeUse('/api/self-growth', './modules/self-growth/self-growth.routes');
safeUse('/api/stripe-autopilot', './modules/stripe-autopilot/stripe-autopilot.routes');
safeUse('/api/persistent-core', './modules/persistent-core/persistent-core.routes');
safeUse('/api/integrations', './modules/integrations/integrations.routes');
safeUse('/api/executive-operator', './modules/executive-operator/executive-operator.routes');

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

app.use((error, _req, res, _next) => {
  console.error('[ERRO GLOBAL]', error);
  res.status(error.status || 500).json({
    ok: false,
    error: error.message || 'Erro interno do servidor'
  });
});

module.exports = app;
