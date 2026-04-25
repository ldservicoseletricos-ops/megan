export default function AutonomyHumanPrioritiesCard({ goals, summary, loading, onCreate }) {
  const items = goals || [];
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header"><div><span className="autonomy-eyebrow">3.6 Human Goals</span><h3>Prioridades humanas</h3></div><p>{summary?.executiveSignal || 'Metas humanas ordenadas por urgência, impacto e valor estratégico.'}</p></header>
      <div className="mini-list">
        {items.slice(0, 4).map((goal) => <div key={goal.id} className="mini-row"><span>{goal.title}</span><strong>{goal.score || 0}/100</strong></div>)}
      </div>
      <button disabled={loading} onClick={() => onCreate?.({ title: 'Validar Megan online hoje', urgency: 90, impact: 94, effort: 40, strategicValue: 95 })}>Criar prioridade executiva</button>
    </article>
  );
}
