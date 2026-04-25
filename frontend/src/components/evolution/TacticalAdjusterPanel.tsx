import { useEffect, useState } from 'react';

type Recommendation = {
  type?: string;
  title?: string;
  reason?: string;
  level?: string;
};

type AdjusterState = {
  mode?: string;
  lastAction?: string;
  currentAdjustment?: Recommendation | null;
  recommendations?: Recommendation[];
  appliedAdjustments?: Array<Recommendation & { appliedAt?: string }>;
};

export default function TacticalAdjusterPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<AdjusterState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/tactical-adjuster/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar tactical adjuster');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar tactical adjuster'));
  }, [apiBase, refreshKey]);

  async function runAdjuster() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/tactical-adjuster/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', apply: true })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao rodar ajuste tático');
      await load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao rodar ajuste tático');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Tactical Adjuster</h3>
        <button type="button" onClick={runAdjuster} disabled={running}>{running ? 'Ajustando...' : 'Executar ajuste'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Modo</span><strong>{state?.mode || 'balanced'}</strong></div>
        <div className="evo-card"><span>Última ação</span><strong>{state?.lastAction || '—'}</strong></div>
      </div>
      <div className="evo-list-block">
        <h4>Recomendações</h4>
        <ul>{(state?.recommendations || []).map((item, index) => <li key={`${item.type}-${index}`}>{item.title} · {item.reason} · {item.level}</li>)}</ul>
      </div>
      <div className="evo-list-block">
        <h4>Ajustes aplicados</h4>
        <ul>{(state?.appliedAdjustments || []).slice(0, 4).map((item, index) => <li key={`${item.type}-${index}`}>{item.title} · {item.appliedAt || 'agora'}</li>)}</ul>
      </div>
    </section>
  );
}
