export default function AutonomyLayeredPoliciesCard({ policies }) {
  const items = policies?.layers || [];
  return (
    <section className="card">
      <div className="card-header"><h3>Política multi-camadas</h3></div>
      <div className="list">
        {items.map((item) => (
          <div key={item.id} className="list-item">
            <strong>{item.label}</strong>
            <span>{item.execution} · {item.scope?.length || 0} ações</span>
          </div>
        ))}
        {!items.length ? <div className="hint">Sem políticas carregadas.</div> : null}
      </div>
    </section>
  );
}
