export default function AutonomyHumanContextCard({ context, loading, onAnalyze }) {
  const signals = context?.signals || {};
  return (
    <article className="autonomy-card">
      <div className="autonomy-card-header">
        <span>Human Context</span>
        <strong>{context?.mode || 'balanced_support'}</strong>
      </div>
      <p className="autonomy-muted">Detecta urgência, frustração, necessidade de validação e modo de resposta ideal.</p>
      <div className="autonomy-mini-grid">
        <span>Pressão: {context?.pressureScore ?? 0}/100</span>
        <span>Urgência: {signals.urgency ? 'sim' : 'não'}</span>
        <span>Frustração: {signals.frustration ? 'sim' : 'não'}</span>
        <span>Validação: {signals.precisionNeed ? 'sim' : 'não'}</span>
      </div>
      <button type="button" disabled={loading} onClick={() => onAnalyze?.({ text: 'validar resposta e reduzir atrito humano' })}>Analisar contexto</button>
    </article>
  );
}
