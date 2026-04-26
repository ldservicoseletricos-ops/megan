import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 5.1 — MARKETPLACE DE AGENTES',
  focus: 'Usuários compram, instalam, agregam e operam agentes especializados por área de negócio.',
  readiness: { score: 0, status: 'preview', risk: 'supervisionado', nextRelease: '5.2' },
  metrics: { publishedAgents: 0, installedAgents: 0, activeSubscriptions: 0, monthlyAgentRevenue: 0, averageRating: 0, supervisedRuns: 0, categories: 0 },
  categories: [], customers: [], agents: [], installed: [], workflow: [], activity: [], demoRuns: []
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function MetricCard({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function AgentCard({ agent, onPurchase, onRunDemo, disabled }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{agent.name}</strong><span>{agent.category}</span></div>
      <p>{agent.description}</p>
      <footer><em>{formatMoney(agent.price)}/mês • ⭐ {agent.rating} • risco {agent.risk}</em><b>{agent.installs} instalações</b></footer>
      <div className="autoempresa-actions compact-actions">
        <button type="button" onClick={() => onPurchase(agent.id)} disabled={disabled}>Comprar/agregar</button>
        <button type="button" className="ghost" onClick={() => onRunDemo(agent.id)} disabled={disabled}>Rodar demo</button>
      </div>
    </article>
  );
}

function InstalledCard({ item, agents, customers }) {
  const agent = agents.find((entry) => entry.id === item.agentId);
  const customer = customers.find((entry) => entry.id === item.customerId);
  return <article className="autoempresa-lead-card"><div><strong>{agent?.name || item.agentId}</strong><span>{item.status}</span></div><p>{customer?.name || item.customerId} • assento {item.seat}</p><footer><em>{item.installedAt ? new Date(item.installedAt).toLocaleString('pt-BR') : 'ativo'}</em><b>{formatMoney(item.monthlyValue)}/mês</b></footer></article>;
}

function WorkflowCard({ item }) {
  return <article className="autoempresa-lead-card"><div><strong>{item.title}</strong><span>{item.status}</span></div><p>{item.detail}</p><footer><em>{item.id}</em><b>5.1</b></footer></article>;
}

function ActivityCard({ item }) {
  return <article className="autoempresa-lead-card"><div><strong>{item.title}</strong><span>{item.type}</span></div><p>{item.detail}</p><footer><em>{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'agora'}</em><b>log</b></footer></article>;
}

function DemoCard({ item, agents }) {
  const agent = agents.find((entry) => entry.id === item.agentId);
  return <article className="autoempresa-lead-card"><div><strong>{item.title}</strong><span>{item.status}</span></div><p>{item.outcome}</p><footer><em>{agent?.name || item.agentId}</em><b>{(item.approvalsRequired || []).length} aprovações</b></footer></article>;
}

export default function AgentMarketplacePage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [category, setCategory] = useState('todos');
  const [customerId, setCustomerId] = useState('');
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/agent-marketplace/dashboard');
      setDashboard(data || fallbackDashboard);
      if (!customerId && data?.customers?.[0]?.id) setCustomerId(data.customers[0].id);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o Marketplace de Agentes.');
      setDashboard(fallbackDashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function purchaseAgent(agentId) {
    setWorking(true);
    try {
      await apiPost('/api/agent-marketplace/agents/purchase', { agentId, customerId, seat: 'operacao' });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao comprar/agregar agente.');
    } finally {
      setWorking(false);
    }
  }

  async function runDemo(agentId) {
    setWorking(true);
    try {
      await apiPost('/api/agent-marketplace/agents/run-demo', { agentId, customerId });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao rodar demo do agente.');
    } finally {
      setWorking(false);
    }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const readiness = dashboard.readiness || fallbackDashboard.readiness;
  const filteredAgents = useMemo(() => {
    const agents = dashboard.agents || [];
    if (category === 'todos') return agents;
    return agents.filter((agent) => agent.category === category);
  }, [dashboard.agents, category]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 5.1</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={loadDashboard} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar marketplace'}</button>
            <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              {(dashboard.customers || []).map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Agentes vendáveis</strong><b>{readiness.score}%</b><span>{readiness.status} • {readiness.risk}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Agentes" value={metrics.publishedAgents} caption="publicados no marketplace" />
        <MetricCard label="Instalados" value={metrics.installedAgents} caption="agentes agregados" />
        <MetricCard label="Assinaturas" value={metrics.activeSubscriptions} caption="ativas por agente" />
        <MetricCard label="Receita agentes" value={formatMoney(metrics.monthlyAgentRevenue)} caption="MRR por marketplace" />
        <MetricCard label="Avaliação" value={metrics.averageRating} caption="média dos agentes" />
        <MetricCard label="Execuções" value={metrics.supervisedRuns} caption="runs supervisionados" />
        <MetricCard label="Categorias" value={metrics.categories} caption="verticais vendáveis" />
      </section>

      <section className="autoempresa-panel">
        <div className="autoempresa-panel-title"><span>Catálogo de agentes</span><strong>Comprar/agregar por categoria</strong></div>
        <div className="autoempresa-actions category-filter">
          <button className={category === 'todos' ? '' : 'ghost'} onClick={() => setCategory('todos')}>Todos</button>
          {(dashboard.categories || []).map((item) => <button key={item} className={category === item ? '' : 'ghost'} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="autoempresa-leads-list autoempresa-grid-list">
          {filteredAgents.map((agent) => <AgentCard key={agent.id} agent={agent} onPurchase={purchaseAgent} onRunDemo={runDemo} disabled={working || !customerId} />)}
        </div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Agentes instalados</span><strong>Assinaturas ativas por empresa</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.installed || []).map((item) => <InstalledCard key={item.id} item={item} agents={dashboard.agents || []} customers={dashboard.customers || []} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Fluxo de venda</span><strong>Como o marketplace opera</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.workflow || []).map((item) => <WorkflowCard key={item.id} item={item} />)}</div>
        </div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Demos supervisionadas</span><strong>Execuções recentes dos agentes</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.demoRuns || []).slice(0, 8).map((item) => <DemoCard key={item.id} item={item} agents={dashboard.agents || []} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Atividade</span><strong>Logs auditáveis 5.1</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.activity || []).slice(0, 8).map((item) => <ActivityCard key={item.id} item={item} />)}</div>
        </div>
      </section>
    </div>
  );
}
