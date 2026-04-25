export default function AutonomyRollbackCard({ rollbackQueue = [], loading, onRunRollback }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Rollback</span>
          <h3>Reversão pronta</h3>
        </div>
      </header>

      <div className="autonomy-list">
        {rollbackQueue.length === 0 ? <p className="autonomy-empty">Nenhuma reversão pronta.</p> : rollbackQueue.map((item) => (
          <article key={item.id} className="autonomy-list-item">
            <div>
              <strong>{item.title}</strong>
              <p>Ação alvo: {item.targetAction || 'não informado'}</p>
            </div>
            <div className="autonomy-inline-actions">
              <span className={`autonomy-badge autonomy-status-${item.status}`}>{item.status}</span>
              {item.status === 'ready' ? <button disabled={loading} onClick={() => onRunRollback?.(item.id)}>Executar rollback</button> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
