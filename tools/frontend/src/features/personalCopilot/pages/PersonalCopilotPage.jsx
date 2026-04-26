import React, { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 4.4 — COPILOTO PESSOAL TOTAL',
  status: 'offline_preview',
  focus: 'Sua vida organizada com agenda, metas, foco diário, saúde, finanças, lembretes e decisões assistidas.',
  metrics: { agenda: 0, goals: 0, reminders: 0, decisions: 0 },
};

function Card({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

export default function PersonalCopilotPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/personal-copilot/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o Copiloto Pessoal.');
      setDashboard(fallbackDashboard);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function runCycle() {
    setRunning(true);
    try {
      await apiPost('/api/personal-copilot/life-cycle', { focus: 'organizar vida, metas, saúde, finanças e lembretes reais' });
      await loadDashboard();
    } catch (err) { setError(err.message || 'Falha ao executar ciclo pessoal.'); }
    finally { setRunning(false); }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 4.4</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={runCycle} disabled={running}>{running ? 'Organizando...' : 'Executar ciclo pessoal'}</button>
            <button className="ghost" onClick={loadDashboard} disabled={loading}>Atualizar painel</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Status pessoal</strong><b>{dashboard.status}</b><span>Vida organizada com supervisão.</span></aside>
      </section>
      <section className="autoempresa-grid-metrics">
        <Card label="Agenda" value={metrics.agenda || 0} caption="compromissos inteligentes" />
        <Card label="Metas" value={metrics.goals || 0} caption="prioridades pessoais" />
        <Card label="Lembretes" value={metrics.reminders || 0} caption="ações reais" />
        <Card label="Decisões" value={metrics.decisions || 0} caption="assistidas pela Megan" />
      </section>
      <section className="autoempresa-panel">
        <div className="autoempresa-panel-title"><span>Copiloto pessoal</span><strong>Áreas ativas</strong></div>
        <div className="autoempresa-capabilities">
          {['agenda inteligente','metas','foco diário','saúde','finanças pessoais','lembretes reais','decisões assistidas'].map((item) => <em key={item}>{item}</em>)}
        </div>
      </section>
    </div>
  );
}
