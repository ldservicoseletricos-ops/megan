export default function AutonomyHeroCard({ status, snapshot }) {
  return (
    <section className="autonomy-hero-card">
      <div>
        <span className="omega-kicker">AUTONOMY CORE 1.8</span>
        <h3>Planejamento estratégico com metas compostas</h3>
        <p>
          Megan agora combina decisão contínua, metas compostas, previsão de impacto futuro e roadmap autogerado,
          mantendo os módulos e a base já construídos.
        </p>
      </div>

      <div className="autonomy-hero-grid">
        <div>
          <span>Missão</span>
          <strong>{status?.state?.currentMission || 'Sem missão ativa'}</strong>
        </div>
        <div>
          <span>Meta</span>
          <strong>{status?.activeGoal?.title || snapshot?.goal?.title || 'Sem meta ativa'}</strong>
        </div>
        <div>
          <span>Prioridade</span>
          <strong>{status?.state?.currentPriorityLabel || status?.state?.currentPriority || 'Não definida'}</strong>
        </div>
        <div>
          <span>Brain ativo</span>
          <strong>{snapshot?.activeBrain || status?.state?.activeBrain || 'autonomy'}</strong>
        </div>
      </div>
    </section>
  );
}
