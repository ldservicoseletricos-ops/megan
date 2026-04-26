export default function AutonomyConversionCard({ conversion }) {
  const leads = conversion?.leads || [];
  return <article className="autonomy-card"><header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Conversão</span><h3>Inteligência comercial</h3></div><p>Score médio: {conversion?.averageScore || 0}/100</p></header><div className="autonomy-list">{leads.slice(0,4).map((lead)=><div className="autonomy-list-item" key={lead.id}><strong>{lead.name} · {lead.conversionScore}</strong><span>Risco: {lead.riskOfLoss}</span><small>{lead.recommendedMove}</small></div>)}</div></article>;
}
