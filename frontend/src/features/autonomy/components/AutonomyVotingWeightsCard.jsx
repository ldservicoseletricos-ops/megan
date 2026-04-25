export default function AutonomyVotingWeightsCard({ voting }) {
  const ballots = voting?.ballots || [];
  return (
    <section className="card">
      <div className="card-header"><h3>Pesos de voto por contexto</h3></div>
      <div className="stats">
        <div><span>Contexto</span><strong>{voting?.context || '--'}</strong></div>
        <div><span>Peso total</span><strong>{voting?.totalWeight ?? '--'}</strong></div>
        <div><span>Dominante</span><strong>{voting?.dominant?.label || '--'}</strong></div>
      </div>
      <div className="list">
        {ballots.map((item) => (
          <div key={item.id} className="list-item">
            <strong>{item.label}</strong>
            <span>peso {item.weight}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
