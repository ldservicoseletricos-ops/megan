import React, { useEffect, useMemo, useState } from 'react';
import { executeRealAction, getAllowedActions, getRealActionHistory, getRealActionStatus, sendRealActionMessage } from './realActionEngine24Api';

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatItem(item) {
  if (typeof item === 'string') return item;
  if (!item) return '';
  return item.title || item.text || item.label || item.relative || item.name || JSON.stringify(item);
}

function normalize(payload) {
  if (!payload) return { answer: 'Não recebi resposta do módulo.', findings: [], suggestions: [] };
  if (typeof payload === 'string') return { answer: payload, findings: [], suggestions: [] };
  const data = payload.data || payload.result || payload;
  const answer = data.executiveAnswer || data.answer || data.message || payload.message || (payload.ok ? 'Operação analisada.' : payload.error || 'Erro não informado.');
  return {
    answer,
    findings: [...asArray(data.findings), ...asArray(data.highlights), ...asArray(payload.findings)].filter(Boolean),
    suggestions: [...asArray(data.suggestions), ...asArray(data.nextActions)].filter(Boolean),
    result: payload.result,
    proposal: payload.proposal,
    mode: payload.mode
  };
}

function MeganRealMessage({ content }) {
  const item = useMemo(() => normalize(content), [content]);
  return <div className="osm22-human-response">
    <p>{item.answer}</p>
    {item.findings.length > 0 && <div className="osm22-response-block"><strong>Leitura real</strong><ul>{item.findings.slice(0, 10).map((entry, index) => <li key={index}>{formatItem(entry)}</li>)}</ul></div>}
    {item.result?.output && <div className="osm22-response-block compact"><strong>Saída do sistema</strong><pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{String(item.result.output).slice(0, 1600)}</pre></div>}
    {item.result?.error && <div className="osm22-response-block compact warning"><strong>Erro retornado</strong><pre style={{ whiteSpace: 'pre-wrap', overflowX: 'auto' }}>{String(item.result.error).slice(0, 1600)}</pre></div>}
    {item.proposal && <div className="osm22-response-block compact warning"><strong>Aprovação necessária</strong><span>{item.proposal.label} · risco {item.proposal.risk}</span></div>}
    {item.suggestions.length > 0 && <div className="osm22-suggestions">{item.suggestions.slice(0, 6).map((entry, index) => <span key={index}>{formatItem(entry)}</span>)}</div>}
  </div>;
}

export default function RealActionEngine24Page() {
  const [message, setMessage] = useState('resumo do sistema');
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState(null);
  const [actions, setActions] = useState([]);
  const [history, setHistory] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const [nextStatus, actionPayload, historyPayload] = await Promise.all([getRealActionStatus(), getAllowedActions(), getRealActionHistory()]);
    setStatus(nextStatus);
    setActions(actionPayload.actions || []);
    setHistory(historyPayload.history || []);
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
      const response = await sendRealActionMessage(finalText);
      if (response.mode === 'approval_required') setProposal(response.proposal);
      setLog((old) => [...old, { role: 'megan', content: response }]);
      await refresh();
    } catch (error) {
      setLog((old) => [...old, { role: 'erro', content: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function runAction(actionId) {
    setLoading(true);
    try {
      const response = await executeRealAction(actionId);
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
    if (!proposal?.actionId) return;
    setLoading(true);
    try {
      const response = await sendRealActionMessage('aprovar ação real', { approved: true, actionId: proposal.actionId });
      setLog((old) => [...old, { role: 'megan', content: response }]);
      setProposal(null);
      await refresh();
    } catch (error) {
      setLog((old) => [...old, { role: 'erro', content: error.message }]);
    } finally {
      setLoading(false);
    }
  }

  return <div className="osm22-page">
    <section className="osm22-hero">
      <div><span className="omega-kicker">MEGAN OS 24.0</span><h1>Real Action Engine</h1><p>Chat com leitura real do sistema e execução supervisionada de comandos permitidos, com aprovação para ações que alteram o projeto.</p></div>
      <div className="osm22-score"><strong>{status?.healthScore || 0}%</strong><span>saúde real</span></div>
    </section>

    <section className="osm22-metrics">
      <article><span>Modo</span><strong>{status?.mode || 'carregando'}</strong><p>{status?.module || 'aguardando backend'}</p></article>
      <article><span>Backend</span><strong>{status?.importantFiles?.find((file) => file.relative === 'backend/src/app.js')?.exists ? 'OK' : 'Pendente'}</strong><p>{status?.backendRoot || '--'}</p></article>
      <article><span>Ações</span><strong>{actions.length}</strong><p>permitidas</p></article>
      <article><span>Histórico</span><strong>{history.length}</strong><p>execuções registradas</p></article>
    </section>

    <section className="osm22-layout">
      <div className="osm22-chat">
        <div className="osm22-actions">
          <button onClick={() => send('resumo do sistema')}>Resumo</button>
          <button onClick={() => send('validar backend')}>Validar backend</button>
          <button onClick={() => send('git status')}>Git status</button>
          <button onClick={() => send('listar arquivos backend')}>Arquivos backend</button>
          <button onClick={() => send('ler logs')}>Logs</button>
        </div>

        <div className="osm22-window">
          {log.length === 0 ? <p className="osm22-empty">Digite uma ordem real para a Megan executar ou validar.</p> : log.map((item, index) => <div key={index} className={`osm22-message osm22-${item.role}`}><strong>{item.role === 'voce' ? 'Você' : item.role === 'erro' ? 'Erro' : 'Megan'}</strong>{item.role === 'megan' ? <MeganRealMessage content={item.content} /> : <p>{String(item.content)}</p>}</div>)}
        </div>

        {proposal && <div className="osm22-proposal"><strong>Confirmação necessária</strong><p>{proposal.reason}</p><code>{proposal.command}</code><small>{proposal.cwd}</small><div><button onClick={approve} disabled={loading}>Aprovar execução</button><button onClick={() => setProposal(null)}>Cancelar</button></div></div>}

        <form className="osm22-input" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={message} onChange={(event) => setMessage(event.target.value)} /><button disabled={loading}>{loading ? 'Executando...' : 'Enviar'}</button></form>
      </div>

      <aside className="osm22-side">
        <section><h3>Ações reais permitidas</h3>{actions.map((action) => <button key={action.id} className="osm22-task" onClick={() => runAction(action.id)}><strong>{action.label}</strong><span>risco {action.risk} · {action.mutates ? 'altera projeto' : 'somente leitura'}</span></button>)}</section>
        <section><h3>Arquivos essenciais</h3>{(status?.importantFiles || []).map((file) => <div className="osm22-task" key={file.relative}><strong>{file.relative}</strong><span>{file.exists ? `${file.size} bytes` : 'ausente'}</span></div>)}</section>
      </aside>
    </section>
  </div>;
}
