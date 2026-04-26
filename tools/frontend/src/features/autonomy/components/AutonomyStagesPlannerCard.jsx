export default function AutonomyStagesPlannerCard({ stages = [] }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Planejador</span>
          <h3>Etapas do plano</h3>
        </div>
        <p>Divisão da evolução em estágios claros e executáveis.</p>
      </header>
      <div className="autonomy-list">
        {stages.length ? stages.slice(0, 6).map((stage) => (
          <article key={stage.id} className="autonomy-list-item">
            <div>
              <strong>{stage.title}</strong>
              <p>{stage.description}</p>
              <small>{stage.missionTitle}</small>
            </div>
            <div className="autonomy-impact-score">
              <span className={`autonomy-badge autonomy-status-${stage.status}`}>{stage.status}</span>
              <small>{stage.expectedImpactScore || 0}</small>
            </div>
          </article>
        )) : <p className="autonomy-empty">Sem etapas planejadas.</p>}
      </div>
    </section>
  );
}
