import { useEffect, useState } from 'react';

type ControlledAutonomyState = {
  autonomyMode?: string;
  confidenceScore?: number;
  currentCycleFocus?: string;
  recommendedTrigger?: string;
  nextAutonomousAction?: string;
  allowedActions?: string[];
  blockedActions?: string[];
  guardrails?: string[];
  updatedAt?: string | null;
};

export default function ControlledAutonomyPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<ControlledAutonomyState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/controlled-autonomy/state`);
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao carregar autonomia controlada');
      }

      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar autonomia controlada');
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
      const response = await fetch(`${apiBase}/api/controlled-autonomy/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao executar autonomia controlada');
      }

      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar autonomia controlada');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Controlled Autonomy</h3>
        <span>{loading ? 'Atualizando...' : 'Autonomia dentro de limites seguros'}</span>
      </div>

      {error ? <p className="panel-error">{error}</p> : null}

      <div className="evo-grid evo-grid--double">
        <div className="evo-card">
          <span>Modo</span>
          <strong>{state?.autonomyMode || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Confiança</span>
          <strong>{state?.confidenceScore ?? '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Foco do ciclo</span>
          <strong>{state?.currentCycleFocus || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Próxima ação autônoma</span>
          <strong>{state?.nextAutonomousAction || '—'}</strong>
        </div>
      </div>

      <div className="action-row action-row--tight action-row--wrap">
        <button className="btn btn--primary" onClick={run} disabled={running}>
          {running ? 'Executando…' : 'Executar autonomia controlada'}
        </button>
      </div>

      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Ações permitidas</h4>
          <ul>
            {(state?.allowedActions || []).map((item, index) => (
              <li key={`allowed-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="evo-list-block">
          <h4>Ações bloqueadas</h4>
          <ul>
            {(state?.blockedActions || []).map((item, index) => (
              <li key={`blocked-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Guardrails</h4>
          <ul>
            {(state?.guardrails || []).map((item, index) => (
              <li key={`guard-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="evo-list-block">
          <h4>Trigger recomendado</h4>
          <ul>
            <li>{state?.recommendedTrigger || '—'}</li>
            <li>{state?.updatedAt ? new Date(state.updatedAt).toLocaleString('pt-BR') : '—'}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
