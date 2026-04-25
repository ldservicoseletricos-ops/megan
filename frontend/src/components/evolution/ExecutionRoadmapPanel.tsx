import { useEffect, useState } from 'react';

type Action = {
  id?: string;
  title?: string;
  status?: string;
  priority?: string;
  blockedReason?: string;
};

type RoadmapState = {
  progress?: number;
  totalActions?: number;
  currentAction?: Action | null;
  nextAction?: Action | null;
  blockedActions?: Action[];
  completedActions?: Action[];
  failedActions?: Action[];
  actions?: Action[];
};

export default function ExecutionRoadmapPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<RoadmapState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/execution-roadmap/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar roadmap');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar roadmap'));
  }, [apiBase, refreshKey]);

  async function advance() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/execution-roadmap/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao avançar roadmap');
      await load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao avançar roadmap');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Execution Roadmap</h3>
        <button type="button" onClick={advance} disabled={running}>{running ? 'Avançando...' : 'Concluir ação atual'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Progresso</span><strong>{String(state?.progress || 0)}%</strong></div>
        <div className="evo-card"><span>Ações</span><strong>{String(state?.totalActions || 0)}</strong></div>
        <div className="evo-card"><span>Próxima</span><strong>{state?.nextAction?.title || '—'}</strong></div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Ação atual</h4>
          <ul><li>{state?.currentAction?.title || 'Nenhuma ação ativa'}</li></ul>
        </div>
        <div className="evo-list-block">
          <h4>Concluídas</h4>
          <ul>{(state?.completedActions || []).slice(-4).map((item) => <li key={item.id}>{item.title}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-block">
        <h4>Roadmap completo</h4>
        <ul>{(state?.actions || []).map((item) => <li key={item.id}>{item.title} · {item.status} · {item.priority}</li>)}</ul>
      </div>
    </section>
  );
}
