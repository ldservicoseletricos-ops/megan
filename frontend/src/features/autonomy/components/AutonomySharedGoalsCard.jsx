export default function AutonomySharedGoalsCard({ goals = [], loading, onCreateGoal }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Metas compartilhadas</span>
          <h3>Alinhamento entre cérebros</h3>
        </div>
        <p>{goals.length} metas alinhando estratégia, execução, técnica e proteção da base.</p>
      </header>
      <div className="autonomy-button-row">
        <button disabled={loading} onClick={() => onCreateGoal?.({})}>Criar meta compartilhada</button>
      </div>
      <div className="autonomy-list">
        {goals.slice(0, 4).map((goal) => (
          <article key={goal.id} className="autonomy-list-item">
            <div>
              <strong>{goal.title}</strong>
              <span>{goal.summary}</span>
            </div>
            <div className="autonomy-inline-metrics">
              <em>{goal.priority}</em>
              <em>alinhamento {goal.alignmentScore || 0}/100</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
