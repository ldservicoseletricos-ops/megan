export default function AutonomyApprovalCard({ approvals = [], loading, onApprove, onReject }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Aprovação</span>
          <h3>Fila de decisões sensíveis</h3>
        </div>
      </header>

      <div className="autonomy-list">
        {approvals.length === 0 ? <p className="autonomy-empty">Nenhuma ação aguardando aprovação.</p> : approvals.map((item) => (
          <article key={item.id} className="autonomy-list-item">
            <div>
              <strong>{item.title}</strong>
              <p>{item.reason}</p>
            </div>
            <div className="autonomy-inline-actions">
              <span className={`autonomy-badge autonomy-status-${item.status}`}>{item.status}</span>
              {item.status === 'pending' ? <>
                <button disabled={loading} onClick={() => onApprove?.(item.id)}>Aprovar</button>
                <button disabled={loading} className="autonomy-danger" onClick={() => onReject?.(item.id)}>Rejeitar</button>
              </> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
