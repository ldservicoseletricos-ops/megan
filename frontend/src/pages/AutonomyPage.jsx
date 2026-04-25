export default function AutonomyPage({ data, runAction, busyAction }) {
  const self = data.self?.dashboard || {};
  return (
    <div className="page-grid">
      <section className="hero card">
        <div>
          <h2>Autonomia supervisionada</h2>
          <p>Observer core, fila evolutiva, prioridade e execução assistida em tempo real.</p>
        </div>
        <div className="hero-orb small" />
      </section>
      <section className="card">
        <h3>Painel de autonomia</h3>
        <div className="kv-grid">
          <div><span>Score</span><strong>{self.score || 71}%</strong></div>
          <div><span>Foco</span><strong>{self.priorityFocus || "stability"}</strong></div>
          <div><span>Meta</span><strong>{self.weeklyGoal || "Elevar readiness"}</strong></div>
          <div><span>Modo</span><strong>{data.state.telemetryMode || "real"}</strong></div>
        </div>
      </section>
      <section className="card organism-30">
        <h3>Organismo Cognitivo 3.0</h3>
        <p className="muted">Coordenação total, evolução supervisionada e equilíbrio estratégico em um único núcleo.</p>
        <div className="kv-grid">
          <div><span>Status</span><strong>maduro supervisionado</strong></div>
          <div><span>Cognição</span><strong>unificada</strong></div>
          <div><span>Saúde</span><strong>matriz ativa</strong></div>
          <div><span>Balanceamento</span><strong>crescimento seguro</strong></div>
        </div>
      </section>
      <section className="card enterprise-39">
        <h3>Comando Multiempresa 3.9</h3>
        <p className="muted">Gestão centralizada de empresas, unidades, benchmarks e decisões executivas.</p>
        <div className="kv-grid">
          <div><span>Empresas</span><strong>3 contextos</strong></div>
          <div><span>Unidades</span><strong>4 operações</strong></div>
          <div><span>Comando</span><strong>centralizado</strong></div>
          <div><span>Benchmark</span><strong>ativo</strong></div>
        </div>
      </section>
      <section className="card">
        <h3>Ações de autonomia</h3>
        <div className="action-grid">
          <button className="cta" disabled={!!busyAction} onClick={() => runAction("Rodar scan", "/api/self-evolution/scan", {})}>Rodar scan</button>
          <button className="cta" disabled={!!busyAction} onClick={() => runAction("Run loop", "/api/omega-final/run-loop", {})}>Run loop</button>
          <button className="cta alt" disabled={!!busyAction} onClick={() => runAction("Autopilot", "/api/omega-final/autopilot", {})}>Business autopilot</button>
        </div>
      </section>
    </div>
  );
}
