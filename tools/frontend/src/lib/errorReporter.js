const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/+$/, '');

export function reportClientError(payload = {}) {
  try {
    const body = {
      source: 'frontend',
      severity: payload.severity || 'warning',
      module: payload.module || 'frontend',
      message: payload.message || 'Erro de cliente não detalhado.',
      stack: payload.stack || '',
      path: window.location.pathname,
      context: payload.context || {},
    };

    return fetch(`${API_BASE}/api/autonomy/report-client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => null);
  } catch (_error) {
    return Promise.resolve(null);
  }
}

export function installClientErrorReporter() {
  const onError = (event) => {
    reportClientError({
      severity: 'danger',
      message: event.message,
      stack: event.error?.stack || '',
      module: 'frontend-runtime',
    });
  };

  const onUnhandledRejection = (event) => {
    const reason = event.reason;
    reportClientError({
      severity: 'warning',
      message: typeof reason === 'string' ? reason : reason?.message || 'Promise rejeitada sem detalhe.',
      stack: reason?.stack || '',
      module: 'frontend-promise',
    });
  };

  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onUnhandledRejection);

  return () => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
}
