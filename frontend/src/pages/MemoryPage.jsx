export default function MemoryPage({ data }) {
  const items = data.timeline.length ? data.timeline.slice(0, 8) : Array.from({ length: 8 }, (_, i) => ({ title: `Memória ${i + 1}`, message: "Sem detalhe adicional." }));
  return (
    <div className="page-grid">
      <section className="card">
        <h2>Memória operacional</h2>
        <div className="stack-list">
          {items.map((item, i) => (
            <article key={i} className="list-card">
              <strong>{item.title || item.type || `Memória ${i + 1}`}</strong>
              <p>{item.message || item.summary || "Sem detalhe adicional."}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
