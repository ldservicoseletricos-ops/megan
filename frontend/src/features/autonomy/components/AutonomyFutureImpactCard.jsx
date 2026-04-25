export default function AutonomyFutureImpactCard({ futureImpact, loading, onRefresh }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Impacto futuro</span>
          <h3>Previsão dos próximos ciclos</h3>
        </div>
        <button disabled={loading} onClick={onRefresh}>Atualizar previsão</button>
      </header>
      <div className="autonomy-meta-block">
        <span>Momentum: {futureImpact?.momentum ?? 0}</span>
        <span>Pressão de risco: {futureImpact?.riskPressure ?? 0}</span>
        <span>Cobertura do roadmap: {futureImpact?.roadmapCoverage ?? 0}</span>
      </div>
      <div className="autonomy-list">
        {futureImpact?.nextWindow?.length ? futureImpact.nextWindow.map((item) => (
          <article key={item.horizon + item.missionId} className="autonomy-list-item">
            <div>
              <strong>{item.title}</strong>
              <p>{item.rationale}</p>
              <small>{item.horizon}</small>
            </div>
            <div className="autonomy-impact-score">
              <span className="autonomy-badge autonomy-status-active">+{item.expectedGain}</span>
              <small>{item.confidence}%</small>
            </div>
          </article>
        )) : <p className="autonomy-empty">Nenhuma previsão disponível.</p>}
      </div>
    </section>
  );
}
