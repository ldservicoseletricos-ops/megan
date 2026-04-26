import { useEffect, useState } from 'react';

type QueueItem = {
  id?: string;
  title?: string;
  level?: string;
  status?: string;
  priorityScore?: number;
  note?: string;
};

type QueueState = {
  total?: number;
  urgentImportant?: number;
  strategic?: number;
  automatic?: number;
  later?: number;
  items?: QueueItem[];
};

export default function ExecutionPlanPanel({ apiBase, refreshKey }: { apiBase: string; refreshKey: number }) {
  const [state, setState] = useState<QueueState | null>(null);
  const [nextTitle, setNextTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/execution-priority/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar fila');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar fila'));
  }, [apiBase, refreshKey]);

  async function enqueue() {
    const title = nextTitle.trim();
    if (!title || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/execution-priority/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', title, type: 'manual_goal', level: 'strategic', note: 'Ação criada pelo painel de evolução' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao adicionar ação');
      setNextTitle('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao adicionar ação');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Execution Priority</h3>
        <span>Fila e próxima ação</span>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--quad">
        <div className="evo-card"><span>Total</span><strong>{String(state?.total || 0)}</strong></div>
        <div className="evo-card"><span>Urgente</span><strong>{String(state?.urgentImportant || 0)}</strong></div>
        <div className="evo-card"><span>Estratégico</span><strong>{String(state?.strategic || 0)}</strong></div>
        <div className="evo-card"><span>Automático</span><strong>{String(state?.automatic || 0)}</strong></div>
      </div>
      <div className="evo-form-row">
        <input value={nextTitle} onChange={(e) => setNextTitle(e.target.value)} placeholder="Adicionar próxima ação" />
        <button type="button" onClick={enqueue} disabled={saving}>{saving ? 'Salvando...' : 'Adicionar'}</button>
      </div>
      <ul className="queue-list">
        {(state?.items || []).slice(0, 6).map((item) => (
          <li key={item.id || item.title}>
            <div>
              <strong>{item.title || 'Sem título'}</strong>
              <span>{item.note || item.status || 'Sem nota'}</span>
            </div>
            <em>{item.level || 'strategic'} · {String(item.priorityScore || 0)}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}
