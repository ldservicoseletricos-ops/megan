export default function AutonomyInterfaceProfileCard({ profile, loading, onAdapt }) {
  return (
    <article className="autonomy-card">
      <div className="autonomy-card-header">
        <span>Interface Mode</span>
        <strong>{profile?.interfaceMode || 'premium_guided_mode'}</strong>
      </div>
      <p className="autonomy-muted">Ajusta densidade, prioridade visual e tom da Megan conforme o momento do usuário.</p>
      <ul className="autonomy-list">
        <li>Tom: {profile?.responseStyle?.tone || 'claro e prático'}</li>
        <li>Densidade: {profile?.responseStyle?.density || 'normal'}</li>
        <li>Estrutura: {profile?.responseStyle?.structure || 'objetivo → ação → validação'}</li>
      </ul>
      <button type="button" disabled={loading} onClick={() => onAdapt?.({ source: 'autonomy_center', text: 'adaptar interface ao contexto atual' })}>Adaptar interface</button>
    </article>
  );
}
