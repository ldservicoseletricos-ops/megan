import { useEffect, useState } from 'react';

type SupervisorState = {
  supervisionMode?: string;
  systemAlignment?: string;
  supervisorScore?: number;
  recommendedDirective?: string;
  activeCampaignId?: string | null;
  approvals?: Array<string | Record<string, unknown>>;
  blockers?: Array<string | Record<string, unknown>>;
  watchpoints?: Array<string | Record<string, unknown>>;
  consultedBrains?: Array<string | Record<string, unknown>>;
  lastSupervisionSummary?: string;
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

export default function GlobalSupervisorPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<SupervisorState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/global-supervisor/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar global supervisor');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar global supervisor'));
  }, [apiBase, refreshKey]);

  async function runSupervisor() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/global-supervisor/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar global supervisor');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar global supervisor');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Global Supervisor</h3>
        <button type="button" onClick={runSupervisor} disabled={running}>{running ? 'Supervisionando...' : 'Rodar supervisor'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.supervisionMode)}</strong></div>
        <div className="evo-card"><span>Alinhamento</span><strong>{asText(state?.systemAlignment)}</strong></div>
        <div className="evo-card"><span>Score</span><strong>{String(state?.supervisorScore || 0)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Diretriz</span><strong>{asText(state?.recommendedDirective)}</strong></div>
        <div className="evo-card"><span>Campanha ativa</span><strong>{asText(state?.activeCampaignId, 'Nenhuma')}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.lastSupervisionSummary, 'Nenhuma supervisão global executada ainda.')}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Aprovações</h4>
          <ul>{(state?.approvals || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Bloqueios</h4>
          <ul>{(state?.blockers || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Pontos de atenção</h4>
          <ul>{(state?.watchpoints || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Cérebros consultados</h4>
          <ul>{(state?.consultedBrains || []).slice(0, 8).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
