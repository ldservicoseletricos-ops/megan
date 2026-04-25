export default function AutonomyDecisionCard({ status, simulation }) {
  const decision = simulation?.simulated || status?.state?.lastDecision;
  const risk = simulation?.simulated?.risk || null;

  return (
    <section className="autonomy-decision-card">
      <header>
        <h4>Última decisão / simulação</h4>
        <p>Mostra a próxima ação escolhida pelo núcleo autônomo e o risco calculado.</p>
      </header>

      <div className="autonomy-decision-grid">
        <div>
          <span>Ação</span>
          <strong>{decision?.title || 'Nenhuma decisão registrada ainda'}</strong>
        </div>
        <div>
          <span>Tipo</span>
          <strong>{decision?.actionType || '—'}</strong>
        </div>
        <div>
          <span>Motivo</span>
          <strong>{decision?.reason || '—'}</strong>
        </div>
        <div>
          <span>Impacto esperado</span>
          <strong>{decision?.expectedImpact || '—'}</strong>
        </div>
        <div>
          <span>Risco</span>
          <strong>{risk ? `${risk.level} (${risk.score})` : status?.state?.riskLevel || '—'}</strong>
        </div>
        <div>
          <span>Política</span>
          <strong>{simulation?.simulated?.policy?.mode || '—'}</strong>
        </div>
      </div>
    </section>
  );
}
