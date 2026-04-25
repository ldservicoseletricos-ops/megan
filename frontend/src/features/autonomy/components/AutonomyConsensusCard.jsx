export default function AutonomyConsensusCard({ consensus, history = [], loading, onDecide }) {
  const current = consensus?.consensus || consensus;
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Consenso interno</span>
          <h3>Decisão antes da execução</h3>
        </div>
        <p>{current?.summary || 'Avalie aprovação interna antes de executar ações sensíveis.'}</p>
      </header>
      <div className="autonomy-button-row">
        <button disabled={loading} onClick={() => onDecide?.({})}>Rodar consenso</button>
      </div>
      <div className="autonomy-note-block">
        <strong>Nível:</strong> {current?.consensusLevel || 'n/d'} · <strong>Aprovação:</strong> {current?.approvalRate || 0}% · <strong>Suporte médio:</strong> {current?.averageSupport || 0}/100
      </div>
      <div className="autonomy-list">
        {(history || current?.ballots || []).slice(0, 4).map((item, index) => (
          <article key={item.id || item.brainId || index} className="autonomy-list-item">
            <div>
              <strong>{item.label || item.action || item.brainId || 'Registro de consenso'}</strong>
              <span>{item.rationale || item.consensusLevel || 'voto registrado'}</span>
            </div>
            <div className="autonomy-inline-metrics">
              <em>{item.vote || item.approved ? 'approve' : item.consensusLevel || 'review'}</em>
              <em>{item.supportScore || item.approvalRate || 0}</em>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
