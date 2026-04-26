import { useEffect, useState } from 'react';

type StrategicForecastState = {
  updatedAt?: string | null;
  horizon?: string;
  confidence?: number;
  primaryForecast?: string;
  opportunities?: string[];
  risks?: string[];
  recommendedMoves?: string[];
  trendSignals?: string[];
};

export default function StrategicForecastPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh?: () => void }) {
  const [state, setState] = useState<StrategicForecastState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/strategic-forecast/state`);
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar previsão estratégica');
      setState(data.state || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar previsão estratégica');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [apiBase, refreshKey]);

  async function runForecast() {
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/strategic-forecast/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horizon: '60d',
          opportunities: [
            'Consolidar a base antes de abrir novos módulos',
            'Transformar missão contínua em rotina estável'
          ],
          risks: [
            'Muitos pacotes sem validação completa',
            'Acoplamento crescente no frontend'
          ],
          trendSignals: [
            'Estabilidade aumentou o valor percebido',
            'Memória executiva tende a reduzir retrabalho'
          ]
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao gerar previsão estratégica');
      setState(data.state || null);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar previsão estratégica');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Strategic Forecast</h3>
        <span>{loading ? 'Atualizando...' : 'Previsão estratégica da evolução'}</span>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--single">
        <div className="evo-card"><span>Horizonte</span><strong>{state?.horizon || '—'}</strong></div>
        <div className="evo-card"><span>Confiança</span><strong>{String(state?.confidence ?? 0)}</strong></div>
        <div className="evo-card"><span>Forecast principal</span><strong>{state?.primaryForecast || '—'}</strong></div>
      </div>
      <div className="action-row">
        <button className="btn btn--primary" onClick={runForecast} disabled={running}>{running ? 'Gerando…' : 'Gerar previsão'}</button>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Oportunidades</h4>
          <ul>{(state?.opportunities || []).slice(0, 5).map((item, index) => <li key={index}>{item}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Riscos</h4>
          <ul>{(state?.risks || []).slice(0, 5).map((item, index) => <li key={index}>{item}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
