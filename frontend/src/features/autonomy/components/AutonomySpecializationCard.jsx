export default function AutonomySpecializationCard({ items = [] }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Especialização</span>
          <h3>Dono cerebral por módulo</h3>
        </div>
        <p>Cada módulo passa a ter um cérebro principal responsável por decisão e execução coordenada.</p>
      </header>
      <div className="autonomy-list">
        {items.map((item) => (
          <article key={item.id} className="autonomy-list-item">
            <div>
              <strong>{item.label}</strong>
              <span>{item.specialty}</span>
            </div>
            <div className="autonomy-inline-metrics">
              <em>{item.ownerBrain}</em>
              <em>{item.maturity}</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
