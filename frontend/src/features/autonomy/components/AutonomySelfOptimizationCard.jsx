export default function AutonomySelfOptimizationCard({ optimization, growthPlan }) {
  const items = optimization?.items || [];
  const growth = growthPlan?.items || [];
  return <section className="card"><div className="card-header"><h3>Self Optimization</h3></div><div className="list">{items.map((item) => <div key={item.id} className="list-item"><strong>{item.title}</strong><span>{item.impact} · {item.reason}</span></div>)}{growth.map((item) => <div key={item.id} className="list-item"><strong>{item.title}</strong><span>progresso {item.progress}%</span></div>)}</div></section>;
}
