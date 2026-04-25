export default function AutonomyPipelineCard({ pipeline }) {
  const stages = pipeline?.pipeline || [];
  return <article className="autonomy-card"><header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Pipeline</span><h3>Funil comercial</h3></div><p>Valor bruto e ponderado por estágio.</p></header><div className="autonomy-list">{stages.map((stage)=><div className="autonomy-list-item" key={stage.stage}><strong>{stage.stage}</strong><span>{stage.count} leads · R$ {stage.value}</span><small>Ponderado: R$ {stage.weighted}</small></div>)}</div></article>;
}
