function ScoreBar({ label, value, tone = 'cyan' }) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <article className="autonomy-adaptive-row">
      <div>
        <strong>{label}</strong>
        <span>{safe}/100</span>
      </div>
      <div className="autonomy-progress-track">
        <div className={`autonomy-progress-fill autonomy-progress-${tone}`} style={{ width: `${safe}%` }} />
      </div>
    </article>
  );
}

export default function AutonomyAdaptiveScoresCard({ scores = {} }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Score adaptativo</span>
          <h3>Leitura dinâmica da evolução</h3>
        </div>
        <p>A Megan recalibra estes indicadores conforme sucesso, risco e impacto real dos ciclos.</p>
      </header>
      <div className="autonomy-adaptive-grid">
        <ScoreBar label="Autonomia" value={scores.autonomy} tone="cyan" />
        <ScoreBar label="Estabilidade" value={scores.stability} tone="emerald" />
        <ScoreBar label="Maturidade" value={scores.maturity} tone="violet" />
        <ScoreBar label="Assertividade" value={scores.assertiveness} tone="amber" />
        <ScoreBar label="Velocidade de resolução" value={scores.resolutionVelocity} tone="cyan" />
        <ScoreBar label="Segurança operacional" value={100 - Number(scores.operationalRisk || 0)} tone="rose" />
      </div>
    </section>
  );
}
