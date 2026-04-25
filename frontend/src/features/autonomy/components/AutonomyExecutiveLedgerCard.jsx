export default function AutonomyExecutiveLedgerCard({ ledger }) {
  const items = ledger?.items || [];
  return (
    <article className="autonomy-card autonomy-span-2">
      <header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Executive Ledger</span><h3>Histórico executivo</h3></div><p>Registro das decisões humanas e planos do assistente executivo.</p></header>
      <div className="mini-list">{items.slice(0, 5).map((item) => <div key={item.id} className="mini-row"><span>{item.title}</span><strong>{item.impact}</strong></div>)}</div>
    </article>
  );
}
