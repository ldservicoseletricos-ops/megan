import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 4.6 — AGENTES AUTÔNOMOS REAIS',
  status: 'offline_preview',
  safetyMode: 'supervisionado',
  focus: 'Agentes executam ciclos recorrentes sem depender de comando manual, com limites de segurança.',
  autonomyScore: 0,
  metrics: { agents: 0, runningAgents: 0, queuedTasks: 0, executions: 0, pendingApprovals: 0 },
  agents: [], queue: [], executions: [], approvals: [], policies: []
};

function MetricCard({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function AgentCard({ agent, onRun, onToggle }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{agent.name}</strong><span>{agent.status}</span></div>
      <p>{agent.nextAction}</p>
      <footer><em>{agent.cadence}</em><b>{agent.area}</b></footer>
      <div className="autoempresa-actions compact-actions">
        <button onClick={() => onRun(agent.id)}>Rodar ciclo</button>
        <button className="ghost" onClick={() => onToggle(agent.id, agent.status === 'running' ? 'standby' : 'running')}>{agent.status === 'running' ? 'Pausar' : 'Ativar'}</button>
      </div>
    </article>
  );
}

function ExecutionCard({ item }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{item.agentName || item.agentId}</strong><span>{item.status}</span></div>
      <p>{item.taskTitle}</p>
      <footer><em>{item.result}</em><b>{item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR') : 'agora'}</b></footer>
    </article>
  );
}

export default function AutonomousAgentsPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/autonomous-agents/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar agentes autônomos.');
      setDashboard(fallbackDashboard);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function runCycle(agentId = null) {
    setRunning(true);
    try {
      await apiPost('/api/autonomous-agents/run-cycle', agentId ? { agentId, force: true } : { force: false });
      await loadDashboard();
    } catch (err) { setError(err.message || 'Falha ao executar ciclo autônomo.'); }
    finally { setRunning(false); }
  }

  async function toggleAgent(agentId, status) {
    try {
      await apiPost('/api/autonomous-agents/agent-status', { agentId, status });
      await loadDashboard();
    } catch (err) { setError(err.message || 'Falha ao atualizar agente.'); }
  }

  async function approveFirst() {
    const approval = (dashboard.approvals || []).find((item) => item.status === 'pending');
    if (!approval) return;
    setRunning(true);
    try {
      await apiPost('/api/autonomous-agents/approve', { approvalId: approval.id, approved: true });
      await loadDashboard();
    } catch (err) { setError(err.message || 'Falha ao aprovar ação.'); }
    finally { setRunning(false); }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const pendingApprovals = useMemo(() => (dashboard.approvals || []).filter((item) => item.status === 'pending'), [dashboard.approvals]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 4.6</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={() => runCycle()} disabled={running}>{running ? 'Executando...' : 'Rodar todos os agentes'}</button>
            <button className="ghost" onClick={approveFirst} disabled={running || pendingApprovals.length === 0}>Aprovar próxima ação</button>
            <button className="ghost" onClick={loadDashboard} disabled={loading}>Atualizar painel</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Autonomia supervisionada</strong><b>{dashboard.autonomyScore || 0}%</b><span>{dashboard.safetyMode || dashboard.status}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Agentes" value={metrics.agents} caption="especialistas cadastrados" />
        <MetricCard label="Rodando" value={metrics.runningAgents} caption="execução recorrente" />
        <MetricCard label="Fila" value={metrics.queuedTasks} caption="tarefas prontas" />
        <MetricCard label="Execuções" value={metrics.executions} caption="logs auditáveis" />
        <MetricCard label="Aprovações" value={metrics.pendingApprovals} caption="ações sensíveis" />
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Agentes ativos</span><strong>Vendas, suporte, deploy e financeiro</strong></div>
          <div className="autoempresa-leads-list">
            {(dashboard.agents || []).map((agent) => <AgentCard key={agent.id} agent={agent} onRun={runCycle} onToggle={toggleAgent} />)}
          </div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Execução real supervisionada</span><strong>Histórico e aprovações</strong></div>
          <div className="autoempresa-leads-list">
            {pendingApprovals.slice(0, 3).map((item) => <ExecutionCard key={item.id} item={{ ...item, agentName: item.agentName, status: item.status, taskTitle: item.title, result: item.requestedAction, createdAt: item.createdAt }} />)}
            {(dashboard.executions || []).slice(0, 5).map((item) => <ExecutionCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      <section className="autoempresa-panel">
        <div className="autoempresa-panel-title"><span>Políticas de segurança</span><strong>Autonomia com controle</strong></div>
        <div className="autoempresa-capabilities">
          {(dashboard.policies || []).map((policy) => <em key={policy}>{policy}</em>)}
        </div>
      </section>
    </div>
  );
}
