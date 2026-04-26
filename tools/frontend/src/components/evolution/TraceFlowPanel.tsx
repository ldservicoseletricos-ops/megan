import { useEffect, useState } from 'react';

type TraceFlowState = {
  focus?: string;
  bottleneck?: string;
  decision?: string;
  plan?: string;
  updatedAt?: string | null;
};

export default function TraceFlowPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<TraceFlowState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/trace-flow/state`);
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar fluxo cognitivo');
      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar fluxo cognitivo');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [apiBase, refreshKey]);

  async function run() {
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/trace-flow/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao atualizar fluxo cognitivo');
      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar fluxo cognitivo');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="panel-card panel-card--full">
      <div className="panel-card__header">
        <div>
          <span className="panel-card__eyebrow">Fluxo cognitivo</span>
          <h2>Foco → Gargalo → Decisão → Plano</h2>
        </div>
        <span className="tag">{loading ? 'Atualizando…' : 'rastreabilidade total'}</span>
      </div>

      {error ? <div className="banner banner--error">{error}</div> : null}

      <div className="story-grid">
        <div className="story-card">
          <span>Foco atual</span>
          <strong>{state?.focus || '—'}</strong>
        </div>
        <div className="story-card">
          <span>Gargalo</span>
          <strong>{state?.bottleneck || '—'}</strong>
        </div>
        <div className="story-card">
          <span>Decisão</span>
          <strong>{state?.decision || '—'}</strong>
        </div>
        <div className="story-card">
          <span>Plano</span>
          <strong>{state?.plan || '—'}</strong>
        </div>
      </div>

      <div className="action-row action-row--wrap">
        <button className="btn btn--primary" onClick={run} disabled={running}>
          {running ? 'Atualizando…' : 'Atualizar fluxo cognitivo'}
        </button>
      </div>
    </section>
  );
}
