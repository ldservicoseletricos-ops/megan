export function logInfo(scope, data) {
  console.log(`[${scope}]`, data);
}

export function logError(scope, error) {
  console.error(`[${scope}]`, error);
}
