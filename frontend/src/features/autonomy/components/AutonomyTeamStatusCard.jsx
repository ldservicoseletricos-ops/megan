export default function AutonomyTeamStatusCard({ data, onAction }) {
  const payload = data || {};
  const list = payload.members || payload.assignments || payload.workload || payload.tasks || [];
  return (
    <article className="autonomy-card">
      <div className="autonomy-card-header">
        <span>Core 3.7</span>
        <strong>Team Status</strong>
      </div>
      <p>Coordenação e disponibilidade da equipe.</p>
      {payload.recommendation ? <p className="autonomy-muted">{payload.recommendation}</p> : null}
      <div className="autonomy-list">
        {list.slice(0, 4).map((item, index) => (
          <div key={item.id || item.taskId || index} className="autonomy-list-item">
            <strong>{item.name || item.title || item.assignedTo || `Item ${index + 1}`}</strong>
            <span>{item.role || item.priority || item.status || item.rationale || item.trend || ''}</span>
          </div>
        ))}
      </div>
      {onAction ? <button className="autonomy-mini-button" onClick={onAction}>Atualizar</button> : null}
    </article>
  );
}
