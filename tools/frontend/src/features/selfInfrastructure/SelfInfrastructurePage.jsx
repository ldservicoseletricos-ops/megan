import React, { useEffect, useMemo, useState } from 'react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:10000').replace(/\/$/, '');

async function readJson(response) {
  const text = await response.text();
  if (!text.trim()) return {};
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Backend retornou resposta não JSON. Confira VITE_API_URL e se o backend está online.');
  }
  const payload = JSON.parse(text);
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.reason || payload?.message || `Falha HTTP ${response.status}`);
  }
  return payload;
}

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  return readJson(response);
}

function StatusBadge({ status }) {
  const label = status === 'ready' ? 'Pronto' : status === 'attention' ? 'Atenção' : 'Pendente';
  return <span className={`selfinfra-status ${status || 'missing'}`}>{label}</span>;
}

function ServiceCard({ service }) {
  return (
    <article className={`selfinfra-service ${service.status}`}>
      <div>
        <span>{service.required ? 'Obrigatório' : 'Opcional'}</span>
        <h3>{service.name}</h3>
        <p>{service.purpose}</p>
      </div>
      <StatusBadge status={service.status} />
      <div className="selfinfra-service-meta">
        <small>Campos: {service.configuredFields?.length || 0}</small>
        <small>{service.lastCheck?.message || 'Ainda não verificado'}</small>
      </div>
    </article>
  );
}

function ActionList({ actions = [] }) {
  if (!actions.length) return <p>Nenhuma ação registrada ainda.</p>;
  return (
    <div className="selfinfra-actions-list">
      {actions.map((action) => (
        <div key={action.id}>
          <strong>{action.title}</strong>
          <span>{action.result}</span>
          <em>{action.createdAt ? new Date(action.createdAt).toLocaleString() : '-'}</em>
        </div>
      ))}
    </div>
  );
}

function IncidentList({ incidents = [] }) {
  if (!incidents.length) return <p>Nenhum incidente aberto. Sistema limpo.</p>;
  return (
    <div className="selfinfra-incident-list">
      {incidents.map((incident) => (
        <div key={incident.id}>
          <strong>{incident.title}</strong>
          <span>{incident.reason}</span>
          <em>{incident.recommendedAction}</em>
        </div>
      ))}
    </div>
  );
}

export default function SelfInfrastructurePage() {
  const [data, setData] = useState(null);
  const [repairPlan, setRepairPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function load() {
    try {
      const payload = await api('/api/self-infrastructure/dashboard');
      setData(payload);
      const plan = await api('/api/self-infrastructure/repair-plan');
      setRepairPlan(plan);
    } catch (error) {
      setNotice(error.message || 'Erro ao carregar Self Infrastructure.');
    }
  }

  async function runScan() {
    setBusy(true);
    setNotice('');
    try {
      const result = await api('/api/self-infrastructure/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setData(result.dashboard);
      const plan = await api('/api/self-infrastructure/repair-plan');
      setRepairPlan(plan);
      setNotice(`Verificação concluída: ${result.incidents?.length || 0} incidente(s).`);
    } catch (error) {
      setNotice(error.message || 'Erro ao verificar infraestrutura.');
    } finally {
      setBusy(false);
    }
  }

  async function repairAll(confirm = false) {
    setBusy(true);
    setNotice('');
    try {
      const result = await api('/api/self-infrastructure/repair-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm }),
      });
      if (result.dashboard) setData(result.dashboard);
      if (result.plan) setRepairPlan(result.plan);
      setNotice(result.message || 'Plano de correção preparado.');
    } catch (error) {
      setNotice(error.message || 'Erro ao corrigir infraestrutura.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleMonitor(enabled) {
    setBusy(true);
    setNotice('');
    try {
      const result = await api('/api/self-infrastructure/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      setData(result.dashboard);
      setNotice(enabled ? 'Monitoramento automático ativado.' : 'Monitoramento pausado.');
    } catch (error) {
      setNotice(error.message || 'Erro ao alterar monitoramento.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  const services = data?.services || [];
  const readyServices = useMemo(() => services.filter((service) => service.status === 'ready').length, [services]);

  if (!data) {
    return (
      <section className="selfinfra-page">
        <article className="selfinfra-hero">
          <span className="omega-kicker">MEGAN OS 8.0</span>
          <h2>Carregando Self Infrastructure AI...</h2>
          <p>Preparando monitoramento, diagnóstico e correção supervisionada.</p>
          {notice ? <div className="selfinfra-alert warn">{notice}</div> : null}
        </article>
      </section>
    );
  }

  return (
    <section className="selfinfra-page">
      <article className="selfinfra-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 8.0 SELF INFRASTRUCTURE AI</span>
          <h2>Infraestrutura autônoma supervisionada</h2>
          <p>Monitora GitHub, Render, Vercel, Supabase, Gemini e Stripe; detecta falhas; cria plano de correção e executa ações seguras.</p>
        </div>
        <div className="selfinfra-score">
          <strong>{data.healthScore}%</strong>
          <span>saúde operacional</span>
        </div>
      </article>

      {notice ? <div className={`selfinfra-alert ${notice.toLowerCase().includes('erro') ? 'warn' : 'ok'}`}>{notice}</div> : null}

      <div className="selfinfra-kpis">
        <article><strong>{readyServices}/{services.length}</strong><span>serviços prontos</span></article>
        <article><strong>{data.summary?.openIncidents || 0}</strong><span>incidentes abertos</span></article>
        <article><strong>{data.autoMonitorEnabled ? 'Ativo' : 'Pausado'}</strong><span>auto monitoramento</span></article>
        <article><strong>{data.lastScanAt ? new Date(data.lastScanAt).toLocaleString() : 'Nunca'}</strong><span>última verificação</span></article>
      </div>

      <div className="selfinfra-toolbar">
        <button disabled={busy} onClick={runScan}>Verificar tudo agora</button>
        <button disabled={busy} onClick={() => repairAll(false)}>Criar plano de correção</button>
        <button disabled={busy} className="primary" onClick={() => repairAll(true)}>Executar correções seguras</button>
        <button disabled={busy} onClick={() => toggleMonitor(!data.autoMonitorEnabled)}>{data.autoMonitorEnabled ? 'Pausar monitoramento' : 'Ativar monitoramento'}</button>
      </div>

      <div className="selfinfra-grid">
        <article className="selfinfra-panel wide">
          <div className="selfinfra-panel-title">
            <h3>Serviços conectados</h3>
            <span>{data.summary?.connected || 0} conectados</span>
          </div>
          <div className="selfinfra-services-grid">
            {services.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        </article>

        <article className="selfinfra-panel">
          <div className="selfinfra-panel-title">
            <h3>Plano de correção</h3>
            <span>{repairPlan?.steps?.length || 0} passos</span>
          </div>
          <ol className="selfinfra-plan">
            {(repairPlan?.steps || []).map((step) => (
              <li key={step.id}>
                <strong>{step.title}</strong>
                <span>{step.action}</span>
              </li>
            ))}
          </ol>
        </article>

        <article className="selfinfra-panel">
          <div className="selfinfra-panel-title">
            <h3>Incidentes</h3>
            <span>{data.incidents?.length || 0}</span>
          </div>
          <IncidentList incidents={data.incidents} />
        </article>

        <article className="selfinfra-panel wide">
          <div className="selfinfra-panel-title">
            <h3>Histórico operacional</h3>
            <span>{data.actions?.length || 0}</span>
          </div>
          <ActionList actions={data.actions} />
        </article>
      </div>
    </section>
  );
}
