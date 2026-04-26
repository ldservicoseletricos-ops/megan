export default function AutonomyBreakthroughCard({ breakthrough, loading, onRun }) {
  const best = breakthrough?.bestPath;
  return (
    <article className="autonomy-card autonomy-compact-card">
      <div className="card-title-row"><span>Breakthrough Paths</span><strong>{best?.score || 0}</strong></div>
      <p className="muted">Cria rotas alternativas quando a evolução trava por complexidade ou risco.</p>
      {best ? (
        <div className="mini-list">
          <div className="mini-row"><div><strong>{best.title}</strong><span>{best.action}</span></div><b>{best.risk}% risco</b></div>
          {(breakthrough.alternatives || []).slice(1, 3).map((path) => <span key={path.id} className="pill-soft">{path.title}</span>)}
        </div>
      ) : <span className="muted">Nenhum breakthrough rodado ainda.</span>}
      <button type="button" disabled={loading} onClick={() => onRun?.({ blocker: 'organização e evolução simultânea da Megan OS' })}>Rodar breakthrough</button>
    </article>
  );
}
