export default function GitPage({ data, runAction, busyAction }) {
  const dash = data.github?.dashboard || {};
  return (
    <div className="page-grid">
      <section className="hero card">
        <div>
          <h2>Git Evolution Engine</h2>
          <p>Camada supervisionada para branch, commit e PR da Megan.</p>
        </div>
      </section>
      <section className="card">
        <h3>Estado GitHub</h3>
        <div className="kv-grid mono">
          <div><span>Repo GitHub</span><strong>{dash.repo || "https://github.com/ldservicoseletricos-ops/megan"}</strong></div>
          <div><span>Branch padrão</span><strong>{dash.defaultBranch || "main"}</strong></div>
          <div><span>Git local</span><strong>{dash.gitLocal || "pendente"}</strong></div>
          <div><span>Token GitHub</span><strong>{dash.tokenReady ? "pronto" : "pendente"}</strong></div>
          <div><span>Score</span><strong>{dash.score || 64}%</strong></div>
        </div>
      </section>
      <section className="card">
        <h3>Planos supervisionados</h3>
        <div className="action-grid">
          <button className="cta" disabled={!!busyAction} onClick={() => runAction("Gerar branch supervisionada", "/api/github-autonomy/branch-plan", {})}>Gerar branch supervisionada</button>
          <button className="cta" disabled={!!busyAction} onClick={() => runAction("Gerar commit supervisionado", "/api/github-autonomy/commit-plan", {})}>Gerar commit supervisionado</button>
          <button className="cta alt" disabled={!!busyAction} onClick={() => runAction("Gerar PR supervisionado", "/api/github-autonomy/pr-plan", {})}>Gerar PR supervisionado</button>
        </div>
      </section>
    </div>
  );
}
