import { useEffect, useState } from 'react';

type DecisionItem = string | Record<string, unknown>;
type AttemptItem = string | Record<string, unknown>;

type MemoryState = {
  activeObjective?: string;
  activeContext?: string;
  missionSummary?: string;
  recentDecisions?: DecisionItem[];
  recentAttempts?: AttemptItem[];
  avoidList?: Array<string | Record<string, unknown>>;
  successPatterns?: Array<string | Record<string, unknown>>;
  updatedAt?: string | null;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return (
      asText(record.decision, '') ||
      asText(record.title, '') ||
      asText(record.attempt, '') ||
      asText(record.validation, '') ||
      asText(record.reason, '') ||
      asText(record.summary, '') ||
      JSON.stringify(record)
    );
  }
  return fallback;
}

function renderDecision(item: DecisionItem) {
  if (typeof item === 'string') return <strong>{item}</strong>;
  const createdAt = asText(item.createdAt, '');
  return (
    <>
      <strong>{asText(item.decision, 'Decisão registrada')}</strong>
      <small>{asText(item.validation, 'Sem validação')}</small>
      <small>{createdAt && createdAt !== '—' ? new Date(createdAt).toLocaleString('pt-BR') : ''}</small>
    </>
  );
}

export default function AdvancedMemoryPanel({ apiBase, refreshKey }: { apiBase: string; refreshKey: number }) {
  const [state, setState] = useState<MemoryState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBase}/api/advanced-memory/state`);
        const data = await response.json();
        if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar memória avançada');
        if (active) setState(data.state || null);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Falha ao carregar memória avançada');
      } finally {
        if (active) setLoading(false);
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
        <h3>Advanced Memory</h3>
        <span>{loading ? 'Atualizando...' : 'Memória operacional'}</span>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--single">
        <div className="evo-card"><span>Objetivo ativo</span><strong>{asText(state?.activeObjective)}</strong></div>
        <div className="evo-card"><span>Contexto ativo</span><strong>{asText(state?.activeContext)}</strong></div>
        <div className="evo-card"><span>Resumo</span><strong>{asText(state?.missionSummary)}</strong></div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Decisões recentes</h4>
          <ul>{(state?.recentDecisions || []).slice(0, 5).map((item, index) => <li key={index}>{renderDecision(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Padrões de sucesso</h4>
          <ul>{(state?.successPatterns || []).slice(0, 5).map((item, index) => <li key={index}>{asText(item)}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
