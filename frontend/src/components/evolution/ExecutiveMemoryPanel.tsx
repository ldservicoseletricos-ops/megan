import { useEffect, useState } from 'react';

type ExecutiveMemoryState = {
  mission?: string;
  currentFocus?: string;
  executiveSummary?: string;
  criticalTasks?: string[];
  persistentPriorities?: string[];
  contextNotes?: string[];
  lastDecision?: string;
  updatedAt?: string | null;
};

export default function ExecutiveMemoryPanel({
  apiBase,
  refreshKey,
  onRefresh
}: {
  apiBase: string;
  refreshKey: number;
  onRefresh?: () => void;
}) {
  const [state, setState] = useState<ExecutiveMemoryState | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBase}/api/executive-memory/state`);
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao carregar memória executiva');
      }

      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar memória executiva');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [apiBase, refreshKey]);

  async function run() {
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${apiBase}/api/executive-memory/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Falha ao atualizar memória executiva');
      }

      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar memória executiva');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Executive Memory</h3>
        <span>{loading ? 'Atualizando...' : 'Memória executiva persistente'}</span>
      </div>

      {error ? <p className="panel-error">{error}</p> : null}

      <div className="evo-grid evo-grid--single">
        <div className="evo-card">
          <span>Missão</span>
          <strong>{state?.mission || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Foco atual</span>
          <strong>{state?.currentFocus || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Última decisão</span>
          <strong>{state?.lastDecision || '—'}</strong>
        </div>
        <div className="evo-card">
          <span>Resumo executivo</span>
          <strong>{state?.executiveSummary || '—'}</strong>
        </div>
      </div>

      <div className="action-row action-row--tight action-row--wrap">
        <button className="btn btn--primary" onClick={run} disabled={saving}>
          {saving ? 'Atualizando…' : 'Atualizar memória executiva'}
        </button>
      </div>

      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Tarefas críticas</h4>
          <ul>
            {(state?.criticalTasks || []).map((item, index) => (
              <li key={`critical-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="evo-list-block">
          <h4>Prioridades persistentes</h4>
          <ul>
            {(state?.persistentPriorities || []).map((item, index) => (
              <li key={`priority-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Notas de contexto</h4>
          <ul>
            {(state?.contextNotes || []).map((item, index) => (
              <li key={`note-${index}`}>{item}</li>
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
