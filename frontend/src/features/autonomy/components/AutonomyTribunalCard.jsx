export default function AutonomyTribunalCard({ tribunal, loading, onJudge }) {
  const judges = tribunal?.judges || [];
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header">
        <div><span className="autonomy-eyebrow">Tribunal</span><h3>Tribunal de conflitos</h3></div>
        <p>Resolve disputas entre cérebros, missões e políticas internas.</p>
      </header>
      <div className="autonomy-list">
        {judges.map((judge) => (
          <div key={judge.id} className="autonomy-list-item">
            <strong>{judge.role}</strong>
            <span>Peso: {judge.voteWeight}</span>
          </div>
        ))}
      </div>
      <button disabled={loading} onClick={() => onJudge?.({ title: 'Disputa de prioridade', severity: 'medium' })}>Julgar conflito</button>
    </article>
  );
}
