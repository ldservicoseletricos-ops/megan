import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 4.3 — AUTOEMPRESA',
  status: 'offline_preview',
  focus: 'Megan opera negócios semi-autônomos com supervisão humana.',
  capabilities: ['captar leads', 'responder clientes', 'propostas automáticas', 'follow-up', 'cobrança', 'métricas', 'CRM vivo'],
  metrics: {
    leadsCaptured: 0,
    hotLeads: 0,
    proposalsReady: 0,
    followUpsScheduled: 0,
    billingActions: 0,
    openPipeline: 0,
    proposalValue: 0,
    pendingBilling: 0,
    crmHealth: 'waiting_backend',
  },
  crm: { leads: [], proposals: [], followUps: [], billing: [], activity: [] },
};

function currency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function MetricCard({ label, value, caption }) {
  return (
    <article className="autoempresa-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

function LeadCard({ lead }) {
  return (
    <article className="autoempresa-lead-card">
      <div>
        <strong>{lead.company || lead.name}</strong>
        <span>{lead.channel} • score {lead.score}</span>
      </div>
      <p>{lead.need}</p>
      <footer>
        <em>{lead.stage}</em>
        <b>{currency(lead.valueEstimate)}</b>
      </footer>
    </article>
  );
}

export default function AutoempresaPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/autoempresa/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar AUTOEMPRESA.');
      setDashboard(fallbackDashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function runDemoCycle() {
    setRunning(true);
    try {
      await apiPost('/api/autoempresa/business-cycle', {
        company: 'Empresa Demonstração AUTOEMPRESA',
        channel: 'WhatsApp',
        need: 'captar clientes, responder rápido, vender e cobrar com CRM vivo',
        valueEstimate: 3500,
        score: 91,
      });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao executar ciclo AUTOEMPRESA.');
    } finally {
      setRunning(false);
    }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const crm = dashboard.crm || fallbackDashboard.crm;
  const topLeads = useMemo(() => (crm.leads || []).slice(0, 6), [crm.leads]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 4.3</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={runDemoCycle} disabled={running}>
              {running ? 'Executando ciclo...' : 'Executar ciclo comercial demo'}
            </button>
            <button className="ghost" onClick={loadDashboard} disabled={loading}>Atualizar CRM vivo</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside>
          <strong>Status comercial</strong>
          <b>{dashboard.status}</b>
          <span>Produto vendável para empresas imediatamente.</span>
        </aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Leads captados" value={metrics.leadsCaptured} caption={`${metrics.hotLeads} leads quentes`} />
        <MetricCard label="Pipeline aberto" value={currency(metrics.openPipeline)} caption="valor estimado em negociação" />
        <MetricCard label="Propostas" value={metrics.proposalsReady} caption={currency(metrics.proposalValue)} />
        <MetricCard label="Follow-ups" value={metrics.followUpsScheduled} caption="agenda comercial viva" />
        <MetricCard label="Cobranças" value={metrics.billingActions} caption={currency(metrics.pendingBilling)} />
        <MetricCard label="CRM" value={metrics.crmHealth} caption="vivo e atualizável" />
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title">
            <span>CRM vivo</span>
            <strong>Leads em movimento</strong>
          </div>
          <div className="autoempresa-leads-list">
            {topLeads.length ? topLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />) : <p>Nenhum lead carregado ainda.</p>}
          </div>
        </div>

        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title">
            <span>Operação semi-autônoma</span>
            <strong>Capacidades ativas</strong>
          </div>
          <div className="autoempresa-capabilities">
            {(dashboard.capabilities || []).map((item) => <em key={item}>{item}</em>)}
          </div>
          <div className="autoempresa-activity">
            {(crm.activity || []).slice(0, 6).map((item) => (
              <article key={item.id}>
                <b>{item.type}</b>
                <span>{item.text}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
