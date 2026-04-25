export default function AutonomyExecutiveTodayCard({ today, loading, onPlan }) {
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Executive Today</span><h3>Plano executivo do dia</h3></div><p>{today?.headline || 'Plano diário ainda não carregado.'}</p></header>
      <div className="mini-list">
        {(today?.checklist || []).slice(0, 4).map((item) => <div key={item.label} className="mini-row"><span>{item.label}</span><strong>{item.priority}</strong></div>)}
      </div>
      <button disabled={loading} onClick={() => onPlan?.({ intent: 'montar plano executivo para hoje' })}>Gerar plano do dia</button>
    </article>
  );
}
