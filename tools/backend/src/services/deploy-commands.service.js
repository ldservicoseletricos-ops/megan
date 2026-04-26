const deployOrchestrator = require('./deploy-orchestrator.service');

function normalize(input = '') {
  return String(input).trim().toLowerCase();
}

function run(command = '') {
  const value = normalize(command);

  if (value === 'deploy status') {
    return {
      ok: true,
      type: 'status',
      payload: deployOrchestrator.getStatus(),
    };
  }

  if (value === 'preflight deploy') {
    return {
      ok: true,
      type: 'preflight',
      payload: deployOrchestrator.preflight(),
    };
  }

  if (value === 'deploy render preview') {
    return {
      ok: true,
      type: 'deploy',
      payload: deployOrchestrator.deploy({
        target: 'render_backend',
        environment: 'preview',
        confirmed: false,
      }),
    };
  }

  if (value === 'deploy vercel preview') {
    return {
      ok: true,
      type: 'deploy',
      payload: deployOrchestrator.deploy({
        target: 'vercel_frontend',
        environment: 'preview',
        confirmed: false,
      }),
    };
  }

  return {
    ok: false,
    reason: 'Comando de deploy não reconhecido.',
    supportedCommands: [
      'deploy status',
      'preflight deploy',
      'deploy render preview',
      'deploy vercel preview'
    ],
  };
}

module.exports = {
  run,
};
