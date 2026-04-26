import { useEffect, useState } from 'react';

type Proposal = {
  id?: string;
  title?: string;
  rationale?: string;
  priority?: string;
  impact?: string;
  confidence?: number;
  source?: string;
  safeToApply?: boolean;
  status?: string;
  suggestedAction?: string;
};

type ProposalState = {
  activeFocus?: string;
  proposals?: Proposal[];
  proposalStats?: {
    totalGenerated?: number;
    totalApplied?: number;
    totalSafe?: number;
  };
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return fallback;
}

export default function ImprovementProposalsPanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<ProposalState | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const response = await fetch(`${apiBase}/api/improvement-proposals/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar improvement proposals');
    setState(data.state || null);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((err) => {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Falha ao carregar improvement proposals');
    });
  }, [apiBase, refreshKey]);

  async function generate() {
    if (running) return;
    setRunning(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/improvement-proposals/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz' })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao gerar proposals');
      await load();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar proposals');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Improvement Proposals</h3>
        <button type="button" className="btn btn--ghost" onClick={generate} disabled={running}>
          {running ? 'Gerando…' : 'Gerar propostas'}
        </button>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--triple">
        <div className="evo-card"><span>Foco ativo</span><strong>{asText(state?.activeFocus)}</strong></div>
        <div className="evo-card"><span>Geradas</span><strong>{String(state?.proposalStats?.totalGenerated || 0)}</strong></div>
        <div className="evo-card"><span>Seguras</span><strong>{String(state?.proposalStats?.totalSafe || 0)}</strong></div>
      </div>
      <div className="evo-list-block">
        <h4>{loading ? 'Atualizando propostas…' : 'Propostas atuais'}</h4>
        <ul>
          {(state?.proposals || []).slice(0, 6).map((item, index) => (
            <li key={item.id || index}>
              <strong>{asText(item.title)}</strong>
              <small>{asText(item.rationale)}</small>
              <small>{asText(item.priority)} · impacto {asText(item.impact)} · confiança {String(item.confidence || 0)}%</small>
              <small>{item.safeToApply ? 'segura para aplicar' : 'requer validação manual'} · {asText(item.suggestedAction)}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
