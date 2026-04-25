export default function AutonomySalesActionsCard({ actions, loading, onFollowup }) {
  const items = actions?.actions || [];
  return <article className="autonomy-card"><header className="autonomy-card-header"><div><span className="autonomy-eyebrow">Operador comercial</span><h3>Próximas ações</h3></div><p>Follow-ups e movimentos recomendados.</p></header><div className="autonomy-list">{items.slice(0,5).map((item)=><div className="autonomy-list-item" key={item.id}><strong>{item.lead}</strong><span>{item.action}</span><small>{item.reason}</small></div>)}</div><button disabled={loading} onClick={()=>onFollowup?.({})}>Gerar follow-up automático</button></article>;
}
