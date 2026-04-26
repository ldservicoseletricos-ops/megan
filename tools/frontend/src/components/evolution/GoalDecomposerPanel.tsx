import { useEffect, useState } from 'react';

type Subtask = {
  id?: string;
  title?: string;
  status?: string;
  priority?: string;
};

type GoalState = {
  totalGoals?: number;
  activeGoal?: {
    id?: string;
    title?: string;
    summary?: string;
    progress?: number;
    subtasks?: Subtask[];
  } | null;
};

export default function GoalDecomposerPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<GoalState | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/goals/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar metas');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar metas'));
  }, [apiBase, refreshKey]);

  async function createGoal() {
    const trimmed = title.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/goals/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', title: trimmed, source: 'evolution_center' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao criar meta');
      setTitle('');
      await load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar meta');
    } finally {
      setSaving(false);
    }
  }

  async function rebuildGoal() {
    const goalId = state?.activeGoal?.id;
    if (!goalId || saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/goals/rebuild`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', goalId })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao reconstruir meta');
      await load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao reconstruir meta');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Goal Decomposer</h3>
        <span>{state?.totalGoals || 0} meta(s)</span>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-form-row">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Criar nova meta principal" />
        <button type="button" onClick={createGoal} disabled={saving}>{saving ? 'Salvando...' : 'Criar meta'}</button>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Meta ativa</span><strong>{state?.activeGoal?.title || '—'}</strong></div>
        <div className="evo-card"><span>Progresso</span><strong>{String(state?.activeGoal?.progress || 0)}%</strong></div>
      </div>
      <p className="evo-summary">{state?.activeGoal?.summary || 'Nenhuma meta ativa no momento.'}</p>
      <div className="action-row action-row--tight">
        <button type="button" className="btn btn--ghost" onClick={rebuildGoal} disabled={saving || !state?.activeGoal?.id}>Reconstruir roadmap</button>
      </div>
      <div className="evo-list-block">
        <h4>Subtarefas</h4>
        <ul>{(state?.activeGoal?.subtasks || []).map((item) => <li key={item.id}>{item.title} · {item.status || 'queued'} · {item.priority || 'medium'}</li>)}</ul>
      </div>
    </section>
  );
}
