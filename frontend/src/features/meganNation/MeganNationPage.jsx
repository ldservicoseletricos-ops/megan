import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json();
}

function NationStat({ label, value, caption }) {
  return (
    <article className="omega-overview-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

function NationList({ title, kicker, items, render }) {
  return (
    <article className="omega-panel-card">
      <span className="omega-kicker">{kicker}</span>
      <h2>{title}</h2>
      <div className="voice-list">{items.map(render)}</div>
    </article>
  );
}

export default function MeganNationPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const data = await api('/api/megan-nation/dashboard');
      setDashboard(data);
    } catch (err) {
      setError(err.message || 'Falha ao carregar Megan Nation.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function run(path, body) {
    const data = await api(path, { method: 'POST', body: JSON.stringify(body) });
    setDashboard(data.dashboard || data);
  }

  if (loading) {
    return <div className="omega-loading-card"><span className="omega-kicker">MEGAN NATION</span><h2>Carregando rede global...</h2></div>;
  }

  const summary = dashboard?.summary || {};
  const community = dashboard?.community || {};
  const marketplace = dashboard?.marketplace || {};
  const aiTeams = dashboard?.aiTeams || [];
  const jobs = dashboard?.jobs || [];

  return (
    <div className="feature-page megan-nation-page">
      <section className="omega-hero-card app-store-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 6.0</span>
          <h1>MEGAN NATION</h1>
          <p>Rede global de usuários + IA conectada. Comunidade, marketplace humano + IA, times formados por IA e jobs executados com supervisão.</p>
          {error ? <strong className="omega-error">{error}</strong> : null}
        </div>
        <div className="app-store-live-box">
          <strong>{dashboard?.readiness?.score || 96}%</strong>
          <span>{dashboard?.readiness?.status || 'pronto_para_ecossistema_global'}</span>
          <em>{dashboard?.readiness?.monetization || 'assinaturas + comissão por job'}</em>
        </div>
      </section>

      <section className="omega-overview-rail app-store-stats">
        <NationStat label="Usuários" value={String(summary.users || 0)} caption="rede global conectada" />
        <NationStat label="Empresas" value={String(summary.companies || 0)} caption="contas B2B ativas" />
        <NationStat label="Países" value={String(summary.countries || 0)} caption="expansão mundial" />
        <NationStat label="Jobs" value={String(summary.jobs || 0)} caption="trabalhos em fila/executando" />
      </section>

      <section className="omega-panel-card app-store-filter-card">
        <span className="omega-kicker">AÇÕES RÁPIDAS</span>
        <h2>Operar a Megan Nation</h2>
        <div className="app-store-actions">
          <button className="omega-primary-button" type="button" onClick={() => run('/api/megan-nation/community/join', { name: 'Novo operador global', role: 'creator', skills: ['IA', 'automação', 'negócios'] })}>Adicionar membro</button>
          <button className="omega-primary-button" type="button" onClick={() => run('/api/megan-nation/marketplace/offer', { title: 'Nova oferta IA + Humano', type: 'hibrido', price: 249 })}>Criar oferta</button>
          <button className="omega-primary-button" type="button" onClick={() => run('/api/megan-nation/ai-teams/form', { name: 'Time IA Comercial Local', agents: ['captador', 'closer', 'crm', 'followup'] })}>Formar time IA</button>
          <button className="omega-primary-button" type="button" onClick={() => run('/api/megan-nation/jobs/execute', { title: 'Executar implantação para cliente', type: 'implantacao', value: 399, autoApprove: true })}>Criar job executável</button>
        </div>
      </section>

      <section className="voice-command-grid">
        <NationList
          kicker="COMUNIDADE"
          title="Círculos globais"
          items={community.circles || []}
          render={(item) => (
            <div key={item.id} className="voice-list-item">
              <strong>{item.name}</strong>
              <span>{item.focus}</span>
              <em>{item.members} membros</em>
            </div>
          )}
        />
        <NationList
          kicker="MARKETPLACE"
          title="Humano + IA"
          items={marketplace.offers || []}
          render={(item) => (
            <div key={item.id} className="voice-list-item">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
              <em>{item.type} • ${item.price}/{item.delivery}</em>
            </div>
          )}
        />
      </section>

      <section className="voice-command-grid">
        <NationList
          kicker="TIMES IA"
          title="Times formados por IA"
          items={aiTeams}
          render={(item) => (
            <div key={item.id} className="voice-list-item">
              <strong>{item.name}</strong>
              <span>{item.objective}</span>
              <em>{item.status} • {item.successRate}% sucesso</em>
            </div>
          )}
        />
        <NationList
          kicker="JOBS"
          title="Jobs executados"
          items={jobs}
          render={(item) => (
            <div key={item.id} className="voice-list-item">
              <strong>{item.title}</strong>
              <span>{item.assignedTeam}</span>
              <em>{item.status} • {item.progress}% • ${item.value}</em>
            </div>
          )}
        />
      </section>

      <section className="omega-panel-card">
        <span className="omega-kicker">ATIVIDADE GLOBAL</span>
        <h2>Últimos movimentos da Megan Nation</h2>
        <div className="voice-list">
          {(dashboard?.activity || []).slice(0, 10).map((item) => (
            <div key={item.id} className="voice-list-item">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
              <em>{new Date(item.createdAt).toLocaleString('pt-BR')}</em>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
