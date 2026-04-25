export function installProcessGuards(logger = console) {
  process.on('unhandledRejection', (reason) => {
    logger.error('[Megan][UnhandledRejection]', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('[Megan][UncaughtException]', error);
  });

  process.on('SIGTERM', () => {
    logger.log('[Megan] Recebeu SIGTERM.');
  });

  process.on('SIGINT', () => {
    logger.log('[Megan] Recebeu SIGINT.');
  });
}
