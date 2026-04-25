import { useEffect, useState } from 'react';

type StrategicAutopriorityState = {
  autopriorityScore?: number;
  priorityMode?: string;
  highestPriorityMission?: string;
  recommendedSequence?: Array<string | Record<string, unknown>>;
  droppedPriorities?: Array<string | Record<string, unknown>>;
  strategicWeights?: Record<string, unknown>;
  topSignals?: Array<string | Record<string, unknown>>;
  recommendedAction?: string;
  alignmentStatus?: string;
  focusWindow?: string;
  runCount?: number;
  lastAutoprioritySummary?: string;
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

export default function StrategicAutopriorityPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<StrategicAutopriorityState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/strategic-autopriority/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar strategic autopriority');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar strategic autopriority'));
  }, [apiBase, refreshKey]);

  async function runPriority() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/strategic-autopriority/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar strategic autopriority');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar strategic autopriority');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Strategic Autopriority</h3>
        <button type="button" onClick={runPriority} disabled={running}>{running ? 'Priorizando...' : 'Rodar autoprioridade'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Score</span><strong>{String(state?.autopriorityScore || 0)}</strong></div>
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.priorityMode)}</strong></div>
        <div className="evo-card"><span>Alinhamento</span><strong>{asText(state?.alignmentStatus)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Missão prioritária</span><strong>{asText(state?.highestPriorityMission)}</strong></div>
        <div className="evo-card"><span>Janela de foco</span><strong>{asText(state?.focusWindow)}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.recommendedAction, 'Sem ação estratégica ainda.')}</p>
      <p className="evo-summary">{asText(state?.lastAutoprioritySummary, 'Nenhuma autoprioridade executada ainda.')}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Sequência recomendada</h4>
          <ul>{(state?.recommendedSequence || []).slice(0, 6).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Sinais principais</h4>
          <ul>{(state?.topSignals || []).slice(0, 6).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Prioridades descartadas</h4>
          <ul>{(state?.droppedPriorities || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Pesos estratégicos</h4>
          <ul>{Object.entries(state?.strategicWeights || {}).map(([key, value]) => <li key={key}>{`${key}: ${asText(value)}`}</li>)}</ul>
        </div>
      </div>
      <div className="evo-grid evo-grid--single">
        <div className="evo-card"><span>Execuções</span><strong>{String(state?.runCount || 0)}</strong></div>
      </div>
    </section>
  );
}
