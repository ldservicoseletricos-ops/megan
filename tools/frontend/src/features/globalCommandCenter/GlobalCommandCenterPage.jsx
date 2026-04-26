import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 4.9 — CENTRAL DE COMANDO GLOBAL',
  focus: 'Painel único para vida, empresas, equipes, vendas, alertas, metas e agentes.',
  status: 'offline_preview',
  health: { globalScore: 0, operationMode: 'preview', riskLevel: 'controlado', lastSync: '' },
  areas: [],
  metrics: { activeAreas: 0, alertsOpen: 0, goalsTracked: 0, agentsOnline: 0, salesPipeline: 0, teamTasks: 0, personalFocus: 0, companyPulse: 0 },
  alerts: [],
  goals: [],
  agents: [],
  commandTimeline: []
};

function MetricCard({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function AreaCard({ area }) {
  return <article className="autoempresa-lead-card"><div><strong>{area.title}</strong><span>{area.status}</span></div><p>{area.summary}</p><footer><em>score {area.score}%</em><b>{area.trend}</b></footer></article>;
}

function AlertCard({ alert, onResolve, disabled }) {
  return <article className="autoempresa-lead-card"><div><strong>{alert.title}</strong><span>{alert.level}</span></div><p>{alert.action}</p><footer><em>{alert.area} • {alert.status}</em><button type="button" onClick={() => onResolve(alert.id)} disabled={disabled}>Resolver</button></footer></article>;
}

function GoalCard({ goal }) {
  return <article className="autoempresa-lead-card"><div><strong>{goal.title}</strong><span>{goal.area}</span></div><p>{goal.nextStep}</p><footer><em>progresso</em><b>{goal.progress}%</b></footer></article>;
}

function AgentCard({ agent }) {
  return <article className="autoempresa-lead-card"><div><strong>{agent.name}</strong><span>{agent.status}</span></div><p>{agent.currentTask}</p><footer><em>{agent.id}</em><b>{agent.autonomy}% autonomia</b></footer></article>;
}

function TimelineCard({ item }) {
  return <article className="autoempresa-lead-card"><div><strong>{item.command}</strong><span>{item.status}</span></div><p>{item.result}</p><footer><em>{item.agent || 'Megan Global'}</em><b>{item.risk || 'low'}</b></footer></article>;
}

export default function GlobalCommandCenterPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [command, setCommand] = useState('Megan, mostrar visão global e próximos passos');
  const [goal, setGoal] = useState({ area: 'empresas', title: 'Fechar novo contrato B2B', nextStep: 'Gerar proposta e iniciar follow-up.', progress: 10 });

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/global-command-center/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar a Central Global.');
      setDashboard(fallbackDashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function runCommand(event) {
    event.preventDefault();
    setWorking(true);
    try {
      await apiPost('/api/global-command-center/command', { command });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao executar comando global.');
    } finally {
      setWorking(false);
    }
  }

  async function createGoal(event) {
    event.preventDefault();
    setWorking(true);
    try {
      await apiPost('/api/global-command-center/goal', goal);
      setGoal({ area: 'empresas', title: '', nextStep: '', progress: 0 });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao criar meta.');
    } finally {
      setWorking(false);
    }
  }

  async function resolveAlert(alertId) {
    setWorking(true);
    try {
      await apiPost('/api/global-command-center/alert/resolve', { alertId });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao resolver alerta.');
    } finally {
      setWorking(false);
    }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const health = dashboard.health || fallbackDashboard.health;
  const criticalAlerts = useMemo(() => (dashboard.alerts || []).filter((item) => item.status !== 'resolved_supervised'), [dashboard.alerts]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 4.9</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={loadDashboard} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar central'}</button>
            <button className="ghost" onClick={() => setCommand('Megan, priorizar vendas, cobranças e equipe')} disabled={working}>Priorizar operação</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Score Global</strong><b>{health.globalScore}%</b><span>{health.operationMode} • risco {health.riskLevel}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Áreas ativas" value={metrics.activeAreas} caption="vida, empresas e operação" />
        <MetricCard label="Alertas" value={metrics.alertsOpen} caption="pendências abertas" />
        <MetricCard label="Metas" value={metrics.goalsTracked} caption="acompanhadas pela Megan" />
        <MetricCard label="Agentes" value={metrics.agentsOnline} caption="online ou supervisionados" />
        <MetricCard label="Pipeline" value={metrics.salesPipeline} caption="oportunidades de venda" />
        <MetricCard label="Tarefas" value={metrics.teamTasks} caption="equipe e operação" />
        <MetricCard label="Vida" value={`${metrics.personalFocus}%`} caption="foco pessoal" />
        <MetricCard label="Empresa" value={`${metrics.companyPulse}%`} caption="pulso operacional" />
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Comando global</span><strong>Orquestra vida, negócios e agentes</strong></div>
          <form className="autoempresa-form" onSubmit={runCommand}>
            <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Ex: Megan, priorizar vendas e cobranças" />
            <button type="submit" disabled={working}>{working ? 'Executando...' : 'Executar comando global'}</button>
          </form>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Nova meta</span><strong>Meta viva na Central Global</strong></div>
          <form className="autoempresa-form" onSubmit={createGoal}>
            <select value={goal.area} onChange={(event) => setGoal({ ...goal, area: event.target.value })}>
              <option>vida</option><option>empresas</option><option>equipes</option><option>vendas</option><option>metas</option><option>agentes</option>
            </select>
            <input value={goal.title} onChange={(event) => setGoal({ ...goal, title: event.target.value })} placeholder="Título da meta" />
            <input value={goal.nextStep} onChange={(event) => setGoal({ ...goal, nextStep: event.target.value })} placeholder="Próximo passo" />
            <button type="submit" disabled={working || !goal.title}>Criar meta</button>
          </form>
        </div>
      </section>

      <section className="autoempresa-panel">
        <div className="autoempresa-panel-title"><span>Mapa global</span><strong>Vida • empresas • equipes • vendas • alertas • metas • agentes</strong></div>
        <div className="autoempresa-leads-list autoempresa-grid-list">{(dashboard.areas || []).map((area) => <AreaCard key={area.id} area={area} />)}</div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Alertas vivos</span><strong>{criticalAlerts.length} alertas exigem atenção</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.alerts || []).slice(0, 8).map((alert) => <AlertCard key={alert.id} alert={alert} onResolve={resolveAlert} disabled={working} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Metas</span><strong>Próximos passos assistidos</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.goals || []).slice(0, 8).map((goalItem) => <GoalCard key={goalItem.id} goal={goalItem} />)}</div>
        </div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Agentes</span><strong>Operação global supervisionada</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.agents || []).map((agent) => <AgentCard key={agent.id} agent={agent} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Linha do tempo</span><strong>Comandos globais recentes</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.commandTimeline || []).slice(0, 8).map((item) => <TimelineCard key={item.id} item={item} />)}</div>
        </div>
      </section>
    </div>
  );
}
