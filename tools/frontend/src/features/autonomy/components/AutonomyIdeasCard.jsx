export default function AutonomyIdeasCard({ ideas, loading, onGenerate }) {
  const items = Array.isArray(ideas?.ideas) ? ideas.ideas : Array.isArray(ideas) ? ideas : [];
  return (
    <article className="autonomy-card autonomy-compact-card">
      <div className="card-title-row"><span>Idea Generator 3.3</span><strong>{items.length}</strong></div>
      <p className="muted">Novas opções estratégicas criadas pelo núcleo de criatividade guiada.</p>
      <div className="mini-list">
        {items.slice(0, 4).map((idea) => (
          <div key={idea.id || idea.title} className="mini-row">
            <div><strong>{idea.title}</strong><span>{idea.reason || idea.area}</span></div>
            <b>{Math.round(idea.score || idea.impact || 0)}</b>
          </div>
        ))}
        {!items.length ? <span className="muted">Nenhuma ideia carregada ainda.</span> : null}
      </div>
      <button type="button" disabled={loading} onClick={() => onGenerate?.({ intent: 'gerar soluções estratégicas para evolução da Megan OS' })}>Gerar ideias</button>
    </article>
  );
}
