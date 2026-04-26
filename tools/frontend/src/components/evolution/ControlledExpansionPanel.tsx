import { useEffect, useState } from 'react';

type ExpansionItem = {
  laneId?: string;
  label?: string;
  reason?: string;
};

type ChecklistItem = {
  label?: string;
  ok?: boolean;
};

type ExpansionState = {
  expansionMode?: string;
  expansionReadiness?: string;
  releaseWindow?: string;
  activeLane?: string;
  safeBudget?: number;
  expansionScore?: number;
  approvedExpansions?: ExpansionItem[];
  blockedExpansions?: ExpansionItem[];
  releaseChecklist?: ChecklistItem[];
  lastExpansionSummary?: string;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.label, '') || asText(record.title, '') || asText(record.reason, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function ControlledExpansionPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<ExpansionState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/controlled-expansion/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar controlled expansion');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar controlled expansion'));
  }, [apiBase, refreshKey]);

  async function runExpansion() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/controlled-expansion/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar controlled expansion');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar controlled expansion');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Controlled Expansion</h3>
        <button type="button" onClick={runExpansion} disabled={running}>{running ? 'Expandindo...' : 'Rodar expansão'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Faixa ativa</span><strong>{asText(state?.activeLane)}</strong></div>
        <div className="evo-card"><span>Janela</span><strong>{asText(state?.releaseWindow)}</strong></div>
        <div className="evo-card"><span>Score</span><strong>{String(state?.expansionScore || 0)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.expansionMode)}</strong></div>
        <div className="evo-card"><span>Orçamento seguro</span><strong>{String(state?.safeBudget || 0)}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.lastExpansionSummary, 'Nenhuma expansão controlada executada ainda.')}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Expansões aprovadas</h4>
          <ul>{(state?.approvedExpansions || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Expansões bloqueadas</h4>
          <ul>{(state?.blockedExpansions || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-block">
        <h4>Checklist de liberação</h4>
        <ul>{(state?.releaseChecklist || []).map((item, index) => <li key={`${index}-${item.label || 'check'}`}>{item.ok ? 'OK' : 'Pendente'} · {asText(item.label)}</li>)}</ul>
      </div>
    </section>
  );
}
