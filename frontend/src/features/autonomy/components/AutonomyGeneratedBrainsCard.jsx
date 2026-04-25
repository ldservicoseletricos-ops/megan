export default function AutonomyGeneratedBrainsCard({ brains, loading, onCreate }) {
  const items = brains || [];
  return <section className="card"><div className="card-header"><h3>New Brains Created</h3><button disabled={loading} onClick={() => onCreate?.({ specialty: 'deploy-specialist', name: 'deploy-specialist' })}>Criar cérebro</button></div><div className="list">{items.map((item) => <div key={item.id} className="list-item"><strong>{item.name}</strong><span>{item.specialty} · confiança {Math.round((item.trustScore || 0.6) * 100)}%</span></div>)}{!items.length ? <div className="hint">Nenhum cérebro gerado ainda.</div> : null}</div></section>;
}
