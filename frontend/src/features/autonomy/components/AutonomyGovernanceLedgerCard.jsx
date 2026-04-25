export default function AutonomyGovernanceLedgerCard({ ledger }) {
  const items = ledger?.items || [];
  const summary = ledger?.summary || {};
  return (
    <section className="card">
      <div className="card-header"><h3>Ledger de governança</h3></div>
      <div className="stats">
        <div><span>Total</span><strong>{summary.total ?? 0}</strong></div>
        <div><span>Aprovadas</span><strong>{summary.approved ?? 0}</strong></div>
        <div><span>Escaladas</span><strong>{summary.escalated ?? 0}</strong></div>
      </div>
      <div className="list">
        {items.map((item) => (
          <div key={item.id} className="list-item">
            <strong>{item.context}</strong>
            <span>{item.outcome} · {item.dominantBrain}</span>
          </div>
        ))}
        {!items.length ? <div className="hint">Sem histórico de governança ainda.</div> : null}
      </div>
    </section>
  );
}
