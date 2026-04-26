import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const quickPrompts = [
  'validar todo o sistema agora',
  'qual o status real do sistema?',
  'verificar git status',
  'delegar tarefa: preparar deploy seguro',
  'analisar logs e erros recentes',
];

function formatDate(value) {
  if (!value) return 'agora';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
}

function MetricCard({ label, value, detail }) {
  return (
    <article className="operator-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function MessageBubble({ item }) {
  return (
    <div className={`operator-message ${item.role}`}>
      <span>{item.role === 'user' ? 'Luiz' : 'Megan Command Center'}</span>
      <p>{item.content}</p>
      {item.actions?.length ? (
        <div className="operator-actions-inline">
          {item.actions.map((action) => <em key={action}>{action}</em>)}
        </div>
      ) : null}
    </div>
  );
}

export default function OperatorCommandCenterPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [gitStatus, setGitStatus] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Chat operacional 17.0 ativo. Posso consultar status real, validar estrutura do projeto, registrar tarefas e preparar ações com segurança.',
      actions: ['Status do sistema', 'Validar projeto', 'Delegar tarefa'],
    },
  ]);

  const bottomRef = useRef(null);

  async function loadSystem() {
    const data = await apiGet('/api/operator/system');
    setSnapshot(data);
    setTasks(data.tasks || []);
  }

  useEffect(() => {
    loadSystem().catch(() => null);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const healthLabel = useMemo(() => {
    if (!snapshot) return 'Sincronizando';
    if (snapshot.memory?.usedPercent < 70) return 'Excelente';
    if (snapshot.memory?.usedPercent < 85) return 'Atenção leve';
    return 'Atenção crítica';
  }, [snapshot]);

  async function sendMessage(text = message) {
    const clean = String(text || '').trim();
    if (!clean || loading) return;

    const userMessage = { id: `u_${Date.now()}`, role: 'user', content: clean };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      if (clean.toLowerCase().includes('git status')) {
        const git = await apiPost('/api/operator/git/status', {});
        setGitStatus(git);
      }

      const data = await apiPost('/api/operator/chat', { message: clean });
      setSnapshot(data.snapshot);
      setTasks(data.snapshot?.tasks || []);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: data.answer || 'Operação processada.',
          actions: data.actions || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'assistant',
          content: `Não consegui concluir a ação: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
      loadSystem().catch(() => null);
    }
  }

  async function updateTaskStatus(taskId, status) {
    const data = await apiPost(`/api/operator/tasks/${taskId}/status`, { status });
    setTasks((prev) => prev.map((task) => (task.id === taskId ? data.task : task)));
    await loadSystem();
  }

  return (
    <div className="operator-command-page">
      <section className="operator-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 17.0</span>
          <h1>Command Center Operacional</h1>
          <p>Chat administrador para trazer informações reais do sistema, validar estrutura, registrar tarefas e delegar ações com aprovação humana.</p>
        </div>
        <button className="operator-refresh" onClick={loadSystem}>Atualizar status real</button>
      </section>

      <section className="operator-grid">
        <MetricCard label="Saúde operacional" value={healthLabel} detail={`Memória: ${snapshot?.memory?.usedPercent ?? '--'}% usada`} />
        <MetricCard label="Node ativo" value={snapshot?.node || '--'} detail={snapshot?.platform || 'aguardando backend'} />
        <MetricCard label="Uptime backend" value={`${snapshot?.process?.uptimeSeconds ?? '--'}s`} detail={`PID ${snapshot?.process?.pid ?? '--'}`} />
        <MetricCard label="Tarefas" value={String(tasks.length)} detail="pendentes, aprovadas ou concluídas" />
      </section>

      <section className="operator-main-layout">
        <div className="operator-chat-card">
          <div className="operator-chat-header">
            <div>
              <strong>Chat de validação e delegação</strong>
              <span>Conectado em /api/operator/chat</span>
            </div>
            <em>{loading ? 'processando...' : 'online'}</em>
          </div>

          <div className="operator-quick-prompts">
            {quickPrompts.map((prompt) => (
              <button key={prompt} onClick={() => sendMessage(prompt)}>{prompt}</button>
            ))}
          </div>

          <div className="operator-messages">
            {messages.map((item) => <MessageBubble key={item.id} item={item} />)}
            <div ref={bottomRef} />
          </div>

          <div className="operator-input-row">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ex: Megan, valide o backend e crie uma tarefa para corrigir o que estiver errado..."
            />
            <button onClick={() => sendMessage()} disabled={loading}>Enviar</button>
          </div>
        </div>

        <aside className="operator-side-card">
          <h3>Validação real do projeto</h3>
          <div className="operator-check-list">
            <p><strong>Backend:</strong> {snapshot?.project?.backend?.exists ? 'package.json encontrado' : 'não encontrado'}</p>
            <p><strong>Frontend:</strong> {snapshot?.project?.frontend?.exists ? 'package.json encontrado' : 'não encontrado'}</p>
            <p><strong>CPU:</strong> {snapshot?.cpu?.cores || '--'} núcleos</p>
            <p><strong>RAM livre:</strong> {snapshot?.memory?.freeMb ?? '--'} MB</p>
          </div>

          <h3>Tarefas delegadas</h3>
          <div className="operator-task-list">
            {tasks.length === 0 ? <p className="operator-empty">Nenhuma tarefa criada ainda.</p> : null}
            {tasks.slice(0, 8).map((task) => (
              <article key={task.id} className="operator-task-card">
                <strong>{task.title}</strong>
                <span>{task.status}</span>
                <p>{task.description}</p>
                <small>{formatDate(task.createdAt)}</small>
                <div>
                  <button onClick={() => updateTaskStatus(task.id, 'aprovada')}>Aprovar</button>
                  <button onClick={() => updateTaskStatus(task.id, 'concluida')}>Concluir</button>
                  <button onClick={() => updateTaskStatus(task.id, 'cancelada')}>Cancelar</button>
                </div>
              </article>
            ))}
          </div>

          {gitStatus ? (
            <div className="operator-git-status">
              <h3>Git status</h3>
              <pre>{gitStatus.output || gitStatus.error}</pre>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
