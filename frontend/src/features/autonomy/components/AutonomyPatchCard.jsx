export default function AutonomyPatchCard({ patchHistory = [], loading, onApplySafePatch }) {
  const latest = patchHistory[0] || null;
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Patch seguro</span>
          <h3>Engine de patch</h3>
        </div>
        <p>Aplica melhorias seguras no núcleo autônomo conforme política.</p>
      </header>

      {latest ? (
        <div className="autonomy-list-item">
          <div>
            <strong>{latest.title}</strong>
            <p>{latest.summary}</p>
          </div>
          <span className={`autonomy-badge autonomy-status-${latest.status}`}>{latest.status}</span>
        </div>
      ) : <p className="autonomy-empty">Nenhum patch registrado ainda.</p>}

      <div className="autonomy-inline-actions">
        <button disabled={loading} onClick={() => onApplySafePatch('update_autonomy_state')}>Patch de estado</button>
        <button disabled={loading} onClick={() => onApplySafePatch('tune_autonomy_frontend_panel')}>Patch do painel</button>
        <button disabled={loading} onClick={() => onApplySafePatch('deploy_to_production')}>Simular bloqueado</button>
      </div>

      <div className="autonomy-list">
        {patchHistory.slice(0, 4).map((patch) => (
          <article key={patch.id} className="autonomy-list-item">
            <div>
              <strong>{patch.title}</strong>
              <p>{patch.scope} • {patch.validationStatus}</p>
            </div>
            <span className={`autonomy-badge autonomy-status-${patch.status}`}>{patch.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
