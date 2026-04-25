export default function AutonomyBrainsCard({ brains = [], summary = {} }) {
  return (
    <section className="autonomy-card"> 
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Cérebros internos</span>
          <h3>Coordenação multi-inteligência</h3>
        </div>
        <p>{summary.online || 0} online de {summary.total || brains.length || 0} com autonomia média de {summary.avgAutonomy || 0}/100.</p>
      </header>
      <div className="autonomy-list">
        {brains.map((brain) => (
          <article key={brain.id} className="autonomy-list-item">
            <div>
              <strong>{brain.label}</strong>
              <span>{brain.specialty}</span>
            </div>
            <div className="autonomy-inline-metrics">
              <em>{brain.status}</em>
              <em>autonomia {brain.autonomyLevel}/100</em>
              <em>carga {brain.load}%</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
