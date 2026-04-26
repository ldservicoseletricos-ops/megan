import { useEffect, useState } from 'react';

type Task = {
  id?: string;
  title?: string;
  category?: string;
  priority?: string;
  confidence?: number;
  risk?: string;
  delegationReadiness?: number;
  delegatedAt?: string;
  status?: string;
  reason?: string;
};

type AutoDelegationState = {
  updatedAt?: string | null;
  mode?: string;
  delegationScore?: number;
  currentFocus?: string;
  eligibleTasks?: Task[];
  delegatedTasks?: Task[];
  blockedTasks?: Task[];
};

function renderTask(task: Task, fallback: string) {
  return `${task.title || fallback} · prioridade ${task.priority || 'medium'} · risco ${task.risk || 'medium'}`;
}

export default function AutoDelegationPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh?: () => void }) {
  const [state, setState] = useState<AutoDelegationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/auto-delegation/state`);
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar auto delegação');
      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar auto delegação');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [apiBase, refreshKey]);

  async function runDelegation() {
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/auto-delegation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: [
            { title: 'Consolidar runtime do backend', priority: 'critical', confidence: 84, risk: 'low' },
            { title: 'Expandir frontend sem quebrar o chat', priority: 'high', confidence: 72, risk: 'medium' },
            { title: 'Ativar autonomia sem validação extra', priority: 'high', confidence: 58, risk: 'high' }
          ]
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar auto delegação');
      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar auto delegação');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Auto Delegation</h3>
        <span>{loading ? 'Atualizando...' : 'Delegação automática controlada'}</span>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--single">
        <div className="evo-card"><span>Modo</span><strong>{state?.mode || '—'}</strong></div>
        <div className="evo-card"><span>Delegation score</span><strong>{String(state?.delegationScore ?? 0)}</strong></div>
        <div className="evo-card"><span>Foco atual</span><strong>{state?.currentFocus || '—'}</strong></div>
      </div>
      <div className="action-row">
        <button className="btn btn--primary" onClick={runDelegation} disabled={running}>{running ? 'Executando…' : 'Rodar delegação'}</button>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Delegadas</h4>
          <ul>{(state?.delegatedTasks || []).slice(0, 5).map((task, index) => <li key={task.id || index}>{renderTask(task, 'Tarefa delegada')}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Bloqueadas</h4>
          <ul>{(state?.blockedTasks || []).slice(0, 5).map((task, index) => <li key={task.id || index}>{renderTask(task, 'Tarefa bloqueada')} {task.reason ? `· ${task.reason}` : ''}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
