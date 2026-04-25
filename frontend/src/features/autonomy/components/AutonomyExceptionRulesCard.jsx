export default function AutonomyExceptionRulesCard({ rules, loading, onEvaluate }) {
  const exceptions = rules?.exceptions || [];
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header">
        <div><span className="autonomy-eyebrow">Exceções</span><h3>Regras de exceção</h3></div>
        <p>Quando a Megan pode alterar a ordem normal sem quebrar a política.</p>
      </header>
      <div className="autonomy-list">
        {exceptions.slice(0, 4).map((item) => (
          <div key={item.id} className="autonomy-list-item">
            <strong>{item.title}</strong>
            <span>Requer: {(item.requires || []).join(', ')}</span>
          </div>
        ))}
      </div>
      <button disabled={loading} onClick={() => onEvaluate?.({ exceptionId: exceptions[0]?.id || 'frontend-white-screen' })}>Avaliar exceção segura</button>
    </article>
  );
}
