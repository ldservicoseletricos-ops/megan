const timer = require('./autonomy-timer.service');

function createScheduler(runTick) {
  function start(state = {}) {
    const intervalMs = Number(state?.state?.timerIntervalMs || 30000);
    timer.startTimer(() => {
      try {
        runTick();
      } catch (_error) {
        // Mantém o loop vivo; o ciclo grava no histórico do núcleo.
      }
    }, intervalMs);
    return { ok: true, running: true, intervalMs };
  }

  function stop() {
    timer.stopTimer();
    return { ok: true, running: false };
  }

  function status(state = {}) {
    return {
      ok: true,
      running: timer.isRunning(),
      intervalMs: Number(state?.state?.timerIntervalMs || 30000),
      timerEnabled: Boolean(state?.state?.timerEnabled),
      continuousMode: Boolean(state?.state?.continuousMode),
      lastTimerRunAt: state?.state?.lastTimerRunAt || null,
    };
  }

  return { start, stop, status };
}

module.exports = { createScheduler };
