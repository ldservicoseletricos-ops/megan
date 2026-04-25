export default function AutonomyInnovationLedgerCard({ history }) {
  const items = history?.items || [];
  return (
    <article className="autonomy-card autonomy-compact-card">
      <div className="card-title-row"><span>Innovation Ledger</span><strong>{items.length}</strong></div>
      <p className="muted">Histórico das ideias, sínteses e breakthroughs criados pela Megan.</p>
      <div className="mini-list">
        {items.slice(0, 5).map((entry) => (
          <div key={entry.id} className="mini-row"><div><strong>{entry.title}</strong><span>{entry.type}</span></div><b>{new Date(entry.createdAt).toLocaleDateString()}</b></div>
        ))}
        {!items.length ? <span className="muted">Ledger vazio nesta sessão.</span> : null}
      </div>
    </article>
  );
}
