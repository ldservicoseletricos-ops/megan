export default function AutonomyCommunicationScoreCard({ score }) {
  const dimensions = score?.dimensions || {};
  return (
    <article className="autonomy-card">
      <div className="autonomy-card-header">
        <span>Communication Score</span>
        <strong>{score?.score ?? 0}/100</strong>
      </div>
      <div className="autonomy-mini-grid">
        <span>Clareza: {dimensions.clarity ?? 0}</span>
        <span>Ação: {dimensions.actionability ?? 0}</span>
        <span>Empatia: {dimensions.empathy ?? 0}</span>
        <span>Ruído: {dimensions.noiseControl ?? 0}</span>
      </div>
      <p className="autonomy-muted">Mantém respostas mais úteis, diretas e testáveis conforme o contexto.</p>
    </article>
  );
}
