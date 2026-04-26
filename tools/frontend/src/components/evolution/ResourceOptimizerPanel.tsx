import { useEffect, useState } from 'react';

type ResourceOptimizerState = {
  optimizationScore?: number;
  resourcePressure?: string;
  allocationMode?: string;
  recommendedAction?: string;
  savingsEstimate?: number;
  activeConstraints?: Array<string | Record<string, unknown>>;
  activeAllocations?: Array<string | Record<string, unknown>>;
  deferredWork?: Array<string | Record<string, unknown>>;
  planAccepted?: boolean;
  runCount?: number;
  lastOptimizationSummary?: string;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.title, '') || asText(record.label, '') || asText(record.reason, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function ResourceOptimizerPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<ResourceOptimizerState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/resource-optimizer/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar resource optimizer');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar resource optimizer'));
  }, [apiBase, refreshKey]);

  async function runOptimizer() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/resource-optimizer/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar resource optimizer');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar resource optimizer');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Resource Optimizer</h3>
        <button type="button" onClick={runOptimizer} disabled={running}>{running ? 'Otimizando...' : 'Rodar otimização'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Score</span><strong>{String(state?.optimizationScore || 0)}</strong></div>
        <div className="evo-card"><span>Pressão</span><strong>{asText(state?.resourcePressure)}</strong></div>
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.allocationMode)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Economia estimada</span><strong>{`${Number(state?.savingsEstimate || 0)}%`}</strong></div>
        <div className="evo-card"><span>Plano aceito</span><strong>{state?.planAccepted ? 'Sim' : 'Não'}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.recommendedAction, 'Nenhuma ação recomendada ainda.')}</p>
      <p className="evo-summary">{asText(state?.lastOptimizationSummary, 'Nenhuma otimização executada ainda.')}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Alocações ativas</h4>
          <ul>{(state?.activeAllocations || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Restrições</h4>
          <ul>{(state?.activeConstraints || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Trabalho adiado</h4>
          <ul>{(state?.deferredWork || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Execuções</h4>
          <ul><li>{String(state?.runCount || 0)}</li></ul>
        </div>
      </div>
    </section>
  );
}
