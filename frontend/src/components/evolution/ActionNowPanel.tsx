import { useEffect, useState } from 'react';

type ActionNowState = {
  title?: string;
  reason?: string;
  expectedImpact?: string;
  predictedRisk?: string;
  decidedBy?: string;
  sourceFocus?: string;
  updatedAt?: string | null;
};

export default function ActionNowPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<ActionNowState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/action-now/state`);
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar ação agora');
      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar ação agora');
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
      const response = await fetch(`${apiBase}/api/action-now/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao atualizar ação agora');
      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar ação agora');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="panel-card panel-card--full action-now-panel">
      <div className="panel-card__header">
        <div>
          <span className="panel-card__eyebrow">Ação agora</span>
          <h2>Próxima ação prioritária</h2>
        </div>
        <span className="tag">{loading ? 'Atualizando…' : 'pipeline ativo'}</span>
      </div>

      {error ? <div className="banner banner--error">{error}</div> : null}

      <div className="detail-grid">
        <div className="detail-item">
          <span>Ação</span>
          <strong>{state?.title || '—'}</strong>
        </div>
        <div className="detail-item">
          <span>Motivo</span>
          <strong>{state?.reason || '—'}</strong>
        </div>
        <div className="detail-item">
          <span>Impacto esperado</span>
          <strong>{state?.expectedImpact || '—'}</strong>
        </div>
        <div className="detail-item">
          <span>Risco</span>
          <strong>{state?.predictedRisk || '—'}</strong>
        </div>
        <div className="detail-item">
          <span>Quem decidiu</span>
          <strong>{state?.decidedBy || '—'}</strong>
        </div>
        <div className="detail-item">
          <span>Foco de origem</span>
          <strong>{state?.sourceFocus || '—'}</strong>
        </div>
      </div>

      <div className="action-row action-row--wrap">
        <button className="btn btn--primary" onClick={run} disabled={running}>
          {running ? 'Atualizando…' : 'Atualizar ação agora'}
        </button>
      </div>
    </section>
  );
}
