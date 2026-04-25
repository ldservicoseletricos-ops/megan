import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json();
}

function StoreStat({ label, value, caption }) {
  return (
    <article className="omega-overview-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

function ModuleCard({ item, onInstall, onPurchase, onAction }) {
  return (
    <article className="omega-panel-card app-store-module-card">
      <div className="app-store-module-head">
        <span className="omega-kicker">{item.type}</span>
        <strong>{item.price > 0 ? `$${item.price}/mês` : 'Grátis'}</strong>
      </div>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <div className="voice-chip-list">
        <span>{item.category}</span>
        <span>{item.status}</span>
      </div>
      <div className="app-store-actions">
        <button className="omega-primary-button" onClick={() => onPurchase(item)} type="button">Comprar/agregar</button>
        <button className="omega-secondary-button" onClick={() => onInstall(item)} type="button">Instalar</button>
        {item.type === 'tema' ? <button className="omega-secondary-button" onClick={() => onAction('/api/megan-app-store/theme/apply', item)} type="button">Aplicar tema</button> : null}
        {item.type === 'automacao' ? <button className="omega-secondary-button" onClick={() => onAction('/api/megan-app-store/automation/enable', item)} type="button">Ativar</button> : null}
        {item.type === 'integracao' ? <button className="omega-secondary-button" onClick={() => onAction('/api/megan-app-store/integration/connect', item)} type="button">Conectar</button> : null}
      </div>
    </article>
  );
}

export default function MeganAppStorePage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('todos');

  async function load() {
    setError('');
    try {
      const data = await api('/api/megan-app-store/dashboard');
      setDashboard(data);
    } catch (err) {
      setError(err.message || 'Falha ao carregar Megan App Store.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function install(item) {
    const data = await api('/api/megan-app-store/install', { method: 'POST', body: JSON.stringify({ moduleId: item.id }) });
    setDashboard(data.dashboard);
  }

  async function purchase(item) {
    const data = await api('/api/megan-app-store/purchase', { method: 'POST', body: JSON.stringify({ moduleId: item.id }) });
    setDashboard(data.dashboard);
  }

  async function runAction(path, item) {
    const data = await api(path, { method: 'POST', body: JSON.stringify({ moduleId: item.id }) });
    setDashboard(data.dashboard);
  }

  const summary = dashboard?.summary || {};
  const allItems = useMemo(() => {
    const catalog = dashboard?.catalog || {};
    return [...(catalog.themes || []), ...(catalog.agents || []), ...(catalog.automations || []), ...(catalog.integrations || [])];
  }, [dashboard]);

  const visibleItems = filter === 'todos' ? allItems : allItems.filter((item) => item.type === filter);

  if (loading) {
    return <div className="omega-loading-card"><span className="omega-kicker">MEGAN APP STORE</span><h2>Carregando loja de módulos...</h2></div>;
  }

  return (
    <div className="feature-page app-store-page">
      <section className="omega-hero-card app-store-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 5.5</span>
          <h1>MEGAN APP STORE</h1>
          <p>Loja de módulos para temas, agentes, automações e integrações. A Megan passa a vender, instalar e agregar capacidades por módulo.</p>
          {error ? <strong className="omega-error">{error}</strong> : null}
        </div>
        <div className="app-store-live-box">
          <strong>{dashboard?.readiness?.score || 95}%</strong>
          <span>{dashboard?.readiness?.status || 'pronto_para_venda_de_modulos'}</span>
          <em>Tema ativo: {dashboard?.activeTheme || 'Executive Dark'}</em>
        </div>
      </section>

      <section className="omega-overview-rail app-store-stats">
        <StoreStat label="Módulos" value={String(summary.totalModules || 0)} caption="catálogo total" />
        <StoreStat label="Agentes" value={String(summary.agents || 0)} caption="compráveis/agregáveis" />
        <StoreStat label="Automações" value={String(summary.automations || 0)} caption="ativáveis" />
        <StoreStat label="Instalados" value={String(summary.installed || 0)} caption="ativos nesta conta" />
      </section>

      <section className="omega-panel-card app-store-filter-card">
        <span className="omega-kicker">CATÁLOGO</span>
        <h2>Filtrar loja de módulos</h2>
        <div className="voice-chip-list app-store-filter-list">
          {['todos', 'tema', 'agente', 'automacao', 'integracao'].map((item) => (
            <button key={item} className={`omega-secondary-button ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)} type="button">{item}</button>
          ))}
        </div>
      </section>

      <section className="app-store-grid">
        {visibleItems.map((item) => <ModuleCard key={item.id} item={item} onInstall={install} onPurchase={purchase} onAction={runAction} />)}
      </section>

      <section className="voice-command-grid">
        <article className="omega-panel-card">
          <span className="omega-kicker">INSTALADOS</span>
          <h2>Módulos ativos</h2>
          <div className="voice-list">
            {(dashboard?.installed || []).map((item) => (
              <div key={item.id} className="voice-list-item">
                <strong>{item.name}</strong>
                <span>{item.type} • {item.category || item.moduleId}</span>
                <em>{item.status}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="omega-panel-card">
          <span className="omega-kicker">ATIVIDADE</span>
          <h2>Movimento da loja</h2>
          <div className="voice-list">
            {(dashboard?.activity || []).slice(0, 8).map((item) => (
              <div key={item.id} className="voice-list-item">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
                <em>{new Date(item.createdAt).toLocaleString('pt-BR')}</em>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
