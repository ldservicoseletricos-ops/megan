import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 4.5 — APRENDIZADO CONTÍNUO REAL',
  status: 'offline_preview',
  focus: 'Megan aprende com o uso diário, detecta padrões, prevê necessidades, melhora respostas, otimiza rotinas e aprende preferências.',
  learningScore: 0,
  metrics: { events: 0, patterns: 0, predictions: 0, optimizations: 0, preferences: 0 },
  patterns: [], predictions: [], preferences: {}, optimizations: [], responseImprovements: []
};

function MetricCard({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function InsightCard({ item, type }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{item.label || item.need || item.area || item.rule || type}</strong><span>{item.confidence ? `${item.confidence}%` : type}</span></div>
      <p>{item.evidence || item.action || item.suggestion || item.impact || item.rule}</p>
      <footer><em>{type}</em><b>{item.active === false ? 'pausado' : 'ativo'}</b></footer>
    </article>
  );
}

export default function ContinuousLearningPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/continuous-learning/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar aprendizado contínuo.');
      setDashboard(fallbackDashboard);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function runLearningCycle() {
    setRunning(true);
    try {
      await apiPost('/api/continuous-learning/learning-cycle', { context: 'uso diário do projeto Megan OS 4.5' });
      await apiPost('/api/continuous-learning/record-use', { type: 'preferencia', text: 'Usuário quer continuidade, ZIP validado e arquivos completos.', weight: 97 });
      await loadDashboard();
    } catch (err) { setError(err.message || 'Falha ao executar ciclo de aprendizado.'); }
    finally { setRunning(false); }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const preferenceList = useMemo(() => Object.entries(dashboard.preferences || {}), [dashboard.preferences]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 4.5</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={runLearningCycle} disabled={running}>{running ? 'Aprendendo...' : 'Executar ciclo de aprendizado'}</button>
            <button className="ghost" onClick={loadDashboard} disabled={loading}>Atualizar memória aprendida</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Score de aprendizado</strong><b>{dashboard.learningScore || 0}%</b><span>{dashboard.status}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Eventos aprendidos" value={metrics.events} caption="uso diário registrado" />
        <MetricCard label="Padrões detectados" value={metrics.patterns} caption="com confiança calculada" />
        <MetricCard label="Necessidades previstas" value={metrics.predictions} caption="ações antecipadas" />
        <MetricCard label="Rotinas otimizadas" value={metrics.optimizations} caption="menos repetição" />
        <MetricCard label="Preferências" value={metrics.preferences} caption="estilo do Luiz aplicado" />
        <MetricCard label="Melhoria de respostas" value={(dashboard.responseImprovements || []).length} caption="regras ativas" />
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Padrões seus</span><strong>Detectados pela Megan</strong></div>
          <div className="autoempresa-leads-list">
            {(dashboard.patterns || []).slice(0, 6).map((item) => <InsightCard key={item.id} item={item} type="padrão" />)}
          </div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Previsão e preferência</span><strong>Próximas necessidades</strong></div>
          <div className="autoempresa-leads-list">
            {(dashboard.predictions || []).slice(0, 4).map((item) => <InsightCard key={item.id} item={item} type="previsão" />)}
          </div>
          <div className="autoempresa-capabilities" style={{ marginTop: 16 }}>
            {preferenceList.map(([key, value]) => <em key={key}>{key}: {String(value)}</em>)}
          </div>
        </div>
      </section>
    </div>
  );
}
