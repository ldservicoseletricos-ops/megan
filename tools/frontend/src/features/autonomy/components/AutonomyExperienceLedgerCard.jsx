export default function AutonomyExperienceLedgerCard({ history }) {
  const items = history?.items || history?.interactions?.items || [];
  const lessons = history?.lessons || [];
  return (
    <article className="autonomy-card">
      <div className="autonomy-card-header">
        <span>Experience Ledger</span>
        <strong>{items.length} registros</strong>
      </div>
      <ul className="autonomy-list">
        {items.slice(0, 4).map((item) => <li key={item.id}>{item.summary}</li>)}
        {!items.length ? <li>Nenhuma interação adaptativa registrada ainda.</li> : null}
      </ul>
      <p className="autonomy-muted">Lição ativa: {lessons[0] || 'priorizar clareza, validação e continuidade.'}</p>
    </article>
  );
}
