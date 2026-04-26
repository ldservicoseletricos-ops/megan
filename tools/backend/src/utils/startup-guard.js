export async function verifyRequiredEnvironment(logger = console) {
  const required = ['PORT'];
  const missing = required.filter((key) => !String(process.env[key] || '').trim());

  if (missing.length) {
    logger.error('[Megan][StartupGuard] Variáveis ausentes:', missing.join(', '));
    throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
  }

  logger.log('[Megan][StartupGuard] Ambiente mínimo validado.');
  return true;
}
