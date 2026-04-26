export default function AutonomyRoadmapCard({ roadmap = [], priorities, loading, onRegenerate }) {
  return (
    <section className="autonomy-card autonomy-roadmap-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Roadmap</span>
          <h3>Roadmap autogerado</h3>
        </div>
        <button disabled={loading} onClick={onRegenerate}>Regenerar roadmap</button>
      </header>
      <div className="autonomy-list">
        {roadmap.length ? roadmap.slice(0, 6).map((item) => (
          <article key={item.id} className="autonomy-list-item">
            <div>
              <strong>{item.title}</strong>
              <p>{item.missionTitle}</p>
              <small>{item.milestone}</small>
            </div>
            <div className="autonomy-impact-score">
              <span className={`autonomy-badge autonomy-status-${item.status}`}>{item.status}</span>
              <small>{item.expectedImpactScore || 0}</small>
            </div>
          </article>
        )) : <p className="autonomy-empty">Roadmap ainda não gerado.</p>}
      </div>
      {priorities?.priorities?.length ? (
        <div className="autonomy-meta-block">
          <span>Prioridade #1: {priorities.priorities[0]?.title}</span>
          <span>Horizonte: {priorities.priorities[0]?.horizon}</span>
        </div>
      ) : null}
    </section>
  );
}
