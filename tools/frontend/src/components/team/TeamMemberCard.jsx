function safeText(value, fallback = '---') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export default function TeamMemberCard({ member, onAction, runningKey = '' }) {
  const statusClass = member.status === 'ativo' ? 'good' : member.status === 'standby' ? 'warn' : 'neutral';
  const actions = Array.isArray(member.actions) ? member.actions : [];

  return (
    <article className="team-member-card team-member-card-v2 team-member-card-v3">
      <div className="team-member-top">
        <div className={`team-avatar tone-${member.tone || 'neutral'}`}>{member.initials}</div>
        <div className="team-member-head">
          <strong>{safeText(member.name)}</strong>
          <span>{safeText(member.role)}</span>
        </div>
        <span className={`status-pill ${statusClass}`}>{safeText(member.status)}</span>
      </div>

      <p className="team-member-description">{safeText(member.description)}</p>

      <div className="team-member-kpis compact-kpis">
        <div>
          <span>Score</span>
          <strong>{safeText(member.score, '0')}%</strong>
        </div>
        <div>
          <span>{safeText(member.kpiLabel, 'KPI')}</span>
          <strong>{safeText(member.kpi, '0')}%</strong>
        </div>
        <div>
          <span>Fila</span>
          <strong>{safeText(member.queue, '0')}</strong>
        </div>
      </div>

      <div className="team-member-focus">
        <span>Foco atual</span>
        <strong>{safeText(member.focus)}</strong>
      </div>

      <div className="team-member-command-box">
        <span>Comando sugerido</span>
        <strong>{safeText(member.command, 'sem comando definido')}</strong>
      </div>

      {actions.length ? (
        <div className="team-member-actions">
          {actions.map((action) => {
            const isRunning = runningKey === action.key;
            return (
              <button
                key={action.key}
                type="button"
                className={`team-action-button ${action.variant || 'primary'}`}
                onClick={() => onAction?.(action)}
                disabled={Boolean(runningKey)}
              >
                {isRunning ? 'Executando...' : action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </article>
  );
}
