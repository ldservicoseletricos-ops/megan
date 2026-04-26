export default function AutonomyAuditCard({ audit, loading, onRun }) {
  const issues = audit?.issues || [];
  return <section className="card"><div className="card-header"><h3>Internal Audit</h3><button disabled={loading} onClick={() => onRun?.()}>Rodar auditoria</button></div><div className="stats"><div><span>Score</span><strong>{audit?.score ?? '--'}</strong></div><div><span>Status</span><strong>{audit?.status || '--'}</strong></div></div><div className="list">{issues.map((item) => <div key={item.id} className="list-item"><strong>{item.title}</strong><span>{item.severity} · {item.recommendation}</span></div>)}</div></section>;
}
