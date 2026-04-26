import { useEffect, useState } from 'react';

type ModeState = {
  selectedMode?: string;
  modeLabel?: string;
  rationale?: string;
  changeCount?: number;
  history?: Array<{ mode?: string; changedAt?: string } | Record<string, unknown>>;
};

function asText(value: unknown, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => asText(item, '')).filter(Boolean).join(' · ') || fallback;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return asText(record.mode, '') || asText(record.title, '') || JSON.stringify(record);
  }
  return fallback;
}

export default function EvolutionModePanel({ apiBase, refreshKey, onRefresh }: { apiBase: string; refreshKey: number; onRefresh: () => void }) {
  const [state, setState] = useState<ModeState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const response = await fetch(`${apiBase}/api/evolution-mode/state?userId=luiz`);
    const data = await response.json();
    if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao carregar modo de evolução');
    setState(data.state || null);
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Falha ao carregar modo de evolução'));
  }, [apiBase, refreshKey]);

  async function setMode(mode: string) {
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBase}/api/evolution-mode/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'luiz', mode })
      });
      const data = await response.json();
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Falha ao alterar modo');
      setState(data.state || null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao alterar modo');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="evo-panel">
      <div className="evo-panel__header">
        <h3>Evolution Mode</h3>
        <span>{saving ? 'Aplicando…' : 'Seguro · supervisionado · agressivo'}</span>
      </div>
      {error ? <p className="panel-error">{error}</p> : null}
      <div className="evo-grid evo-grid--single">
        <div className="evo-card"><span>Modo atual</span><strong>{asText(state?.modeLabel, 'Seguro guiado')}</strong></div>
        <div className="evo-card"><span>Identificador</span><strong>{asText(state?.selectedMode, 'guided_safe')}</strong></div>
        <div className="evo-card"><span>Trocas realizadas</span><strong>{asText(state?.changeCount, '0')}</strong></div>
      </div>
      <p className="evo-summary">{asText(state?.rationale)}</p>
      <div className="action-row action-row--wrap">
        <button type="button" className="btn btn--ghost" onClick={() => setMode('guided_safe')} disabled={saving}>Seguro guiado</button>
        <button type="button" className="btn btn--ghost" onClick={() => setMode('supervised')} disabled={saving}>Supervisionado</button>
        <button type="button" className="btn btn--ghost" onClick={() => setMode('aggressive')} disabled={saving}>Agressivo controlado</button>
      </div>
      <div className="evo-list-block">
        <h4>Histórico</h4>
        <ul>{(state?.history || []).slice(0, 5).map((item, index) => <li key={index}>{asText(item)}</li>)}</ul>
      </div>
    </section>
  );
}
