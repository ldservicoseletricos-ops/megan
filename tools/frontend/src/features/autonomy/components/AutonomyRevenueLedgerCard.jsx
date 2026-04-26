export default function AutonomyRevenueLedgerCard({ revenue }) {
  const forecast = revenue?.forecast || [];
  return <article className="autonomy-card"><header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Receita</span><h3>Revenue ledger</h3></div><p>Receita esperada: R$ {revenue?.expectedRevenue || 0}</p></header><div className="autonomy-list">{forecast.slice(0,5).map((item)=><div className="autonomy-list-item" key={item.id}><strong>{item.lead}</strong><span>R$ {item.expected} esperado · {item.period}</span><small>Bruto R$ {item.gross} · {item.probability}%</small></div>)}</div></article>;
}
