import React, { useEffect, useMemo, useState } from 'react';
import { auditTotalControlSystem, getTotalControlStatus, getTotalControlTasks, sendTotalControlMessage } from './totalControlApi';
function formatHumanResponse(value) {
  if (typeof value === 'string') return value;
  const data = value?.data || value?.result || value || {};
  return data.executiveAnswer || data.answer || data.message || value?.message || 'Análise concluída pela Megan.';
}

function HumanBox({ value }) {
  const data = value?.data || value?.result || value || {};
  const suggestions = [
    ...(Array.isArray(data.examples) ? data.examples : []),
    ...(Array.isArray(data.suggestions) ? data.suggestions : []),
    ...(Array.isArray(data.nextActions) ? data.nextActions : [])
  ];

  return <div className="tc21-human">
    <p>{formatHumanResponse(value)}</p>
    {value?.decision && <small>Leitura: {value.decision.intent || value.decision.type || 'operação'} · {value.decision.risk || 'risco baixo'}</small>}
    {suggestions.length > 0 && <div className="tc21-human-tags">{suggestions.slice(0, 5).map((item, index) => <span key={index}>{typeof item === 'string' ? item : item.title || item.text || item.command || 'ação sugerida'}</span>)}</div>}
  </div>;
}

export default function TotalControl21Page() {
  const [message, setMessage] = useState('status real do sistema');
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);
  async function refreshStatus() {
    const [statusResult, taskResult] = await Promise.all([getTotalControlStatus(), getTotalControlTasks()]);
    setStatus(statusResult); setTasks(taskResult.tasks || []);
  }
  useEffect(() => { refreshStatus().catch((error) => setMessages((prev) => [...prev, { role: 'system', content: 'Erro ao carregar status: ' + error.message }])); }, []);
  const healthPercent = useMemo(() => {
    if (!status?.memory) return 0; const used = status.memory.usedMB || 0; const total = status.memory.totalMB || 1;
    return Math.max(1, Math.min(100, Math.round(100 - (used / total) * 100)));
  }, [status]);
  async function submitChat(nextMessage = message) {
    if (!nextMessage.trim()) return; setLoading(true); setMessages((prev) => [...prev, { role: 'user', content: nextMessage }]);
    try { const response = await sendTotalControlMessage(nextMessage); if (response.mode === 'approval_required') setProposal(response.proposal); setMessages((prev) => [...prev, { role: 'megan', content: response }]); await refreshStatus(); }
    catch (error) { setMessages((prev) => [...prev, { role: 'error', content: error.message }]); } finally { setLoading(false); }
  }
  async function approveProposal() {
    if (!proposal) return; setLoading(true);
    try { const response = await sendTotalControlMessage('aprovar execução', { approved: true, command: proposal.command, cwd: proposal.cwd }); setMessages((prev) => [...prev, { role: 'megan', content: response }]); setProposal(null); await refreshStatus(); }
    catch (error) { setMessages((prev) => [...prev, { role: 'error', content: error.message }]); } finally { setLoading(false); }
  }
  async function runAudit() { setLoading(true); try { const response = await auditTotalControlSystem(); setMessages((prev) => [...prev, { role: 'megan', content: response }]); } catch (error) { setMessages((prev) => [...prev, { role: 'error', content: error.message }]); } finally { setLoading(false); } }
  return <div className="tc21-page">
    <section className="tc21-hero"><div><span className="omega-kicker">MEGAN OS 21.0</span><h1>Total Control Chat Core</h1><p>Chat central para consultar informações reais do sistema, validar estado, criar tarefas e propor execuções com aprovação humana.</p></div><div className="tc21-health"><strong>{healthPercent}%</strong><span>reserva operacional estimada</span></div></section>
    <section className="tc21-grid"><article className="tc21-card"><span>Status real</span><strong>{status?.module || 'Carregando...'}</strong><p>Node {status?.node || '--'} · {status?.cpuCores || 0} núcleos · {status?.pendingTasks || 0} tarefas pendentes</p></article><article className="tc21-card"><span>Backend</span><strong>{status?.project?.exists?.backend ? 'Detectado' : 'Pendente'}</strong><p>{status?.project?.backendRoot || 'Aguardando status'}</p></article><article className="tc21-card"><span>Frontend</span><strong>{status?.project?.exists?.frontend ? 'Detectado' : 'Pendente'}</strong><p>{status?.project?.frontendRoot || 'Aguardando status'}</p></article></section>
    <section className="tc21-command-layout"><div className="tc21-chat-panel"><div className="tc21-actions"><button onClick={() => submitChat('status real do sistema')}>Status</button><button onClick={runAudit}>Validar sistema</button><button onClick={() => submitChat('listar tarefas pendentes')}>Tarefas</button><button onClick={() => submitChat('criar tarefa: revisar próximo deploy Render com segurança')}>Delegar exemplo</button></div><div className="tc21-chat-window">{messages.length === 0 ? <p className="tc21-empty">Digite um comando para a Megan analisar, validar ou delegar.</p> : messages.map((item, index) => <div key={index} className={`tc21-message tc21-${item.role}`}><strong>{item.role === 'user' ? 'Você' : item.role === 'error' ? 'Erro' : 'Megan'}</strong>{typeof item.content === 'string' ? <p>{item.content}</p> : <HumanBox value={item.content} />}</div>)}</div>{proposal && <div className="tc21-proposal"><strong>Confirmação necessária</strong><p>{proposal.command}</p><small>{proposal.cwd}</small><div><button onClick={approveProposal} disabled={loading}>Aprovar execução</button><button onClick={() => setProposal(null)}>Cancelar</button></div></div>}<form className="tc21-input-row" onSubmit={(event) => { event.preventDefault(); submitChat(); }}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ex: validar sistema agora" /><button disabled={loading}>{loading ? 'Analisando...' : 'Enviar'}</button></form></div><aside className="tc21-side-panel"><h3>Tarefas delegadas</h3>{tasks.length === 0 ? <p>Nenhuma tarefa criada ainda.</p> : tasks.slice(0, 8).map((task) => <div key={task.id} className="tc21-task"><strong>{task.text}</strong><span>{task.priority} · {task.status}</span></div>)}</aside></section>
  </div>;
}
