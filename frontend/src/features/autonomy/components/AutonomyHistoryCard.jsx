export default function AutonomyHistoryCard({ history = [] }) {
  return (
    <section className="autonomy-history-card">
      <header>
        <h4>Histórico recente</h4>
        <p>Ciclos, validações e decisões preservadas para aprendizado e rollback lógico.</p>
      </header>

      <div className="autonomy-history-list">
        {history.length === 0 ? (
          <div className="autonomy-empty">Nenhum ciclo registrado ainda.</div>
        ) : history.slice(0, 6).map((item) => (
          <article key={item.id} className="autonomy-history-item">
            <span>{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'agora'}</span>
            <strong>{item.decision?.title || 'Decisão sem título'}</strong>
            <p>{item.validation?.summary || item.execution?.summary || 'Sem resumo.'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
