export default function AutonomyMissionImpactCard({ ranking = [], loading, onRank, onSelectBest }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Impacto real</span>
          <h3>Ranking de missões</h3>
        </div>
        <p>Prioriza o que mais destrava o sistema com menor risco líquido.</p>
      </header>
      <div className="autonomy-inline-actions">
        <button disabled={loading} onClick={onRank}>Recalcular impacto</button>
        <button disabled={loading} onClick={onSelectBest}>Selecionar melhor missão</button>
      </div>
      <div className="autonomy-list">
        {ranking.length ? ranking.slice(0, 5).map((item) => (
          <article key={item.mission.id} className="autonomy-list-item autonomy-impact-item">
            <div>
              <strong>{item.mission.title}</strong>
              <p>{item.impact.rationale}</p>
            </div>
            <div className="autonomy-impact-score">
              <span className="autonomy-badge autonomy-status-active">{item.impact.totalScore}</span>
              <small>{item.mission.priority}</small>
            </div>
          </article>
        )) : <p className="autonomy-empty">Nenhum ranking calculado ainda.</p>}
      </div>
    </section>
  );
}
