const defaultFiles = [
  { path: 'backend/src/modules/autonomy/autonomy.routes.js', role: 'update' },
  { path: 'backend/src/modules/autonomy/autonomy.service.js', role: 'update' },
  { path: 'frontend/src/features/autonomy/services/autonomyApi.js', role: 'update' },
  { path: 'frontend/src/features/autonomy/pages/AutonomyCenterPage.jsx', role: 'update' },
  { path: 'frontend/src/features/autonomy/components/AutonomyMultiPatchCard.jsx', role: 'create' },
];

export default function AutonomyMultiPatchCard({ lastMultiPatch, loading, onValidate, onApply }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Patch multiarquivo</span>
          <h3>Planejador validado</h3>
        </div>
        <p>Coordena mudanças em backend e frontend com validação de dependências cruzadas.</p>
      </header>
      {lastMultiPatch ? (
        <div className="autonomy-list-item">
          <div>
            <strong>{lastMultiPatch.title}</strong>
            <p>{lastMultiPatch.files?.length || 0} arquivos • {lastMultiPatch.complexity || 'low'} • impacto {lastMultiPatch.impactScore || 0}</p>
          </div>
          <span className={`autonomy-badge autonomy-status-${lastMultiPatch.status}`}>{lastMultiPatch.status}</span>
        </div>
      ) : <p className="autonomy-empty">Nenhum patch multiarquivo registrado ainda.</p>}
      <div className="autonomy-inline-actions">
        <button disabled={loading} onClick={() => onValidate(defaultFiles)}>Validar plano padrão</button>
        <button disabled={loading} onClick={() => onApply({ actionType: 'apply_multi_file_patch', files: defaultFiles })}>Aplicar patch 1.7</button>
      </div>
      <div className="autonomy-code-list">
        {defaultFiles.map((file) => <code key={file.path}>{file.path}</code>)}
      </div>
    </section>
  );
}
