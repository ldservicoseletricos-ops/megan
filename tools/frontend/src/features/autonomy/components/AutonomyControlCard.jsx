import { useState } from 'react';

const MODES = [
  { id: 'observer', label: 'Observer' },
  { id: 'supervised_autonomy', label: 'Supervisionada' },
  { id: 'validated_execution', label: 'Execução validada' },
];

export default function AutonomyControlCard({ currentMode, loading, onRunCycle, onRunDiagnostics, onRunRepair, onChangeMode, onSetGoal }) {
  const [goalTitle, setGoalTitle] = useState('');
  const [goalSummary, setGoalSummary] = useState('');

  return (
    <section className="autonomy-control-card">
      <header>
        <h4>Comandos seguros</h4>
        <p>Executa ciclo, diagnóstico, reparo seguro e atualização de meta sem apagar o que já existe.</p>
      </header>

      <div className="autonomy-action-grid">
        <button disabled={loading} onClick={onRunCycle}>Rodar ciclo</button>
        <button disabled={loading} onClick={onRunDiagnostics}>Rodar diagnóstico</button>
        <button disabled={loading} onClick={() => onRunRepair('fallback_safe_mode')}>Reparo seguro</button>
      </div>

      <div className="autonomy-mode-grid">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            disabled={loading || mode.id === currentMode}
            className={mode.id === currentMode ? 'active' : ''}
            onClick={() => onChangeMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="autonomy-goal-form">
        <input
          value={goalTitle}
          onChange={(event) => setGoalTitle(event.target.value)}
          placeholder="Nova meta ativa"
        />
        <textarea
          value={goalSummary}
          onChange={(event) => setGoalSummary(event.target.value)}
          placeholder="Resumo da meta"
          rows={3}
        />
        <button
          disabled={loading || !goalTitle.trim()}
          onClick={() => {
            onSetGoal({ title: goalTitle.trim(), summary: goalSummary.trim() || 'Meta atualizada pelo operador principal.' });
            setGoalTitle('');
            setGoalSummary('');
          }}
        >
          Atualizar meta
        </button>
      </div>
    </section>
  );
}
