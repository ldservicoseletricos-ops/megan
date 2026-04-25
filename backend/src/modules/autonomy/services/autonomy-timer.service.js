let timerHandle = null;

function startTimer(callback, intervalMs) {
  stopTimer();
  timerHandle = setInterval(callback, intervalMs);
  return true;
}

function stopTimer() {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function isRunning() {
  return Boolean(timerHandle);
}

module.exports = { startTimer, stopTimer, isRunning };
