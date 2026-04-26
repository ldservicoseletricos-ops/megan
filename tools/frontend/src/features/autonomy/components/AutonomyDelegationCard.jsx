export default function AutonomyDelegationCard({ delegation, history = [], loading, onPlan, onDispatch }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Delegação automática</span>
          <h3>Despacho de missão entre cérebros</h3>
        </div>
        <p>{delegation?.summary || 'Gere um plano para descobrir qual cérebro deve assumir a próxima missão.'}</p>
      </header>
      <div className="autonomy-button-row">
        <button disabled={loading} onClick={onPlan}>Gerar plano</button>
        <button disabled={loading} onClick={onDispatch}>Despachar missão</button>
      </div>
      {delegation?.primaryBrain ? (
        <div className="autonomy-note-block">
          <strong>Primário:</strong> {delegation.primaryBrain.label} · <strong>Suporte:</strong> {(delegation.supportBrains || []).map((item) => item.label).join(', ') || 'nenhum'}
        </div>
      ) : null}
      <div className="autonomy-list">
        {(history || []).slice(0, 4).map((item) => (
          <article key={item.id} className="autonomy-list-item">
            <div>
              <strong>{item.missionTitle || item.missionId || 'Delegação'}</strong>
              <span>{item.primaryBrain || 'sem cérebro primário'}</span>
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
