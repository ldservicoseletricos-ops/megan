export default function AutonomyPriorityCalendarCard({ calendar }) {
  const items = calendar?.items || [];
  return (
    <article className="autonomy-card">
      <header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Priority Calendar</span><h3>Agenda estratégica</h3></div><p>Janelas de prioridade para execução humana e Megan OS.</p></header>
      <div className="mini-list">
        {items.slice(0, 4).map((item) => <div key={`${item.date}-${item.window}-${item.title}`} className="mini-row"><span>{item.date} · {item.window} · {item.title}</span><strong>{item.priority}</strong></div>)}
      </div>
    </article>
  );
}
