import { useEffect, useState } from 'react';

type TacticalExecutorState = {
  actionNow?: string;
  estimatedTime?: string;
  predictedRisk?: string;
  expectedImpact?: string;
  threeStepPlan?: string[];
  executionNotes?: string[];
  updatedAt?: string | null;
};

export default function TacticalExecutorPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<TacticalExecutorState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/tactical-executor/state`);
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao carregar executor tático');
      }

      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar executor tático');
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
      const response = await fetch(`${apiBase}/api/tactical-executor/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao executar plano tático');
      }

      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar plano tático');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Tactical Executor</h3>
        <span>{loading ? 'Atualizando...' : 'Execução prática do próximo ciclo'}</span>
      </div>

      {error ? <p className="panel-error">{error}</p> : null}

      <div className="evo-grid evo-grid--double">
        <div className="evo-card">
          <span>Ação agora</span>
          <strong>{state?.actionNow || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Tempo estimado</span>
          <strong>{state?.estimatedTime || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Risco previsto</span>
          <strong>{state?.predictedRisk || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Impacto esperado</span>
          <strong>{state?.expectedImpact || '—'}</strong>
        </div>
      </div>

      <div className="action-row action-row--tight action-row--wrap">
        <button className="btn btn--primary" onClick={run} disabled={running}>
          {running ? 'Executando…' : 'Executar plano tático'}
        </button>
      </div>

      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Plano de 3 passos</h4>
          <ul>
            {(state?.threeStepPlan || []).map((item, index) => (
              <li key={`step-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="evo-list-block">
          <h4>Notas de execução</h4>
          <ul>
            {(state?.executionNotes || []).map((item, index) => (
              <li key={`note-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
