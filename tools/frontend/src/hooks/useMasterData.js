import { useCallback, useEffect, useMemo, useState } from 'react';

const apiUrl = (import.meta.env.VITE_API_URL || 'https://megan-ai.onrender.com').replace(/\/+$/, '');

async function requestJson(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const reason = payload?.reason || payload?.message || `Falha em ${path}: ${response.status}`;
    throw new Error(reason);
  }

  return payload;
}

function toneFromPercent(value) {
  if (value >= 70) return 'good';
  if (value >= 50) return 'warn';
  return 'danger';
}

function normalizeCards(health, overview, state, repo) {
  const stateData = state?.state || {};
  const overviewData = overview?.state || {};
  const repoData = repo?.repo || {};

  return [
    {
      id: 'readiness',
      title: 'Readiness real',
      value: stateData.readiness ?? 0,
      suffix: '%',
      tone: toneFromPercent(stateData.readiness ?? 0),
      description: overviewData.nextBestAction || 'Sem ação definida.',
    },
    {
      id: 'deploy',
      title: 'Deploy readiness',
      value: stateData.deployReadiness ?? 0,
      suffix: '%',
      tone: toneFromPercent(stateData.deployReadiness ?? 0),
      description: `Build ${stateData.buildReadiness ?? 0}% • Git ${stateData.gitReadiness ?? 0}%`,
    },
    {
      id: 'repo',
      title: 'Repositório',
      value: repoData.connected ? 'ON' : 'OFF',
      tone: repoData.connected ? 'good' : 'danger',
      description: repoData.repoPath || 'Repositório ainda não validado.',
    },
    {
      id: 'health',
      title: 'Core health',
      value: health?.ok ? 'OK' : 'FALHA',
      tone: health?.ok ? 'good' : 'danger',
      description: `${health?.service || 'Megan Core'} • v${health?.version || '---'}`,
    },
  ];
}

export function useMasterData() {
  const [data, setData] = useState({
    health: null,
    overview: null,
    state: null,
    issues: [],
    hypotheses: [],
    patches: [],
    memory: [],
    repo: null,
    timeline: [],
  });
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [actionState, setActionState] = useState({
    runningKey: '',
    message: '',
    type: 'neutral',
    payload: null,
  });

  const refresh = useCallback(async ({ silent = false } = {}) => {
    setError('');

    if (silent) {
      setIsPolling(true);
    } else {
      setLoading(true);
    }

    try {
      const [health, overview, state, issues, hypotheses, patches, memory, repo, timeline] = await Promise.all([
        requestJson('/api/health'),
        requestJson('/api/master/overview'),
        requestJson('/api/master/state'),
        requestJson('/api/master/issues'),
        requestJson('/api/master/hypotheses'),
        requestJson('/api/master/patches'),
        requestJson('/api/master/memory'),
        requestJson('/api/master/repo'),
        requestJson('/api/master/timeline'),
      ]);

      setData({
        health,
        overview,
        state,
        issues: issues?.items || [],
        hypotheses: hypotheses?.items || [],
        patches: patches?.items || [],
        memory: memory?.items || [],
        repo,
        timeline: timeline?.items || [],
      });
      setLastUpdated(new Date().toLocaleString('pt-BR'));
    } catch (fetchError) {
      console.error('Erro ao carregar painel master', fetchError);
      setError(fetchError.message || 'Falha ao carregar dados do backend.');
    } finally {
      setLoading(false);
      setIsPolling(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      refresh({ silent: true });
    }, 30000);

    return () => clearInterval(timer);
  }, [refresh]);

  const runTeamAction = useCallback(async (action) => {
    if (!action?.key || !action?.path) {
      return;
    }

    setActionState({
      runningKey: action.key,
      message: `Executando ${action.label || action.key}...`,
      type: 'neutral',
      payload: null,
    });

    try {
      const result = await requestJson(action.path, {
        method: action.method || 'POST',
        body: action.body ? JSON.stringify(action.body) : undefined,
      });

      let message = action.successMessage || `${action.label || action.key} executado com sucesso.`;

      if (result?.reply) {
        message = result.reply;
      } else if (result?.result?.summary?.readiness !== undefined) {
        message = `Ciclo executado com readiness ${result.result.summary.readiness}%.`;
      } else if (result?.validation?.summary) {
        message = result.validation.summary;
      } else if (result?.deploy?.summary) {
        message = result.deploy.summary;
      }

      setActionState({
        runningKey: '',
        message,
        type: 'success',
        payload: result,
      });

      await refresh({ silent: true });
      return result;
    } catch (runError) {
      console.error('Falha ao executar ação da equipe', runError);
      setActionState({
        runningKey: '',
        message: runError.message || `Falha ao executar ${action.label || action.key}.`,
        type: 'error',
        payload: null,
      });
      throw runError;
    }
  }, [refresh]);

  const cards = useMemo(
    () => normalizeCards(data.health, data.overview, data.state, data.repo),
    [data.health, data.overview, data.state, data.repo],
  );

  return {
    ...data,
    cards,
    loading,
    isPolling,
    error,
    lastUpdated,
    refresh,
    runTeamAction,
    actionState,
    clearActionState: () => setActionState({ runningKey: '', message: '', type: 'neutral', payload: null }),
    backendOnline: Boolean(data.health?.ok),
    apiBase: apiUrl,
  };
}
