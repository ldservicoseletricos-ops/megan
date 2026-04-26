export default function AutonomyNextMissionCard({ suggestion, loading, onSelectNext }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Seleção automática</span>
          <h3>Próxima missão</h3>
        </div>
        <p>A Megan escolhe a próxima missão com base em prioridade, progresso e risco.</p>
      </header>

      {suggestion?.selected ? (
        <div className="autonomy-list-item">
          <div>
            <strong>{suggestion.selected.title}</strong>
            <p>{suggestion.reason}</p>
          </div>
          <span className={`autonomy-badge autonomy-priority-${suggestion.selected.priority}`}>{suggestion.selected.priority}</span>
        </div>
      ) : <p className="autonomy-empty">Ainda não houve sugestão automática registrada.</p>}

      <div className="autonomy-inline-actions">
        <button disabled={loading} onClick={onSelectNext}>Selecionar próxima missão</button>
      </div>
    </section>
  );
}
