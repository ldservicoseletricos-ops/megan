import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const prompts = [
  'rodar ciclo de autonomia agora',
  'gerar relatório executivo 18.0',
  'listar prioridades abertas',
  'analisar sistema e criar tarefas necessárias',
];

function pct(value) {
  if (value === undefined || value === null) return '--';
  return `${value}%`;
}

function formatDate(value) {
  if (!value) return 'não executado';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
}

function AutonomyMetric({ label, value, detail }) {
  return (
    <article className="autonomy18-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function CheckItem({ check }) {
  return (
    <div className={`autonomy18-check ${check.ok ? 'ok' : 'fail'}`}>
      <strong>{check.ok ? 'OK' : 'AÇÃO'}</strong>
      <span>{check.label}</span>
      <em>{check.severity}</em>
    </div>
  );
}

function TaskCard({ task, onStatus }) {
  return (
    <article className="autonomy18-task">
      <div>
        <strong>{task.title}</strong>
        <span>{task.priority} • {task.status}</span>
      </div>
      <p>{task.description}</p>
      <small>{formatDate(task.createdAt)}</small>
      <div className="autonomy18-task-actions">
        <button onClick={() => onStatus(task.id, 'aprovada')}>Aprovar</button>
        <button onClick={() => onStatus(task.id, 'em_execucao')}>Executar</button>
        <button onClick={() => onStatus(task.id, 'concluida')}>Concluir</button>
        <button onClick={() => onStatus(task.id, 'cancelada')}>Cancelar</button>
      </div>
    </article>
  );
}

export default function AutonomyCore18Page() {
  const [snapshot, setSnapshot] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([
    {
      id: 'hello',
      role: 'assistant',
      text: 'Autonomy Core 18.0 ativo. Eu observo o sistema, gero prioridades, crio tarefas e preparo execução somente com aprovação humana.',
      actions: ['Rodar ciclo', 'Gerar relatório', 'Ver prioridades'],
    },
  ]);
  const bottomRef = useRef(null);

  async function loadStatus() {
    const data = await apiGet('/api/autonomy-core-18/status');
    setSnapshot(data);
  }

  useEffect(() => {
    loadStatus().catch(() => null);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const statusLabel = useMemo(() => {
    const score = snapshot?.healthScore || 0;
    if (!snapshot) return 'Sincronizando';
    if (score >= 90) return 'Excelente';
    if (score >= 75) return 'Operacional';
    if (score >= 60) return 'Atenção';
    return 'Crítico';
  }, [snapshot]);

  async function runCycle() {
    setLoading(true);
    try {
      const data = await apiPost('/api/autonomy-core-18/cycle', { reason: 'ciclo manual pelo painel 18.0' });
      setSnapshot(data.snapshot);
      setChat((prev) => [...prev, { id: `cycle_${Date.now()}`, role: 'assistant', text: data.message, actions: ['Ver tarefas', 'Gerar relatório'] }]);
    } catch (error) {
      setChat((prev) => [...prev, { id: `err_${Date.now()}`, role: 'assistant', text: `Erro ao rodar ciclo: ${error.message}` }]);
    } finally {
      setLoading(false);
      loadStatus().catch(() => null);
    }
  }

  async function generateReport() {
    setLoading(true);
    try {
      const data = await apiPost('/api/autonomy-core-18/report', {});
      setSnapshot(data.snapshot);
      setChat((prev) => [...prev, { id: `report_${Date.now()}`, role: 'assistant', text: data.report.summary, actions: data.report.recommendations }]);
    } catch (error) {
      setChat((prev) => [...prev, { id: `err_${Date.now()}`, role: 'assistant', text: `Erro ao gerar relatório: ${error.message}` }]);
    } finally {
      setLoading(false);
      loadStatus().catch(() => null);
    }
  }

  async function sendChat(text = message) {
    const clean = String(text || '').trim();
    if (!clean || loading) return;

    setChat((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', text: clean }]);
    setMessage('');
    setLoading(true);

    try {
      const data = await apiPost('/api/autonomy-core-18/chat', { message: clean });
      setSnapshot(data.result?.snapshot || data.snapshot || snapshot);
      setChat((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: data.answer, actions: data.actions || [] }]);
    } catch (error) {
      setChat((prev) => [...prev, { id: `err_${Date.now()}`, role: 'assistant', text: `Não consegui processar: ${error.message}` }]);
    } finally {
      setLoading(false);
      loadStatus().catch(() => null);
    }
  }

  async function updateTaskStatus(id, status) {
    const data = await apiPost(`/api/autonomy-core-18/tasks/${id}/status`, { status });
    setSnapshot((current) => ({
      ...current,
      tasks: (current?.tasks || []).map((task) => (task.id === id ? data.task : task)),
    }));
    await loadStatus();
  }

  const tasks = snapshot?.tasks || [];
  const checks = snapshot?.checks || [];
  const reports = snapshot?.reports || [];
  const decisions = snapshot?.decisions || [];

  return (
    <div className="autonomy18-page">
      <section className="autonomy18-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 18.0</span>
          <h1>Autonomy Core</h1>
          <p>Motor de autonomia supervisionada: observa, analisa, prioriza, registra tarefas e só executa ações sensíveis com validação humana.</p>
        </div>
        <div className="autonomy18-hero-actions">
          <button onClick={runCycle} disabled={loading}>Rodar ciclo</button>
          <button onClick={generateReport} disabled={loading}>Gerar relatório</button>
          <button onClick={loadStatus} disabled={loading}>Atualizar</button>
        </div>
      </section>

      <section className="autonomy18-metrics">
        <AutonomyMetric label="Saúde da Megan" value={`${snapshot?.healthScore ?? '--'}%`} detail={statusLabel} />
        <AutonomyMetric label="Modo" value={snapshot?.autonomy?.mode || 'supervisionada'} detail="execução com aprovação humana" />
        <AutonomyMetric label="Ciclos" value={String(snapshot?.autonomy?.cycleCount ?? 0)} detail={`último: ${formatDate(snapshot?.autonomy?.lastCycleAt)}`} />
        <AutonomyMetric label="Memória" value={pct(snapshot?.system?.memory?.usedPercent)} detail={`${snapshot?.system?.memory?.freeMb ?? '--'} MB livres`} />
      </section>

      <section className="autonomy18-layout">
        <div className="autonomy18-command">
          <div className="autonomy18-card-head">
            <div>
              <strong>Chat Diretor de Autonomia</strong>
              <span>/api/autonomy-core-18/chat</span>
            </div>
            <em>{loading ? 'processando' : 'online'}</em>
          </div>

          <div className="autonomy18-prompts">
            {prompts.map((prompt) => <button key={prompt} onClick={() => sendChat(prompt)}>{prompt}</button>)}
          </div>

          <div className="autonomy18-chat">
            {chat.map((item) => (
              <div key={item.id} className={`autonomy18-bubble ${item.role}`}>
                <span>{item.role === 'user' ? 'Luiz' : 'Megan Autonomy Core'}</span>
                <p>{item.text}</p>
                {item.actions?.length ? <div>{item.actions.map((action) => <em key={action}>{action}</em>)}</div> : null}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="autonomy18-input">
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendChat();
                }
              }}
              placeholder="Ex: Megan, analise o sistema e crie tarefas para o que precisar de validação..."
            />
            <button onClick={() => sendChat()} disabled={loading}>Enviar</button>
          </div>
        </div>

        <aside className="autonomy18-side">
          <section>
            <h3>Checklist vivo</h3>
            <div className="autonomy18-checks">
              {checks.map((check) => <CheckItem key={check.key} check={check} />)}
            </div>
          </section>

          <section>
            <h3>Tarefas criadas pela IA</h3>
            <div className="autonomy18-tasks">
              {tasks.length === 0 ? <p className="autonomy18-empty">Nenhuma tarefa pendente criada pela autonomia.</p> : null}
              {tasks.slice(0, 8).map((task) => <TaskCard key={task.id} task={task} onStatus={updateTaskStatus} />)}
            </div>
          </section>
        </aside>
      </section>

      <section className="autonomy18-bottom-grid">
        <article>
          <h3>Relatórios recentes</h3>
          {reports.length === 0 ? <p>Nenhum relatório gerado ainda.</p> : reports.map((report) => (
            <div key={report.id} className="autonomy18-report">
              <strong>{report.title}</strong>
              <span>{formatDate(report.createdAt)}</span>
              <p>{report.summary}</p>
            </div>
          ))}
        </article>

        <article>
          <h3>Decisões recentes</h3>
          {decisions.length === 0 ? <p>Nenhum ciclo decisório registrado ainda.</p> : decisions.map((decision) => (
            <div key={decision.id} className="autonomy18-report">
              <strong>{decision.status}</strong>
              <span>{formatDate(decision.createdAt)}</span>
              <p>Score {decision.healthScore}% • tarefas criadas: {decision.createdTasks}</p>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}
