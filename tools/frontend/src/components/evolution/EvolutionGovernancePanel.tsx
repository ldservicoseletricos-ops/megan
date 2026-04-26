import { useEffect, useState } from 'react';

type GovernanceState = {
  governanceMode?: string;
  executionPolicy?: string;
  autonomyLevel?: string;
  approvalThreshold?: number;
  lastDecision?: string;
  lastReason?: string;
  policySummary?: string;
  blockers?: Array<string | Record<string, unknown>>;
  allowedActions?: Array<string | Record<string, unknown>>;
  restrictedActions?: Array<string | Record<string, unknown>>;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.title, '') || asText(record.name, '') || asText(record.reason, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function EvolutionGovernancePanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<GovernanceState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/evolution-governance/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar governança');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar governança'));
  }, [apiBase, refreshKey]);

  async function evaluate() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/evolution-governance/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao avaliar governança');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao avaliar governança');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Evolution Governance</h3>
        <button type="button" className="btn btn--ghost" onClick={evaluate} disabled={running}>
          {running ? 'Avaliando…' : 'Avaliar governança'}
        </button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.governanceMode, 'guided_safe')}</strong></div>
        <div className="evo-card"><span>Política</span><strong>{asText(state?.executionPolicy)}</strong></div>
        <div className="evo-card"><span>Autonomia</span><strong>{asText(state?.autonomyLevel)}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.policySummary)}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Ações permitidas</h4>
          <ul>{(state?.allowedActions || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Restrições</h4>
          <ul>{(state?.restrictedActions || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-block">
        <h4>Bloqueios preventivos</h4>
        <ul>{(state?.blockers || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
      </div>
    </section>
  );
}
