export default function AutonomyModulesCard({ modules = [], summary }) {
  return (
    <section className="autonomy-modules-card">
      <header>
        <h4>Runtime e módulos</h4>
        <p>Visão compacta do que a Megan está preservando enquanto evolui.</p>
      </header>

      <div className="autonomy-module-list">
        {modules.map((module) => (
          <article key={module.id}>
            <strong>{module.label}</strong>
            <span>{module.status}</span>
          </article>
        ))}
      </div>

      <div className="autonomy-runtime-grid">
        <div>
          <span>Erros abertos</span>
          <strong>{summary?.openErrors ?? 0}</strong>
        </div>
        <div>
          <span>Aprovações pendentes</span>
          <strong>{summary?.pendingApprovals ?? 0}</strong>
        </div>
        <div>
          <span>Backlog de melhoria</span>
          <strong>{summary?.improvementBacklog ?? 0}</strong>
        </div>
        <div>
          <span>Duplicações</span>
          <strong>{summary?.duplicateCount ?? 0}</strong>
        </div>
      </div>
    </section>
  );
}
