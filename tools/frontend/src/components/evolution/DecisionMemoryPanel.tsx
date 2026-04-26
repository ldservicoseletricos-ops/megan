import { useEffect, useState } from 'react';

type Pattern = {
  createdAt?: string;
  brain?: string;
  patch?: string;
  plan?: string;
  healing?: string;
  validation?: string;
};

type DecisionState = {
  lastStableBrain?: string;
  lastStablePlanTitle?: string;
  lastStableValidation?: string;
  decisionSummary?: string;
  stablePatterns?: Pattern[];
  unstablePatterns?: Pattern[];
};

export default function DecisionMemoryPanel({ apiBase, refreshKey }: { apiBase: string; refreshKey: number }) {
  const [state, setState] = useState<DecisionState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(`${apiBase}/api/decision-memory/state`);
        const data = await response.json();
        if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar memória de decisão');
        if (active) setState(data.state || null);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Falha ao carregar memória de decisão');
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [apiBase, refreshKey]);

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Decision Memory</h3>
        <span>Padrões estáveis e instáveis</span>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Brain estável</span><strong>{state?.lastStableBrain || '—'}</strong></div>
        <div className="evo-card"><span>Plano estável</span><strong>{state?.lastStablePlanTitle || '—'}</strong></div>
        <div className="evo-card"><span>Validação</span><strong>{state?.lastStableValidation || '—'}</strong></div>
      </div>
      <p className="evo-summary">{state?.decisionSummary || 'Nenhum resumo consolidado.'}</p>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Estáveis</h4>
          <ul>{(state?.stablePatterns || []).slice(0, 4).map((item, index) => <li key={`stable-${index}`}>{item.validation || item.plan || item.brain || 'Padrão estável'}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Instáveis</h4>
          <ul>{(state?.unstablePatterns || []).slice(0, 4).map((item, index) => <li key={`unstable-${index}`}>{item.validation || item.plan || item.brain || 'Padrão instável'}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
