export default function SettingsPage({ API }) {
  return (
    <div className="page-grid">
      <section className="card">
        <h2>Configurações</h2>
        <div className="kv-grid mono">
          <div><span>API</span><strong>{API}</strong></div>
          <div><span>Theme</span><strong>Omega Dark</strong></div>
          <div><span>Modo</span><strong>Live Control</strong></div>
          <div><span>Atualização</span><strong>15s</strong></div>
        </div>
      </section>
    </div>
  );
}
