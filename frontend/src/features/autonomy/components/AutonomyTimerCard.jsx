export default function AutonomyTimerCard({ timer, loading, onStart, onStop, onTick }) {
  return (
    <section className="autonomy-card">
      <header className="autonomy-card-header">
        <div>
          <span className="autonomy-eyebrow">Execução contínua</span>
          <h3>Timer autônomo</h3>
        </div>
        <p>Controla os ciclos automáticos da Megan dentro da política atual.</p>
      </header>

      <div className="autonomy-timer-grid">
        <div className="autonomy-list-item">
          <div>
            <strong>{timer?.running ? 'Ativo' : 'Parado'}</strong>
            <p>Intervalo atual: {Math.round((timer?.intervalMs || 30000) / 1000)}s</p>
          </div>
          <span className={`autonomy-badge ${timer?.running ? 'autonomy-status-approved' : 'autonomy-status-ready'}`}>
            {timer?.running ? 'rodando' : 'aguardando'}
          </span>
        </div>

        <div className="autonomy-inline-actions">
          <button disabled={loading} onClick={onStart}>Iniciar timer</button>
          <button disabled={loading} onClick={onStop}>Parar timer</button>
          <button disabled={loading} onClick={onTick}>Executar tick</button>
        </div>

        <div className="autonomy-meta-block">
          <span>Continuous mode: {timer?.continuousMode ? 'ligado' : 'desligado'}</span>
          <span>Último tick: {timer?.lastTimerRunAt ? new Date(timer.lastTimerRunAt).toLocaleString('pt-BR') : 'ainda não executado'}</span>
        </div>
      </div>
    </section>
  );
}
