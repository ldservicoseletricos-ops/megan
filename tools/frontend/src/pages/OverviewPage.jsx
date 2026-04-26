function StatCard({ label, value, caption, live }) {
  return (
    <section className="card stat-card fade-up">
      <div className="stat-top">
        <span>{label}</span>
        <em>{live}</em>
      </div>
      <div className="stat-value">{value}</div>
      <p>{caption}</p>
    </section>
  );
}

function Bar({ label, value }) {
  return (
    <div className="bar-row">
      <div className="bar-top"><span>{label}</span><strong>{value}%</strong></div>
      <div className="bar-track"><div className="bar-fill" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function MiniLine() {
  return (
    <div className="chart-line">
      <svg viewBox="0 0 400 180" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#68d7ff" />
            <stop offset="100%" stopColor="#8d7cff" />
          </linearGradient>
        </defs>
        <path d="M0 150 C60 140, 90 130, 130 120 S220 80, 270 70 S340 88, 400 60" fill="none" stroke="url(#lineGrad)" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function OverviewPage({ data }) {
  const readiness = Number(data.overview.progress || data.state.readiness || 71);
  const git = Number(data.github?.dashboard?.score || 96);
  const deploy = Number(data.state.deployReadiness || 10);
  const version = data.health?.version || "25.4.0";
  return (
    <div className="page-grid">
      <section className="hero card shimmer">
        <div>
          <div className="eyebrow">OMEGA LIVE CONTROL</div>
          <h2>Central executiva da Megan com navegação por função</h2>
          <p>Visão limpa, organizada e premium da operação. Cada módulo abre sua função específica no painel lateral, com leitura real do backend, gráficos e status vivos.</p>
        </div>
        <div className="hero-orb" />
      </section>

      <div className="stats-grid">
        <StatCard label="Readiness" value={`${readiness}%`} caption="Capacidade geral da Megan" live="+12%" />
        <StatCard label="Git Engine" value={`${git}%`} caption="Prontidão supervisionada" live="ativo" />
        <StatCard label="Deploy" value={`${deploy}%`} caption="Fluxo e estabilidade" live="online" />
        <StatCard label="Version" value={version} caption={data.health?.service || "Megan Core Master Consolidado"} live="vivo" />
      </div>

      <section className="card">
        <h3>Performance por módulo</h3>
        <Bar label="Core" value={readiness} />
        <Bar label="Git" value={git} />
        <Bar label="Deploy" value={deploy} />
        <Bar label="QA" value={95} />
      </section>

      <section className="card">
        <h3>Curva de evolução da autonomia</h3>
        <MiniLine />
      </section>

      <section className="card">
        <h3>Issues prioritárias</h3>
        <div className="stack-list">
          {(data.issues.length ? data.issues.slice(0, 3) : [{title:"Issue 1"},{title:"Issue 2"},{title:"Issue 3"}]).map((x, i) => (
            <article className="list-card" key={i}>
              <strong>{x.title || x.name || `Issue ${i + 1}`}</strong>
              <p>{x.summary || x.description || "Sem detalhe adicional."}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Timeline recente</h3>
        <div className="stack-list">
          {(data.timeline.length ? data.timeline.slice(0, 6) : Array.from({length:6}, (_,i)=>({title:`Evento ${i+1}`}))).map((x, i) => (
            <article className="list-card" key={i}>
              <strong>{x.title || x.type || `Evento ${i + 1}`}</strong>
              <p>{x.summary || x.message || "Sem detalhe adicional."}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
