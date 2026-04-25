export default function AutonomyCoordinationCard({ coordination, history = [], loading, onExecute }) {
  const current = coordination?.plan || coordination;
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Coordenação avançada</span>
          <h3>Execução com liderança e suporte</h3>
        </div>
        <p>{current?.summary || 'Monte uma execução coordenada entre cérebros internos.'}</p>
      </header>
      <div className="autonomy-button-row">
        <button disabled={loading} onClick={() => onExecute?.({})}>Executar coordenação</button>
      </div>
      {current?.leadBrain ? (
        <div className="autonomy-note-block">
          <strong>Líder:</strong> {current.leadBrain.label} · <strong>Suporte:</strong> {(current.supportBrains || []).map((item) => item.label).join(', ') || 'nenhum'}
        </div>
      ) : null}
      <div className="autonomy-list">
        {(history || []).slice(0, 4).map((item) => (
          <article key={item.id} className="autonomy-list-item">
            <div>
              <strong>{item.missionTitle || 'Coordenação'}</strong>
              <span>{item.leadBrain || 'sem líder definido'}</span>
            </div>
            <div className="autonomy-inline-metrics">
              <em>{item.status}</em>
              <em>{new Date(item.createdAt).toLocaleString('pt-BR')}</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
