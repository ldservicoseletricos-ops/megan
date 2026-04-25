import { useEffect, useState } from 'react';

type Track = {
  id?: string;
  label?: string;
  owner?: string;
  status?: string;
  items?: string[];
};

type Campaign = {
  id?: string;
  title?: string;
  objective?: string;
  phase?: string;
  priority?: string;
  progress?: number;
  releaseWindow?: string;
  status?: string;
  tracks?: Track[];
};

type PlannerState = {
  activeCampaign?: Campaign | null;
  queuedCampaigns?: Campaign[];
  suggestedCampaigns?: Campaign[];
  campaignBudget?: number;
  releaseWindow?: string;
  planningMode?: string;
  plannerScore?: number;
  lastCampaignSummary?: string;
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

export default function EvolutionCampaignPlannerPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<PlannerState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/evolution-campaign-planner/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar evolution campaign planner');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar evolution campaign planner'));
  }, [apiBase, refreshKey]);

  async function runPlanner() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/evolution-campaign-planner/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar evolution campaign planner');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar evolution campaign planner');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Evolution Campaign Planner</h3>
        <button type="button" onClick={runPlanner} disabled={running}>{running ? 'Planejando...' : 'Planejar campanha'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.planningMode)}</strong></div>
        <div className="evo-card"><span>Janela</span><strong>{asText(state?.releaseWindow)}</strong></div>
        <div className="evo-card"><span>Score</span><strong>{String(state?.plannerScore || 0)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Campanha ativa</span><strong>{asText(state?.activeCampaign?.title, 'Nenhuma')}</strong></div>
        <div className="evo-card"><span>Orçamento</span><strong>{String(state?.campaignBudget || 0)}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.lastCampaignSummary, 'Nenhuma campanha de evolução planejada ainda.')}</p>
      <div className="evo-list-block">
        <h4>Trilhas da campanha ativa</h4>
        <ul>{(state?.activeCampaign?.tracks || []).slice(0, 5).map((track, index) => <li key={`${index}-${track.id || track.label || 'track'}`}>{asText(track.label)} · {asText(track.owner)} · {asText(track.items || [], '')}</li>)}</ul>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Fila de campanhas</h4>
          <ul>{(state?.queuedCampaigns || []).slice(0, 5).map((item, index) => <li key={`${index}-${item.id || item.title || 'queue'}`}>{asText(item.title)} · {asText(item.phase)} · {asText(item.priority)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Sugestões</h4>
          <ul>{(state?.suggestedCampaigns || []).slice(0, 5).map((item, index) => <li key={`${index}-${item.id || item.title || 'suggestion'}`}>{asText(item.title)} · {asText(item.objective)}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
