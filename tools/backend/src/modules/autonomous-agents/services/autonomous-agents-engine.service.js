const store = require('./autonomous-agents-store.service');

function now() { return new Date().toISOString(); }
function makeId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }

function calculateAutonomyScore(state) {
  const agents = state.agents || [];
  const running = agents.filter((agent) => agent.status === 'running').length;
  const readyTasks = (state.queue || []).filter((task) => task.status === 'ready').length;
  const executionBoost = Math.min((state.executions || []).length * 2, 12);
  return Math.min(99, Math.round(60 + (running * 7) + readyTasks + executionBoost));
}

function getDashboard() {
  const state = store.read();
  const agents = state.agents || [];
  const queue = state.queue || [];
  const executions = state.executions || [];
  const approvals = state.approvals || [];
  return {
    ok: true,
    title: state.title,
    version: state.version,
    status: state.status,
    focus: state.focus,
    safetyMode: state.safetyMode,
    autonomyScore: calculateAutonomyScore(state),
    metrics: {
      agents: agents.length,
      runningAgents: agents.filter((agent) => agent.status === 'running').length,
      queuedTasks: queue.filter((task) => task.status === 'ready').length,
      executions: executions.length,
      pendingApprovals: approvals.filter((item) => item.status === 'pending').length,
    },
    agents,
    queue,
    executions: executions.slice(0, 20),
    approvals: approvals.slice(0, 20),
    policies: state.policies || [],
  };
}

function getAgents() { return { ok: true, agents: store.read().agents || [] }; }
function getQueue() { return { ok: true, queue: store.read().queue || [] }; }
function getExecutions() { return { ok: true, executions: store.read().executions || [] }; }

function runAgentCycle(payload) {
  const state = store.read();
  const targetAgentId = payload.agentId || null;
  const agents = (state.agents || []).filter((agent) => !targetAgentId || agent.id === targetAgentId);
  const runnableAgents = agents.filter((agent) => agent.status === 'running' || payload.force === true);
  const executions = runnableAgents.map((agent) => {
    const task = (state.queue || []).find((item) => item.agentId === agent.id && item.status === 'ready');
    const needsApproval = agent.requiresApprovalFor && agent.requiresApprovalFor.length > 0;
    const execution = {
      id: makeId('exec'), agentId: agent.id, agentName: agent.name, area: agent.area,
      status: needsApproval ? 'draft_ready' : 'executed',
      taskTitle: task ? task.title : agent.nextAction,
      action: task ? task.action : agent.nextAction,
      result: needsApproval ? 'Ação preparada como rascunho supervisionado.' : 'Ação executada dentro das permissões do agente.',
      createdAt: now(),
    };
    agent.lastRun = execution.createdAt;
    if (task) task.status = needsApproval ? 'waiting_approval' : 'done';
    if (needsApproval) {
      state.approvals = [{
        id: makeId('approval'), executionId: execution.id, agentId: agent.id, agentName: agent.name,
        title: execution.taskTitle, requestedAction: execution.action, status: 'pending', createdAt: execution.createdAt,
      }, ...(state.approvals || [])].slice(0, 100);
    }
    return execution;
  });
  state.executions = [...executions, ...(state.executions || [])].slice(0, 200);
  store.save(state);
  return { ok: true, executions, dashboard: getDashboard() };
}

function addTask(payload) {
  const state = store.read();
  const task = {
    id: makeId('task'), agentId: String(payload.agentId || 'sales-agent'), title: String(payload.title || 'Nova tarefa autônoma'),
    priority: Math.max(1, Math.min(100, Number(payload.priority || 80))), status: 'ready',
    action: String(payload.action || 'executar rotina com segurança e registrar resultado'), createdAt: now(),
  };
  state.queue = [task, ...(state.queue || [])].slice(0, 200);
  store.save(state);
  return { ok: true, task, queue: state.queue };
}

function updateAgentStatus(payload) {
  const state = store.read();
  const agentId = String(payload.agentId || '');
  const status = String(payload.status || 'running');
  state.agents = (state.agents || []).map((agent) => agent.id === agentId ? { ...agent, status } : agent);
  store.save(state);
  return { ok: true, agents: state.agents };
}

function approveAction(payload) {
  const state = store.read();
  const approvalId = String(payload.approvalId || '');
  const decision = payload.approved === false ? 'rejected' : 'approved';
  const decidedAt = now();
  const selected = (state.approvals || []).find((item) => item.id === approvalId);
  state.approvals = (state.approvals || []).map((approval) => approval.id === approvalId ? { ...approval, status: decision, decidedAt } : approval);
  if (decision === 'approved' && selected) {
    state.executions = [{
      id: makeId('exec-approved'), agentId: selected.agentId, agentName: selected.agentName,
      area: 'supervisionado', status: 'approved_executed', taskTitle: selected.title,
      action: selected.requestedAction, result: 'Ação aprovada e marcada para execução real pelo conector correspondente.', createdAt: decidedAt,
    }, ...(state.executions || [])].slice(0, 200);
  }
  store.save(state);
  return { ok: true, approvals: state.approvals, dashboard: getDashboard() };
}

module.exports = { getDashboard, getAgents, getQueue, getExecutions, runAgentCycle, addTask, updateAgentStatus, approveAction };
