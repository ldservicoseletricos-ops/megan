export default function AutonomyPrecedentsCard({ precedents }) {
  const items = precedents?.items || [];
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header">
        <div><span className="autonomy-eyebrow">Precedentes</span><h3>Ledger constitucional</h3></div>
        <p>Histórico usado para manter decisões futuras coerentes.</p>
      </header>
      <div className="autonomy-list">
        {items.length ? items.slice(0, 5).map((item) => (
          <div key={item.id} className="autonomy-list-item">
            <strong>{item.title}</strong>
            <span>{item.source} · {item.outcome}</span>
          </div>
        )) : <span className="autonomy-muted">Nenhum precedente crítico registrado ainda.</span>}
      </div>
    </article>
  );
}
