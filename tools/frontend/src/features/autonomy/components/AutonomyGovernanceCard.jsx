export default function AutonomyGovernanceCard({ governance, loading, onVote }) {
  const layers = governance?.layers || [];
  const status = governance?.governanceStatus || {};
  return (
    <section className="card">
      <div className="card-header">
        <h3>Governança interna</h3>
        <button disabled={loading} onClick={() => onVote?.({ context: 'balanced', actionType: 'coordinated_execution' })}>Rodar voto</button>
      </div>
      <div className="stats">
        <div><span>Modo</span><strong>{status.mode || '--'}</strong></div>
        <div><span>Regra</span><strong>{status.voteRule || '--'}</strong></div>
        <div><span>Threshold</span><strong>{status.consensusThreshold ?? '--'}</strong></div>
      </div>
      <div className="list">
        {layers.map((item) => (
          <div key={item.id} className="list-item">
            <strong>{item.label}</strong>
            <span>{item.authority}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
