export default function AutonomySolutionSynthesisCard({ synthesis, loading, onSynthesize }) {
  const item = synthesis?.synthesis || synthesis;
  return (
    <article className="autonomy-card autonomy-compact-card">
      <div className="card-title-row"><span>Solution Synthesis</span><strong>{item?.recommendation || 'híbrido'}</strong></div>
      <p className="muted">Combina ideias fortes em um plano executável com risco controlado.</p>
      {item ? (
        <div className="mini-list">
          <div className="mini-row"><div><strong>{item.title}</strong><span>{item.strategy}</span></div><b>{item.expectedImpact}</b></div>
          {(item.phases || []).slice(0, 4).map((phase, idx) => <span key={phase} className="pill-soft">{idx + 1}. {phase}</span>)}
        </div>
      ) : <span className="muted">Nenhuma síntese executada ainda.</span>}
      <button type="button" disabled={loading} onClick={() => onSynthesize?.({ title: 'Plano híbrido Megan 3.3' })}>Sintetizar solução</button>
    </article>
  );
}
