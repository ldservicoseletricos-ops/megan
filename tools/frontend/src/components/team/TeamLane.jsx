import TeamMemberCard from './TeamMemberCard.jsx';

export default function TeamLane({
  title,
  subtitle,
  members = [],
  tasks = [],
  command = 'sem comando',
  kpiLabel = 'KPI',
  kpiValue = 0,
  onAction,
  runningKey = '',
}) {
  return (
    <section className="team-lane team-lane-v2 team-lane-v3">
      <div className="team-lane-head">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="team-lane-summary">
          <span className="section-badge">{members.length} membros</span>
          <span className="section-badge strong">{kpiLabel} {kpiValue}%</span>
        </div>
      </div>

      <div className="team-lane-command">
        <span>Comando do squad</span>
        <strong>{command}</strong>
      </div>

      <div className="team-lane-grid">
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} onAction={onAction} runningKey={runningKey} />
        ))}
      </div>

      <div className="team-lane-task-preview">
        {tasks.map((task, index) => (
          <article key={`${title}-${index}`} className="team-task-mini-card">
            <strong>{task.title}</strong>
            <div className="team-task-mini-meta">
              <span>{task.owner}</span>
              <span>{task.priority}</span>
              <span>{task.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
