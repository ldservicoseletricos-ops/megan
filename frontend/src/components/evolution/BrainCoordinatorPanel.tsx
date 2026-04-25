import { useEffect, useState } from 'react';

type CoordinatorState = {
  leadBrain?: string;
  leadReason?: string;
  supportBrains?: Array<string | Record<string, unknown>>;
  observers?: Array<string | Record<string, unknown>>;
  riskLevel?: string;
  confidence?: number;
  blockers?: Array<string | Record<string, unknown>>;
  coordinationSummary?: string;
  consultedModules?: Array<string | Record<string, unknown>>;
  cycleCount?: number;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.name, '') || asText(record.title, '') || asText(record.reason, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function BrainCoordinatorPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<CoordinatorState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/brain-coordinator/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar coordenação');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar coordenação'));
  }, [apiBase, refreshKey]);

  async function runCoordinator() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/brain-coordinator/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar coordenação');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar coordenação');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Brain Coordinator</h3>
        <button type="button" onClick={runCoordinator} disabled={running}>{running ? 'Coordenando...' : 'Rodar coordenação'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Cérebro líder</span><strong>{state?.leadBrain || 'operational'}</strong></div>
        <div className="evo-card"><span>Risco</span><strong>{state?.riskLevel || 'controlled'}</strong></div>
        <div className="evo-card"><span>Confiança</span><strong>{String(state?.confidence || 0)}%</strong></div>
      </div>
      <p className="evo-summary">{state?.leadReason || state?.coordinationSummary || 'Sem coordenação registrada ainda.'}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Cérebros de apoio</h4>
          <ul>{(state?.supportBrains || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Observadores</h4>
          <ul>{(state?.observers || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-block">
        <h4>Bloqueios preventivos</h4>
        <ul>{(state?.blockers || []).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
      </div>
    </section>
  );
}
