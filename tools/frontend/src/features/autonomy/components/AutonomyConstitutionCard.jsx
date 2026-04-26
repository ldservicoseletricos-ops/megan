export default function AutonomyConstitutionCard({ constitution }) {
  const principles = constitution?.principles || [];
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header">
        <div><span className="autonomy-eyebrow">Constituição</span><h3>Constituição interna</h3></div>
        <p>Princípios que limitam decisões autônomas e preservam o núcleo.</p>
      </header>
      <div className="autonomy-list">
        {principles.slice(0, 4).map((item) => (
          <div key={item.id} className="autonomy-list-item">
            <strong>{item.title}</strong>
            <span>{item.rule}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
