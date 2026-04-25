import { useEffect, useState } from 'react';

type ContinuousAutonomyState = {
  autonomyMode?: string;
  cadence?: string;
  autonomyScore?: number;
  currentDirective?: string;
  currentFocus?: string;
  nextCycleAction?: string;
  stopReasons?: Array<string | Record<string, unknown>>;
  operatingWindow?: string;
  loopReady?: boolean;
  optimizerAligned?: boolean;
  cycleCount?: number;
  lastCycleSummary?: string;
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

export default function ContinuousAutonomyPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<ContinuousAutonomyState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/continuous-autonomy/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar continuous autonomy');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar continuous autonomy'));
  }, [apiBase, refreshKey]);

  async function runAutonomy() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/continuous-autonomy/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', source: 'frontend_panel' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao executar continuous autonomy');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao executar continuous autonomy');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Continuous Autonomy</h3>
        <button type="button" onClick={runAutonomy} disabled={running}>{running ? 'Executando...' : 'Rodar autonomia'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Modo</span><strong>{asText(state?.autonomyMode)}</strong></div>
        <div className="evo-card"><span>Cadência</span><strong>{asText(state?.cadence)}</strong></div>
        <div className="evo-card"><span>Score</span><strong>{String(state?.autonomyScore || 0)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Foco atual</span><strong>{asText(state?.currentFocus)}</strong></div>
        <div className="evo-card"><span>Janela</span><strong>{asText(state?.operatingWindow)}</strong></div>
      </div>
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Próxima ação</span><strong>{asText(state?.nextCycleAction)}</strong></div>
        <div className="evo-card"><span>Loop pronto</span><strong>{state?.loopReady ? 'Sim' : 'Não'}</strong><small>{state?.optimizerAligned ? 'Alinhado ao otimizador' : 'Ainda desalinhado com recursos'}</small></div>
      </div>
      <p className="evo-summary">{asText(state?.currentDirective, 'Nenhuma diretriz contínua registrada.')}</p>
      <p className="evo-summary">{asText(state?.lastCycleSummary, 'Nenhum ciclo contínuo executado ainda.')}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Razões de parada</h4>
          <ul>{(state?.stopReasons || []).slice(0, 6).map((item, index) => <li key={`${index}-${asText(item)}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Ciclos executados</h4>
          <ul><li>{String(state?.cycleCount || 0)}</li></ul>
        </div>
      </div>
    </section>
  );
}
