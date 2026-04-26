function logInfo(scope, payload = {}) {
  console.log(`[${scope}]`, JSON.stringify(payload));
}

function logError(scope, error) {
  console.error(`[${scope}]`, error?.stack || error?.message || error);
}

export { logInfo, logError };
