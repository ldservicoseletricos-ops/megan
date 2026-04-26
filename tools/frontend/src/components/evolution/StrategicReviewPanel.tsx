import { useEffect, useState } from 'react';

type StrategicState = {
  activeStrategicFocus?: string;
  executionReadiness?: string;
  reviewScore?: number;
  strengths?: Array<string | Record<string, unknown>>;
  risks?: Array<string | Record<string, unknown>>;
  opportunities?: Array<string | Record<string, unknown>>;
  strategicPriorities?: Array<{ title?: string; lane?: string; owner?: string; urgency?: string } | string>;
  recommendations?: Array<string | Record<string, unknown>>;
  lastReviewSummary?: string;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.title, '') || asText(record.label, '') || asText(record.reason, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function StrategicReviewPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<StrategicState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/strategic-review/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar strategic review');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar strategic review'));
  }, [apiBase, refreshKey]);

  async function runReview() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/strategic-review/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar strategic review');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar strategic review');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Strategic Review</h3>
        <button type="button" onClick={runReview} disabled={running}>{running ? 'Revisando...' : 'Rodar revisão'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Foco ativo</span><strong>{asText(state?.activeStrategicFocus)}</strong></div>
        <div className="evo-card"><span>Prontidão</span><strong>{asText(state?.executionReadiness)}</strong></div>
        <div className="evo-card"><span>Score</span><strong>{String(state?.reviewScore || 0)}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.lastReviewSummary, 'Nenhuma revisão estratégica executada ainda.')}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Forças</h4>
          <ul>{(state?.strengths || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Riscos</h4>
          <ul>{(state?.risks || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Oportunidades</h4>
          <ul>{(state?.opportunities || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Prioridades</h4>
          <ul>{(state?.strategicPriorities || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
