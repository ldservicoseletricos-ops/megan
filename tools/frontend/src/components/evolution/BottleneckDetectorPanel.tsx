import { useEffect, useState } from 'react';

type BottleneckItem = {
  id?: string;
  title?: string;
  impact?: string;
  urgency?: string;
  unblockRecommendation?: string;
};

type BottleneckState = {
  overallRisk?: string;
  primaryBottleneck?: string;
  bottlenecks?: BottleneckItem[];
  updatedAt?: string | null;
};

export default function BottleneckDetectorPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<BottleneckState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBase}/api/bottleneck-detector/state`);
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao carregar gargalos');
      }

      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar gargalos');
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
      const response = await fetch(`${apiBase}/api/bottleneck-detector/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao analisar gargalos');
      }

      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao analisar gargalos');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Bottleneck Detector</h3>
        <span>{loading ? 'Atualizando...' : 'Detector estável de gargalos'}</span>
      </div>

      {error ? <p className="panel-error">{error}</p> : null}

      <div className="evo-grid evo-grid--single">
        <div className="evo-card">
          <span>Risco geral</span>
          <strong>{state?.overallRisk || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Gargalo principal</span>
          <strong>{state?.primaryBottleneck || '—'}</strong>
        </div>
      </div>

      <div className="action-row action-row--tight action-row--wrap">
        <button className="btn btn--primary" onClick={run} disabled={running}>
          {running ? 'Analisando…' : 'Analisar gargalos'}
        </button>
      </div>

      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Ranking de gargalos</h4>
          <ul>
            {(state?.bottlenecks || []).map((item, index) => (
              <li key={item.id || `bottleneck-${index}`}>
                <strong>{item.title || '—'}</strong>
                <small>Impacto: {item.impact || '—'} · Urgência: {item.urgency || '—'}</small>
                <small>{item.unblockRecommendation || 'Sem recomendação'}</small>
              </li>
            ))}
          </ul>
        </div>
        <div className="evo-list-block">
          <h4>Atualizado</h4>
          <ul>
            <li>{state?.updatedAt ? new Date(state.updatedAt).toLocaleString('pt-BR') : '—'}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
