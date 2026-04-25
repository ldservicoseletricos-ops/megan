import { useEffect, useState } from 'react';

type FailureReason = { reason?: string; count?: number };
type FeedbackItem = { id?: string; title?: string; outcome?: string; reason?: string };
type FeedbackState = {
  totalEvents?: number;
  successRate?: number;
  lastOutcome?: string;
  topFailureReasons?: FailureReason[];
  improvementSignals?: Array<string | Record<string, unknown>>;
  recentFeedback?: FeedbackItem[];
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.reason, '') || asText(record.title, '') || asText(record.signal, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function FeedbackLoopPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<FeedbackState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/feedback-loop/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar feedback loop');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar feedback loop'));
  }, [apiBase, refreshKey]);

  async function register(outcome: 'success' | 'failure') {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/feedback-loop/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'luiz',
          type: 'manual_review',
          outcome,
          title: outcome === 'success' ? 'Validação manual positiva' : 'Validação manual negativa',
          reason: outcome === 'success' ? 'Ação concluída conforme esperado' : 'Resultado abaixo do esperado',
          source: 'frontend_feedback'
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao registrar feedback');
      await load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao registrar feedback');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Feedback Loop</h3>
        <div className="action-row action-row--tight">
          <button type="button" className="btn btn--ghost" onClick={() => register('success')} disabled={saving}>Registrar sucesso</button>
          <button type="button" className="btn btn--ghost" onClick={() => register('failure')} disabled={saving}>Registrar falha</button>
        </div>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Eventos</span><strong>{String(state?.totalEvents || 0)}</strong></div>
        <div className="evo-card"><span>Sucesso</span><strong>{String(state?.successRate || 0)}%</strong></div>
        <div className="evo-card"><span>Último</span><strong>{state?.lastOutcome || 'idle'}</strong></div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Falhas recorrentes</h4>
          <ul>{(state?.topFailureReasons || []).map((item, index) => <li key={`${item.reason}-${index}`}>{asText(item.reason)} · {String(item.count || 0)}x</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Sinais de melhoria</h4>
          <ul>{(state?.improvementSignals || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-block">
        <h4>Feedback recente</h4>
        <ul>{(state?.recentFeedback || []).slice(0, 5).map((item, index) => <li key={item.id || index}>{asText(item.title)} · {asText(item.outcome)} · {asText(item.reason)}</li>)}</ul>
      </div>
    </section>
  );
}
