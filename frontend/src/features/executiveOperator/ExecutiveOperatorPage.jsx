import React, { useEffect, useMemo, useState } from 'react';
import VoiceAlwaysOn from '../voice/VoiceAlwaysOn';

const API_BASE = import.meta.env.VITE_API_URL || '';

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error('A API retornou conteúdo inválido. Verifique se o backend está online e se VITE_API_URL está correto.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Falha na comunicação com o Executive Operator.');
  }

  return data;
}

function HealthPill({ ok, children }) {
  return <span className={`executive-pill ${ok ? 'ok' : 'warn'}`}>{children}</span>;
}

export default function ExecutiveOperatorPage() {
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [command, setCommand] = useState('Realizar tarefas pendentes e trazer resumo do projeto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const integrationScore = useMemo(() => summary?.integrations?.score ?? 0, [summary]);

  async function loadSummary() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/executive-operator/summary');
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runTasks() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/executive-operator/tasks', {
        method: 'POST',
        body: JSON.stringify({ command }),
      });
      setTasks(data);
      const fresh = await api('/api/executive-operator/summary');
      setSummary(fresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="executive-page">
      <section className="executive-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 10.0 EXECUTIVE OPERATOR AI</span>
          <h2>Operadora executiva do projeto</h2>
          <p>
            Peça por voz ou texto para a Megan revisar o projeto, listar pendências, resumir status e preparar próximas ações com segurança supervisionada.
          </p>
        </div>
        <div className="executive-score">
          <strong>{integrationScore}%</strong>
          <span>integrações</span>
        </div>
      </section>

      <VoiceAlwaysOn />

      {error ? <div className="executive-alert warn">{error}</div> : null}

      <section className="executive-command-card">
        <div>
          <h3>Comando executivo</h3>
          <p>Use por texto ou fale: “Ok Megan, realizar tarefas pendentes e trazer resumo do projeto”.</p>
        </div>
        <textarea value={command} onChange={(event) => setCommand(event.target.value)} />
        <div className="executive-toolbar">
          <button type="button" className="primary" onClick={runTasks} disabled={loading}>Executar tarefas</button>
          <button type="button" onClick={loadSummary} disabled={loading}>Atualizar resumo</button>
        </div>
      </section>

      <section className="executive-grid">
        <article className="executive-panel">
          <div className="executive-panel-title">
            <h3>Resumo do projeto</h3>
            <span>{summary?.project?.version || 'carregando'}</span>
          </div>
          <p className="executive-summary-text">{summary?.summaryText || 'Carregando visão executiva...'}</p>

          <div className="executive-health-grid">
            <HealthPill ok={summary?.health?.backend}>Backend</HealthPill>
            <HealthPill ok={summary?.health?.frontendStructure}>Frontend</HealthPill>
            <HealthPill ok={summary?.health?.voiceMode}>Voz</HealthPill>
            <HealthPill ok={summary?.health?.persistentData}>Persistência</HealthPill>
            <HealthPill ok={summary?.health?.integrationsReady}>Integrações</HealthPill>
          </div>
        </article>

        <article className="executive-panel">
          <div className="executive-panel-title">
            <h3>Estado Megan</h3>
            <span>supervisionado</span>
          </div>
          <div className="executive-state-list">
            <div><span>Missão</span><strong>{summary?.state?.mission || 'Expandir autonomia segura'}</strong></div>
            <div><span>Brain</span><strong>{summary?.state?.brain || 'Executive Operator'}</strong></div>
            <div><span>Modo</span><strong>{summary?.state?.mode || 'supervisionado'}</strong></div>
          </div>
        </article>
      </section>

      <section className="executive-grid">
        <article className="executive-panel">
          <div className="executive-panel-title">
            <h3>Tarefas executadas</h3>
            <span>{tasks?.actions?.length || 0} ações</span>
          </div>
          <div className="executive-list">
            {(tasks?.actions || []).map((item, index) => (
              <div key={`${item.title}-${index}`}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
                <em>{item.status}</em>
              </div>
            ))}
            {!tasks?.actions?.length ? <p className="executive-muted">Nenhuma tarefa executada nesta sessão ainda.</p> : null}
          </div>
        </article>

        <article className="executive-panel">
          <div className="executive-panel-title">
            <h3>Prioridades atuais</h3>
            <span>próximos passos</span>
          </div>
          <ol className="executive-priorities">
            {(summary?.priorities || []).map((item) => <li key={item}>{item}</li>)}
          </ol>
        </article>
      </section>

      <section className="executive-panel">
        <div className="executive-panel-title">
          <h3>Integrações ausentes</h3>
          <span>{summary?.integrations?.configured || 0}/{summary?.integrations?.total || 0} configuradas</span>
        </div>
        <div className="executive-token-grid">
          {(summary?.integrations?.missing || []).map((item) => <code key={item}>{item}</code>)}
          {!summary?.integrations?.missing?.length ? <strong className="executive-ok-text">Todas as integrações principais estão configuradas.</strong> : null}
        </div>
      </section>
    </div>
  );
}
