export default function AutonomyCompositeGoalsCard({ goals = [], loading, onCreateGoal }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Metas compostas</span>
          <h3>Objetivos de longo alcance</h3>
        </div>
        <button disabled={loading} onClick={() => onCreateGoal?.({ title: 'Expandir Megan com autonomia estratégica', summary: 'Criar objetivo composto para guiar ciclos futuros.', priority: 'high' })}>Nova meta composta</button>
      </header>
      <div className="autonomy-list">
        {goals.length ? goals.slice(0, 4).map((goal) => (
          <article key={goal.id} className="autonomy-list-item">
            <div>
              <strong>{goal.title}</strong>
              <p>{goal.summary}</p>
              <small>{goal.children?.length || 0} etapas • {goal.missionCount || 0} missões</small>
            </div>
            <div className="autonomy-impact-score">
              <span className={`autonomy-badge autonomy-priority-${goal.priority || 'medium'}`}>{goal.priority || 'medium'}</span>
              <small>{goal.progress || 0}%</small>
            </div>
          </article>
        )) : <p className="autonomy-empty">Nenhuma meta composta registrada.</p>}
      </div>
    </section>
  );
}
