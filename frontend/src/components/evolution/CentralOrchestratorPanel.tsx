import { useEffect, useState } from 'react';

type OrchestratorState = {
  leaderModule?: string;
  nextModule?: string;
  activeModules?: string[];
  standbyModules?: string[];
  reason?: string;
};

export default function CentralOrchestratorPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<OrchestratorState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const response = await fetch(`${apiBase}/api/central-orchestrator/state`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setState(data.state || null);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar orquestrador.');
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function run() {
    try {
      setBusy(true);
      setError('');
      const response = await fetch(`${apiBase}/api/central-orchestrator/run`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setState(data.state || null);
      onRefresh?.();
    } catch (err: any) {
      setError(err?.message || 'Falha ao recalcular orquestração.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-card panel-card--full">
      <div className="panel-card__header">
        <div>
          <span className="panel-card__eyebrow">Orquestrador central</span>
          <h2>Quem lidera o ciclo agora</h2>
        </div>
        <span className="tag">{busy ? 'Atualizando…' : 'coordenação ativa'}</span>
      </div>

      {error ? (
        <div className="banner banner--warn">
          <strong>Falha</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="detail-grid">
        <div className="detail-item">
          <span>Líder atual</span>
          <strong>{state?.leaderModule || '—'}</strong>
        </div>

        <div className="detail-item">
          <span>Próximo módulo</span>
          <strong>{state?.nextModule || '—'}</strong>
        </div>

        <div className="detail-item">
          <span>Ativos</span>
          <strong>{(state?.activeModules || []).join(', ') || '—'}</strong>
        </div>

        <div className="detail-item">
          <span>Em espera</span>
          <strong>{(state?.standbyModules || []).join(', ') || '—'}</strong>
        </div>
      </div>

      <div className="summary-box">
        <div>
          <span className="summary-box__label">Motivo</span>
          <p>{state?.reason || '—'}</p>
        </div>
      </div>

      <div className="action-row">
        <button className="btn btn--primary" onClick={run} disabled={busy}>
          {busy ? 'Atualizando…' : 'Recalcular orquestração'}
        </button>
      </div>
    </section>
  );
}