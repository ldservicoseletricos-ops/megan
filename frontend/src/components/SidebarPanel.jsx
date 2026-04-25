function text(value, fallback = '---') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export default function SidebarPanel({ overview, state, repo, lastUpdated, onRefresh, loading, backendOnline, apiBase }) {
  const overviewData = overview?.state || {};
  const stateData = state?.state || {};
  const repoData = repo?.repo || {};

  return (
    <aside className="sidebar-panel v2-sidebar">
      <div className="sidebar-brand-block">
        <div className="sidebar-logo">M</div>
        <div className="sidebar-brand-copy">
          <p className="sidebar-kicker">MEGAN OS</p>
          <h2 className="sidebar-title">Central cognitiva</h2>
        </div>
      </div>

      <div className="sidebar-block">
        <p className="sidebar-copy">
          Painel estratégico com linguagem visual premium, pronto para operação executiva e crescimento comercial.
        </p>
      </div>

      <div className="sidebar-nav">
        <button type="button" className="sidebar-nav-item active">Visão geral</button>
        <button type="button" className="sidebar-nav-item">Essencial</button>
        <button type="button" className="sidebar-nav-item">Repositório</button>
        <button type="button" className="sidebar-nav-item">Memória</button>
        <button type="button" className="sidebar-nav-item">Linha do tempo</button>
      </div>

      <div className="sidebar-block compact-list v2-compact-list">
        <div>
          <span>Status</span>
          <strong>{backendOnline ? 'online' : 'offline'}</strong>
        </div>
        <div>
          <span>Gargalo</span>
          <strong>{text(overviewData.currentBottleneck, 'não informado')}</strong>
        </div>
        <div>
          <span>Ciclos</span>
          <strong>{stateData.cycleCount ?? 0}</strong>
        </div>
        <div>
          <span>Repositório</span>
          <strong>{repoData.connected ? 'conectado' : 'desconectado'}</strong>
        </div>
      </div>

      <div className="sidebar-system-card">
        <span>API ativa</span>
        <strong>{apiBase}</strong>
        <small>Última leitura: {lastUpdated || 'carregando...'}</small>
      </div>

      <button className="primary-button sidebar-primary" onClick={onRefresh} disabled={loading}>
        {loading ? 'Sincronizando...' : 'Sincronizar Megan'}
      </button>
    </aside>
  );
}
