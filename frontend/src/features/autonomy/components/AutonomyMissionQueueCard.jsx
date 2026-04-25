export default function AutonomyMissionQueueCard({ missionQueue, loading, onCreateMission, onActivateMission, onCompleteMission }) {
  const active = missionQueue?.active;
  const queued = missionQueue?.queued || [];

  return (
    <section className="autonomy-card autonomy-mission-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Fila de missões</span>
          <h3>Execução contínua por missão</h3>
        </div>
        <button disabled={loading} onClick={() => onCreateMission?.({
          title: 'Expandir autoexecução segura',
          summary: 'Aumentar ciclos sem romper base atual.',
          priority: 'high',
        })}>Nova missão</button>
      </header>

      <div className="autonomy-mission-active">
        <span>Ativa agora</span>
        <strong>{active?.title || 'Nenhuma missão ativa'}</strong>
        <p>{active?.summary || 'A Megan aguarda uma missão principal para organizar os próximos ciclos.'}</p>
        <div className="autonomy-progress-row">
          <div className="autonomy-progress-bar"><span style={{ width: `${active?.progress || 0}%` }} /></div>
          <em>{active?.progress || 0}%</em>
        </div>
        {active ? <button disabled={loading} onClick={() => onCompleteMission?.(active.id)}>Concluir missão ativa</button> : null}
      </div>

      <div className="autonomy-list">
        {queued.length === 0 ? <p className="autonomy-empty">Nenhuma missão em fila.</p> : queued.map((mission) => (
          <article key={mission.id} className="autonomy-list-item">
            <div>
              <strong>{mission.title}</strong>
              <p>{mission.summary}</p>
            </div>
            <div className="autonomy-inline-actions">
              <span className={`autonomy-badge autonomy-priority-${mission.priority}`}>{mission.priority}</span>
              <button disabled={loading} onClick={() => onActivateMission?.(mission.id)}>Ativar</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
