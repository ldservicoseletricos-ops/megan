import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 5.0 — ECOSSISTEMA MEGAN OS',
  focus: 'Produto vendável mundial com multiusuário, multiempresa, planos mensais, marketplace de módulos e white-label.',
  readiness: { score: 0, status: 'preview', market: 'Brasil + internacional', risk: 'controlado', nextRelease: '5.1' },
  metrics: { companies: 0, users: 0, activePlans: 0, monthlyRecurringRevenue: 0, marketplaceModules: 0, installedModules: 0, whiteLabelBrands: 0, countriesReady: 0 },
  tenants: [], users: [], plans: [], marketplace: [], whiteLabels: [], revenueStreams: [], worldChecklist: [], activity: []
};

function formatMoney(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function MetricCard({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function TenantCard({ tenant }) {
  return <article className="autoempresa-lead-card"><div><strong>{tenant.name}</strong><span>{tenant.status}</span></div><p>{tenant.segment} • {tenant.country} • {tenant.users} usuários</p><footer><em>{tenant.plan}</em><b>{formatMoney(tenant.mrr)}/mês</b></footer></article>;
}

function PlanCard({ plan, onSubscribe, disabled }) {
  return <article className="autoempresa-lead-card"><div><strong>{plan.name}</strong><span>{formatMoney(plan.price)}/mês</span></div><p>{plan.target}</p><footer><em>{(plan.modules || []).slice(0, 3).join(' • ')}</em><button type="button" onClick={() => onSubscribe(plan.id)} disabled={disabled}>Ativar</button></footer></article>;
}

function ModuleCard({ item, onInstall, disabled }) {
  return <article className="autoempresa-lead-card"><div><strong>{item.name}</strong><span>{item.category}</span></div><p>{item.description}</p><footer><em>{item.status} • {item.installs} instalações</em><button type="button" onClick={() => onInstall(item.id)} disabled={disabled}>Instalar</button></footer></article>;
}

function WhiteLabelCard({ item }) {
  return <article className="autoempresa-lead-card"><div><strong>{item.brandName}</strong><span>{item.status}</span></div><p>{item.domain}</p><footer><em>{item.companyId}</em><b>{item.accent}</b></footer></article>;
}

function ChecklistCard({ item }) {
  return <article className="autoempresa-lead-card"><div><strong>{item.title}</strong><span>{item.status}</span></div><p>{item.action}</p><footer><em>{item.id}</em><b>{item.lastCheckedAt ? 'verificado' : 'pronto'}</b></footer></article>;
}

function ActivityCard({ item }) {
  return <article className="autoempresa-lead-card"><div><strong>{item.title}</strong><span>{item.type}</span></div><p>{item.detail}</p><footer><em>{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'agora'}</em><b>5.0</b></footer></article>;
}

export default function EcosystemPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [tenant, setTenant] = useState({ name: 'Nova Empresa Cliente', segment: 'Vendas e atendimento', country: 'BR', plan: 'Business Pro', users: 3, mrr: 497, whiteLabel: false });
  const [whiteLabel, setWhiteLabel] = useState({ brandName: 'Megan Partner', domain: 'app.parceiro.com', accent: 'emerald' });

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/ecosystem/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o Ecossistema Megan OS.');
      setDashboard(fallbackDashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function createTenant(event) {
    event.preventDefault();
    setWorking(true);
    try {
      await apiPost('/api/ecosystem/tenant', tenant);
      setTenant({ name: '', segment: 'Vendas e atendimento', country: 'BR', plan: 'Business Pro', users: 1, mrr: 497, whiteLabel: false });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao criar empresa.');
    } finally {
      setWorking(false);
    }
  }

  async function subscribePlan(planId) {
    setWorking(true);
    try {
      await apiPost('/api/ecosystem/plan/subscribe', { companyId: dashboard.tenants?.[0]?.id, planId });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao ativar plano.');
    } finally {
      setWorking(false);
    }
  }

  async function installModule(moduleId) {
    setWorking(true);
    try {
      await apiPost('/api/ecosystem/marketplace/install', { companyId: dashboard.tenants?.[0]?.id, moduleId });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao instalar módulo.');
    } finally {
      setWorking(false);
    }
  }

  async function applyWhiteLabel(event) {
    event.preventDefault();
    setWorking(true);
    try {
      await apiPost('/api/ecosystem/white-label/apply', { companyId: dashboard.tenants?.[0]?.id, ...whiteLabel });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao aplicar white-label.');
    } finally {
      setWorking(false);
    }
  }

  async function runChecklist() {
    setWorking(true);
    try {
      await apiPost('/api/ecosystem/world-ready/checklist', {});
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao executar checklist mundial.');
    } finally {
      setWorking(false);
    }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const readiness = dashboard.readiness || fallbackDashboard.readiness;
  const mrrLabel = useMemo(() => formatMoney(metrics.monthlyRecurringRevenue), [metrics.monthlyRecurringRevenue]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 5.0</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={loadDashboard} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar ecossistema'}</button>
            <button className="ghost" onClick={runChecklist} disabled={working}>Checklist mundial</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Produto mundial</strong><b>{readiness.score}%</b><span>{readiness.status} • {readiness.market}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Empresas" value={metrics.companies} caption="tenants no ecossistema" />
        <MetricCard label="Usuários" value={metrics.users} caption="multiusuário ativo" />
        <MetricCard label="Planos" value={metrics.activePlans} caption="assinaturas mensais" />
        <MetricCard label="MRR" value={mrrLabel} caption="receita recorrente mensal" />
        <MetricCard label="Marketplace" value={metrics.marketplaceModules} caption="módulos vendáveis" />
        <MetricCard label="Instalações" value={metrics.installedModules} caption="módulos aplicados" />
        <MetricCard label="White-label" value={metrics.whiteLabelBrands} caption="marcas configuradas" />
        <MetricCard label="Países" value={metrics.countriesReady} caption="prontos para expansão" />
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Multiempresa</span><strong>Criar nova empresa cliente</strong></div>
          <form className="autoempresa-form" onSubmit={createTenant}>
            <input value={tenant.name} onChange={(event) => setTenant({ ...tenant, name: event.target.value })} placeholder="Nome da empresa" />
            <input value={tenant.segment} onChange={(event) => setTenant({ ...tenant, segment: event.target.value })} placeholder="Segmento" />
            <select value={tenant.plan} onChange={(event) => setTenant({ ...tenant, plan: event.target.value })}>
              <option>Starter</option><option>Business Pro</option><option>Enterprise Global</option><option>White-label Partner</option>
            </select>
            <button type="submit" disabled={working || !tenant.name}>Criar empresa</button>
          </form>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>White-label</span><strong>Aplicar marca própria</strong></div>
          <form className="autoempresa-form" onSubmit={applyWhiteLabel}>
            <input value={whiteLabel.brandName} onChange={(event) => setWhiteLabel({ ...whiteLabel, brandName: event.target.value })} placeholder="Nome da marca" />
            <input value={whiteLabel.domain} onChange={(event) => setWhiteLabel({ ...whiteLabel, domain: event.target.value })} placeholder="Domínio" />
            <select value={whiteLabel.accent} onChange={(event) => setWhiteLabel({ ...whiteLabel, accent: event.target.value })}>
              <option>emerald</option><option>violet</option><option>cyan</option><option>rose</option><option>amber</option>
            </select>
            <button type="submit" disabled={working || !whiteLabel.brandName}>Aplicar white-label</button>
          </form>
        </div>
      </section>

      <section className="autoempresa-panel">
        <div className="autoempresa-panel-title"><span>Empresas</span><strong>Multiempresa com planos e acesso separados</strong></div>
        <div className="autoempresa-leads-list autoempresa-grid-list">{(dashboard.tenants || []).map((item) => <TenantCard key={item.id} tenant={item} />)}</div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Planos mensais</span><strong>Produto vendável por assinatura</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.plans || []).map((plan) => <PlanCard key={plan.id} plan={plan} onSubscribe={subscribePlan} disabled={working} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Marketplace</span><strong>Módulos contratáveis</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.marketplace || []).map((item) => <ModuleCard key={item.id} item={item} onInstall={installModule} disabled={working} />)}</div>
        </div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Marcas white-label</span><strong>Identidade por cliente/parceiro</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.whiteLabels || []).map((item) => <WhiteLabelCard key={item.id} item={item} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Checklist mundial</span><strong>Pronto para vender e escalar</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.worldChecklist || []).map((item) => <ChecklistCard key={item.id} item={item} />)}</div>
        </div>
      </section>

      <section className="autoempresa-panel">
        <div className="autoempresa-panel-title"><span>Atividade do ecossistema</span><strong>Logs auditáveis da operação 5.0</strong></div>
        <div className="autoempresa-leads-list autoempresa-grid-list">{(dashboard.activity || []).slice(0, 8).map((item) => <ActivityCard key={item.id} item={item} />)}</div>
      </section>
    </div>
  );
}
