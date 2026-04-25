export default function AutonomyCapabilitiesCard({ capabilities, loading, onExpand }) {
  const items = capabilities?.items || [];
  return <section className="card"><div className="card-header"><h3>Capability Expansion</h3><button disabled={loading} onClick={() => onExpand?.({ area: 'deploy', name: 'Deploy Specialist Capability' })}>Expandir</button></div><div className="list">{items.map((item) => <div key={item.id} className="list-item"><strong>{item.name}</strong><span>{item.area} · nível {item.level}</span></div>)}{!items.length ? <div className="hint">Nenhuma capacidade gerada ainda.</div> : null}</div></section>;
}
