function ScorePill({ label, value, accent }) {
  return (
    <article className={`autonomy-score-pill autonomy-score-${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default function AutonomyScoresCard({ snapshot, dashboard }) {
  const scores = snapshot?.scores || {};
  const projectHealth = dashboard?.projectHealth?.totalScore || scores.projectHealth || 0;

  return (
    <section className="autonomy-scores-card">
      <header>
        <h4>Scores centrais</h4>
        <p>Leitura consolidada do nível atual de autonomia, estabilidade e maturidade.</p>
      </header>

      <div className="autonomy-score-grid">
        <ScorePill label="Autonomia" value={`${scores.autonomy || 0}/100`} accent="cyan" />
        <ScorePill label="Estabilidade" value={`${scores.stability || 0}/100`} accent="emerald" />
        <ScorePill label="Maturidade" value={`${scores.maturity || 0}/100`} accent="violet" />
        <ScorePill label="Saúde do projeto" value={`${projectHealth}/100`} accent="amber" />
      </div>
    </section>
  );
}
