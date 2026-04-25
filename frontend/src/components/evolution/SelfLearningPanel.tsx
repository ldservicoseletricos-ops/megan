import { useEffect, useState } from 'react';

type Weight = { name?: string; value?: number; detail?: string };
type LearningItem = string | Record<string, unknown>;

type LearningState = {
  evolutionScore?: number;
  nextLearningOpportunity?: string;
  recentLearnings?: LearningItem[];
  appliedImprovements?: LearningItem[];
  lessonsLearned?: LearningItem[];
  adjustedWeights?: Weight[];
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return (
      asText(record.title, '') ||
      asText(record.learning, '') ||
      asText(record.improvement, '') ||
      asText(record.reason, '') ||
      asText(record.detail, '') ||
      JSON.stringify(record)
    );
  }
  return fallback;
}

export default function SelfLearningPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<LearningState | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/learning/state`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar learning');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar learning'));
  }, [apiBase, refreshKey]);

  async function runCycle() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/learning/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao rodar learning');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao rodar learning');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Learning Loop</h3>
        <button type="button" onClick={runCycle} disabled={running}>{running ? 'Executando...' : 'Rodar ciclo'}</button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--double">
        <div className="evo-card"><span>Evolution score</span><strong>{String(state?.evolutionScore || 0)}</strong></div>
        <div className="evo-card"><span>Próxima oportunidade</span><strong>{asText(state?.nextLearningOpportunity)}</strong></div>
      </div>
      <div className="evo-list-grid">
        <div className="evo-list-block">
          <h4>Learnings</h4>
          <ul>{(state?.recentLearnings || []).slice(0, 4).map((item, index) => <li key={`learning-${index}`}>{asText(item)}</li>)}</ul>
        </div>
        <div className="evo-list-block">
          <h4>Melhorias</h4>
          <ul>{(state?.appliedImprovements || []).slice(0, 4).map((item, index) => <li key={`improvement-${index}`}>{asText(item)}</li>)}</ul>
        </div>
      </div>
      <div className="weights-list">
        {(state?.adjustedWeights || []).slice(0, 3).map((item, index) => (
          <div className="weight-item" key={`${item.name}-${index}`}>
            <strong>{item.name || 'weight'}</strong>
            <span>{String(item.value || 0)}</span>
            <small>{item.detail || ''}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
