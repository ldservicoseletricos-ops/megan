import React, { useEffect, useMemo, useState } from 'react';
import { auditSovereignSystem, getSovereignDecisions, getSovereignStatus, getSovereignTasks, sendSovereignMessage } from './operatorSovereignMind22Api';

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanRole(role) {
  if (role === 'voce') return 'Você';
  if (role === 'erro') return 'Erro';
  return 'Megan';
}

function normalizeResponse(payload) {
  if (!payload) {
    return {
      title: 'Resposta da Megan',
      answer: 'Não recebi dados suficientes para montar a resposta.',
      bullets: [],
      suggestions: []
    };
  }

  if (typeof payload === 'string') {
    return { title: 'Resposta da Megan', answer: payload, bullets: [], suggestions: [] };
  }

  const data = payload.data || payload.result || payload.response || payload;
  const decision = payload.decision || data.decision || null;
  const proposal = payload.proposal || data.proposal || null;

  const answer =
    data.executiveAnswer ||
    data.answer ||
    data.message ||
    data.summary ||
    payload.executiveAnswer ||
    payload.message ||
    'Analisei o pedido e preparei um retorno operacional.';

  const bullets = [
    ...(toArray(data.highlights)),
    ...(toArray(data.statusItems)),
    ...(toArray(data.findings)),
    ...(toArray(payload.findings))
  ].filter(Boolean);

  const suggestions = [
    ...(toArray(data.examples)),
    ...(toArray(data.suggestions)),
    ...(toArray(data.nextActions)),
    ...(toArray(payload.suggestions))
  ].filter(Boolean);

  return {
    title: data.title || decision?.intent || payload.mode || 'Resposta da Megan',
    answer,
    bullets,
    suggestions,
    decision,
    proposal,
    raw: payload
  };
}

function MeganMessage({ content }) {
  const formatted = useMemo(() => normalizeResponse(content), [content]);

  return <div className="osm22-human-response">
    <p>{formatted.answer}</p>

    {formatted.bullets.length > 0 && <div className="osm22-response-block">
      <strong>Pontos identificados</strong>
      <ul>{formatted.bullets.slice(0, 8).map((item, index) => <li key={index}>{typeof item === 'string' ? item : item.title || item.text || item.label || JSON.stringify(item)}</li>)}</ul>
    </div>}

    {formatted.decision && <div className="osm22-response-block compact">
      <strong>Leitura operacional</strong>
      <span>{formatted.decision.intent || formatted.decision.type || 'análise'} · {formatted.decision.risk || 'risco baixo'}</span>
    </div>}

    {formatted.proposal && <div className="osm22-response-block compact warning">
      <strong>Aprovação necessária</strong>
      <span>{formatted.proposal.reason || formatted.proposal.command || 'Ação crítica aguardando confirmação.'}</span>
    </div>}

    {formatted.suggestions.length > 0 && <div className="osm22-suggestions">
      {formatted.suggestions.slice(0, 5).map((item, index) => <span key={index}>{typeof item === 'string' ? item : item.title || item.text || item.command || JSON.stringify(item)}</span>)}
    </div>}
  </div>;
}

export default function OperatorSovereignMind22Page() {
  const [message, setMessage] = useState('como estamos?');
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [a, b, c] = await Promise.all([getSovereignStatus(), getSovereignTasks(), getSovereignDecisions()]);
    setStatus(a);
    setTasks(b.tasks || []);
    setDecisions(c.decisions || []);
  }

  useEffect(() => {
    refresh().catch((error) => setLog((old) => [...old, { role: 'erro', content: error.message }]));
  }, []);

  async function send(text = message) {
    const finalText = String(text || '').trim();
    if (!finalText) return;
    setLoading(true);
    setLog((old) => [...old, { role: 'voce', content: finalText }]);
    try {
      const response = await sendSovereignMessage(finalText);
      if (response.mode === 'approval_required') setProposal(response.proposal);
      setLog((old) => [...old, { role: 'megan', content: response }]);
      await refresh();
    } catch (error) {
      setLog((old) => [...old, { role: 'erro', content: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function approve() {
    if (!proposal) return;
    setLoading(true);
    try {
      const response = await sendSovereignMessage('aprovar execucao', { approved: true, command: proposal.command, cwd: proposal.cwd });
      setLog((old) => [...old, { role: 'megan', content: response }]);
      setProposal(null);
      await refresh();
    } catch (error) {
      setLog((old) => [...old, { role: 'erro', content: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function audit() {
    setLoading(true);
    try {
      const response = await auditSovereignSystem();
      setLog((old) => [...old, { role: 'megan', content: response }]);
      await refresh();
    } catch (error) {
      setLog((old) => [...old, { role: 'erro', content: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  return <div className="osm22-page">
    <section className="osm22-hero"><div><span className="omega-kicker">MEGAN OS 23.1</span><h1>Human Chat UI Fix</h1><p>Chat operacional com respostas humanas, sem JSON bruto na tela, mantendo validação, delegação e aprovação segura.</p></div><div className="osm22-score"><strong>{status?.healthScore || 0}%</strong><span>saúde soberana</span></div></section>
    <section className="osm22-metrics"><article><span>Modo</span><strong>{status?.mode || 'carregando'}</strong><p>{status?.module || 'aguardando backend'}</p></article><article><span>Backend</span><strong>{status?.project?.exists?.backend ? 'OK' : 'Pendente'}</strong><p>{status?.project?.backendRoot || '--'}</p></article><article><span>Decisões</span><strong>{decisions.length}</strong><p>registradas</p></article><article><span>Tarefas</span><strong>{status?.pendingTasks ?? 0}</strong><p>pendentes</p></article></section>
    <section className="osm22-layout"><div className="osm22-chat"><div className="osm22-actions"><button onClick={() => send('como estamos?')}>Como estamos?</button><button onClick={audit}>Validar</button><button onClick={() => send('qual próximo passo?')}>Prioridade</button><button onClick={() => send('criar tarefa: testar login e chat')}>Delegar</button><button onClick={() => send('git status')}>Git status</button></div><div className="osm22-window">{log.length === 0 ? <p className="osm22-empty">Digite uma ordem para a Megan.</p> : log.map((item, index) => <div key={index} className={`osm22-message osm22-${item.role}`}><strong>{cleanRole(item.role)}</strong>{item.role === 'megan' ? <MeganMessage content={item.content} /> : <p>{String(item.content)}</p>}</div>)}</div>{proposal && <div className="osm22-proposal"><strong>Confirmação necessária</strong><p>{proposal.reason}</p><code>{proposal.command}</code><small>{proposal.cwd}</small><div><button onClick={approve} disabled={loading}>Aprovar</button><button onClick={() => setProposal(null)}>Cancelar</button></div></div>}<form className="osm22-input" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={message} onChange={(event) => setMessage(event.target.value)} /><button disabled={loading}>{loading ? 'Pensando...' : 'Enviar'}</button></form></div><aside className="osm22-side"><section><h3>Memória estratégica</h3><p>{status?.strategicMemory?.activeObjective || 'sincronizando...'}</p></section><section><h3>Tarefas</h3>{tasks.slice(0, 8).map((task) => <div className="osm22-task" key={task.id}><strong>{task.text}</strong><span>{task.priority} · {task.status}</span></div>)}</section></aside></section>
  </div>;
}
