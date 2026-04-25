import { useEffect, useState } from 'react';

type Vote = {
  module?: string;
  stance?: string;
  reason?: string;
  weight?: number;
};

type ConsensusState = {
  decision?: string;
  consensusScore?: number;
  approvedAction?: string | null;
  coordinationLeadBrain?: string;
  rationale?: Array<string | Record<string, unknown>>;
  votes?: Vote[];
  conflicts?: Array<string | Record<string, unknown>>;
  blockers?: Array<string | Record<string, unknown>>;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.reason, '') || asText(record.title, '') || asText(record.name, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function ConsensusEnginePanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<ConsensusState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/consensus-engine/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar consenso');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar consenso'));
  }, [apiBase, refreshKey]);

  async function runConsensus() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/consensus-engine/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar consenso');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar consenso');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Consensus Engine</h3>
        <button type="button" onClick={runConsensus} disabled={running}>{running ? 'Avaliando...' : 'Avaliar consenso'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Decisão</span><strong>{state?.decision || 'review'}</strong></div>
        <div className="evo-card"><span>Score</span><strong>{String(state?.consensusScore || 0)}</strong></div>
        <div className="evo-card"><span>Ação aprovada</span><strong>{state?.approvedAction || '—'}</strong></div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Racional</h4>
          <ul>{(state?.rationale || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Conflitos</h4>
          <ul>{(state?.conflicts || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-block">
        <h4>Votos internos</h4>
        <ul>{(state?.votes || []).map((item, index) => <li key={`${item.module || 'vote'}-${index}`}>{asText(item.module)} · {asText(item.stance)} · {asText(item.reason)} · peso {String(item.weight || 0)}</li>)}</ul>
      </div>
    </section>
  );
}
