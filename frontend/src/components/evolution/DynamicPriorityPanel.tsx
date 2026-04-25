import { useEffect, useState } from 'react';

type PriorityItem = {
  rank: number;
  title: string;
  score: number;
  reason: string;
};

type PriorityState = {
  priorities?: PriorityItem[];
};

export default function DynamicPriorityPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<PriorityState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setError('');
      const response = await fetch(`${apiBase}/api/dynamic-priority/state`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setState(data.state || null);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar prioridade dinâmica.');
    }
  }

  useEffect(() => {
    load();
  }, [refreshKey]);

  async function run() {
    try {
      setBusy(true);
      setError('');
      const response = await fetch(`${apiBase}/api/dynamic-priority/run`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setState(data.state || null);
      onRefresh?.();
    } catch (err: any) {
      setError(err?.message || 'Falha ao recalcular prioridades.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel-card panel-card--full">
      <div className="panel-card__header">
        <div>
          <span className="panel-card__eyebrow">Prioridade dinâmica</span>
          <h2>Ranking atual de prioridades</h2>
        </div>
        <span className="tag">{busy ? 'Atualizando…' : 'scores ativos'}</span>
      </div>

      {error ? (
        <div className="banner banner--warn">
          <strong>Falha</strong>
          <p>{error}</p>
        </div>
      ) : null}

      <div className="story-grid">
        {(state?.priorities || []).map((priority) => (
          <div className="story-card" key={priority.rank}>
            <span>#{priority.rank}</span>
            <strong>{priority.title}</strong>
            <small>
              Score {priority.score} · {priority.reason}
            </small>
          </div>
        ))}
      </div>

      <div className="action-row">
        <button className="btn btn--primary" onClick={run} disabled={busy}>
          {busy ? 'Atualizando…' : 'Recalcular prioridades'}
        </button>
      </div>
    </section>
  );
}