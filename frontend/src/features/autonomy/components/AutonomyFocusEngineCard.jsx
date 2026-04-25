export default function AutonomyFocusEngineCard({ focus }) {
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Focus Engine</span><h3>Foco agora</h3></div><p>{focus?.primaryFocus?.title || 'Sem foco primário definido.'}</p></header>
      <div className="score-line"><span>Deep work</span><strong>{focus?.attentionBudget?.deepWork || 0}%</strong></div>
      <div className="mini-list">{(focus?.recommendations || []).slice(0, 3).map((item) => <div key={item} className="mini-row"><span>{item}</span></div>)}</div>
    </article>
  );
}
