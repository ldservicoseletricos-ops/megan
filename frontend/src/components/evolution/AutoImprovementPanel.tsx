import { useEffect, useState } from 'react';

type RunItem = {
  id?: string;
  summary?: string;
  proposalTitle?: string;
  applied?: boolean;
  safeToApply?: boolean;
  createdAt?: string;
};

type AutoImprovementState = {
  mode?: string;
  lastRunSummary?: string;
  lastAppliedProposal?: {
    title?: string;
    rationale?: string;
  } | null;
  recentRuns?: RunItem[];
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return fallback;
}

export default function AutoImprovementPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<AutoImprovementState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/auto-improvement/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar auto improvement');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar auto improvement'));
  }, [apiBase, refreshKey]);

  async function run() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/auto-improvement/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', regenerate: true })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar auto improvement');
      await load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar auto improvement');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Auto Improvement</h3>
        <button type="button" className="btn btn--ghost" onClick={run} disabled={running}>
          {running ? 'Executando…' : 'Rodar melhoria segura'}
        </button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--single">
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.mode, 'guided_safe')}</strong></div>
        <div className="evo-card"><span>Último resumo</span><strong>{asText(state?.lastRunSummary)}</strong></div>
        <div className="evo-card"><span>Última proposta aplicada</span><strong>{asText(state?.lastAppliedProposal?.title, 'Nenhuma')}</strong></div>
      </div>
      <div className="evo-list-block">
        <h4>Execuções recentes</h4>
        <ul>
          {(state?.recentRuns || []).slice(0, 5).map((item, index) => (
            <li key={item.id || index}>
              <strong>{asText(item.summary)}</strong>
              <small>{asText(item.proposalTitle)} · {item.applied ? 'aplicada' : 'não aplicada'} · {item.safeToApply ? 'segura' : 'manual'}</small>
              <small>{asText(item.createdAt)}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
