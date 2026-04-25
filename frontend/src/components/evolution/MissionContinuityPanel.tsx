import { useEffect, useState } from 'react';

type MissionContinuityState = {
  continuityScore?: number;
  missionStatus?: string;
  activeMission?: string;
  missionChain?: Array<string | Record<string, unknown>>;
  nextMilestone?: string;
  interruptionRisk?: string;
  resilienceLevel?: string;
  continuityDirective?: string;
  carryOverContext?: Array<string | Record<string, unknown>>;
  blockedDependencies?: Array<string | Record<string, unknown>>;
  resumptionChecklist?: Array<string | Record<string, unknown>>;
  resumeReady?: boolean;
  runCount?: number;
  lastContinuitySummary?: string;
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

export default function MissionContinuityPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<MissionContinuityState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/mission-continuity/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar mission continuity');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar mission continuity'));
  }, [apiBase, refreshKey]);

  async function runMission() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/mission-continuity/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar mission continuity');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar mission continuity');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Mission Continuity</h3>
        <button type="button" onClick={runMission} disabled={running}>{running ? 'Analisando...' : 'Rodar continuidade'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Score</span><strong>{String(state?.continuityScore || 0)}</strong></div>
        <div className="evo-card"><span>Status</span><strong>{asText(state?.missionStatus)}</strong></div>
        <div className="evo-card"><span>Risco</span><strong>{asText(state?.interruptionRisk)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Missão ativa</span><strong>{asText(state?.activeMission)}</strong></div>
        <div className="evo-card"><span>Próximo marco</span><strong>{asText(state?.nextMilestone)}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.continuityDirective, 'Sem diretriz de continuidade ainda.')}</p>
      <p className="evo-summary">{asText(state?.lastContinuitySummary, 'Nenhuma análise executada ainda.')}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Cadeia da missão</h4>
          <ul>{(state?.missionChain || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Contexto carregado</h4>
          <ul>{(state?.carryOverContext || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Dependências bloqueadas</h4>
          <ul>{(state?.blockedDependencies || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Checklist de retomada</h4>
          <ul>{(state?.resumptionChecklist || []).slice(0, 5).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Retomada pronta</span><strong>{state?.resumeReady ? 'Sim' : 'Não'}</strong></div>
        <div className="evo-card"><span>Execuções</span><strong>{String(state?.runCount || 0)}</strong></div>
      </div>
    </section>
  );
}
