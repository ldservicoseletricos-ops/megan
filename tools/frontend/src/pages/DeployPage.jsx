function Meter({ label, value }) {
  return (
    <div className="bar-row">
      <div className="bar-top"><span>{label}</span><strong>{value}%</strong></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default function DeployPage({ data, runAction, busyAction }) {
  const deploy = Number(data.state.deployReadiness || 10);
  return (
    <div className="page-grid">
      <section className="hero card">
        <div>
          <h2>Deploy Control</h2>
          <p>Tela própria para Render, Vercel, health, estabilidade e guarda de publicação.</p>
        </div>
        <div className="score-badge">{deploy}%</div>
      </section>

      <section className="card">
        <h3>Estabilidade operacional</h3>
        <Meter label="Deploy readiness" value={deploy} />
        <Meter label="Health" value={93} />
        <Meter label="Rollback safety" value={81} />
        <Meter label="Runtime" value={88} />
      </section>

      <section className="card">
        <h3>Execuções rápidas</h3>
        <div className="action-grid">
          <button className="cta" disabled={!!busyAction} onClick={() => runAction("Verificar deploy", "/api/master/deploy/preflight")}>Verificar deploy</button>
          <button className="cta" disabled={!!busyAction} onClick={() => runAction("Executar ciclo", "/api/master/run-cycle", {})}>Executar ciclo</button>
          <button className="cta alt" disabled={!!busyAction} onClick={() => runAction("Rodar self test", "/api/omega-final/test", {})}>Rodar self test</button>
        </div>
      </section>
    </div>
  );
}
