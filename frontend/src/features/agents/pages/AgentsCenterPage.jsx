import React, { useEffect, useMemo, useState } from 'react';
import {
  createAgentConsensus,
  createAgentPlan,
  createAgentTimeline,
  getAgentsDashboard,
  orchestrateAgentMission,
  runAgentMission,
} from '../services/agentsApi';

const fallbackDashboard = {
  title: 'Megan OS 4.2 — Orquestrador de Agentes Reais',
  status: 'offline_local_preview',
  totalAgents: 0,
  averagePriority: 0,
  agents: [],
  pipeline: [],
};

export default function AgentsCenterPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [message, setMessage] = useState('Evoluir Megan OS 4.2 com orquestrador de agentes reais, consenso supervisionado e validação antes da entrega.');
  const [mission, setMission] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAgentsDashboard()
      .then((data) => {
        if (active) setDashboard(data || fallbackDashboard);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Não foi possível carregar agentes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const mainAgent = useMemo(() => {
    return mission?.primaryAgent || dashboard.agents?.[0] || null;
  }, [dashboard.agents, mission]);

  async function executeAction(action) {
    setRunning(true);
    setError('');
    try {
      const data = await action(message);
      setMission(data);
      if (data?.collaborationFlow) {
        setTimeline({ timeline: data.collaborationFlow });
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar agentes.');
    } finally {
      setRunning(false);
    }
  }

  async function handleTimeline() {
    setRunning(true);
    setError('');
    try {
      const data = await createAgentTimeline(message);
      setTimeline(data);
      setMission((current) => current || data);
    } catch (err) {
      setError(err.message || 'Erro ao gerar linha do tempo dos agentes.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="agents41-page agents42-page">
      <section className="agents41-hero agents42-hero">
        <div>
          <span className="omega-kicker">FASE 4.2 ATIVA</span>
          <h1>Orquestrador de agentes reais</h1>
          <p>
            A Megan agora aciona especialistas em conjunto, coleta votos, gera consenso supervisionado e organiza uma linha de execução segura.
          </p>
        </div>
        <div className="agents41-status-card agents42-status-card">
          <strong>{loading ? 'carregando' : dashboard.status}</strong>
          <span>{dashboard.totalAgents || 0} agentes online</span>
          <em>consenso supervisionado</em>
        </div>
      </section>

      {error ? <div className="agents41-alert">{error}</div> : null}

      <section className="agents41-grid">
        <article className="agents41-card agents41-command">
          <span className="omega-kicker">COMANDO</span>
          <h2>Enviar missão para o conselho 4.2</h2>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
          <div className="agents41-actions agents42-actions">
            <button onClick={() => executeAction(createAgentPlan)} disabled={running}>Criar plano</button>
            <button onClick={() => executeAction(runAgentMission)} disabled={running}>Executar missão</button>
            <button onClick={() => executeAction(orchestrateAgentMission)} disabled={running}>Orquestrar 4.2</button>
            <button onClick={() => executeAction(createAgentConsensus)} disabled={running}>Gerar consenso</button>
            <button onClick={handleTimeline} disabled={running}>Linha do tempo</button>
          </div>
        </article>

        <article className="agents41-card agents42-consensus-card">
          <span className="omega-kicker">CONSENSO</span>
          <h2>{mission?.consensus?.decision || mainAgent?.name || 'Aguardando missão'}</h2>
          <p>{mission?.consensus?.rule || mainAgent?.role || 'Envie uma missão para ativar votação entre especialistas.'}</p>
          <div className="agents42-consensus-score">
            <strong>{mission?.consensus?.confidence || mainAgent?.priority || 0}</strong>
            <span>{mission?.consensus?.approval || 'standby'}</span>
          </div>
        </article>
      </section>

      <section className="agents41-card">
        <div className="agents41-section-head">
          <div>
            <span className="omega-kicker">VOTAÇÃO DOS ESPECIALISTAS</span>
            <h2>Foco, risco e recomendação</h2>
          </div>
          <strong>{mission?.version || dashboard.version || '4.2.0'}</strong>
        </div>
        <div className="agents42-vote-grid">
          {(mission?.votes || []).length ? (
            mission.votes.map((vote) => (
              <article key={vote.agentId} className="agents42-vote-card">
                <div>
                  <strong>{vote.agentName}</strong>
                  <span>{vote.vote} · {vote.confidence}%</span>
                </div>
                <p><b>Foco:</b> {vote.focus}</p>
                <p><b>Risco:</b> {vote.risk}</p>
                <em>{vote.recommendation}</em>
              </article>
            ))
          ) : (
            <p className="agents42-empty">Nenhuma votação gerada ainda. Use “Orquestrar 4.2” ou “Gerar consenso”.</p>
          )}
        </div>
      </section>

      <section className="agents41-grid">
        <article className="agents41-card">
          <span className="omega-kicker">CATÁLOGO</span>
          <h2>Agentes disponíveis</h2>
          <div className="agents41-agent-list">
            {(dashboard.agents || []).map((agent) => (
              <article key={agent.id} className="agents41-agent-item">
                <div>
                  <strong>{agent.name}</strong>
                  <p>{agent.role}</p>
                </div>
                <span>{agent.priority}</span>
              </article>
            ))}
          </div>
        </article>

        <article className="agents41-card">
          <span className="omega-kicker">LINHA DE EXECUÇÃO 4.2</span>
          <h2>{mission?.mission?.summary || 'Nenhuma missão orquestrada ainda'}</h2>
          <div className="agents41-plan-list">
            {(timeline?.timeline || mission?.collaborationFlow || []).map((step) => (
              <div key={`${step.step}-${step.phase}`} className="agents41-plan-step agents42-flow-step">
                <span>{step.step}</span>
                <div>
                  <strong>{step.phase || step.title}</strong>
                  <p>{step.action}</p>
                  <em>{step.owner} · {step.status || step.checkpoint}</em>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="agents41-card">
        <span className="omega-kicker">PIPELINE BASE</span>
        <h2>Fluxo de decisão atualizado</h2>
        <ol className="agents41-pipeline agents42-pipeline">
          {(dashboard.pipeline || []).map((item) => <li key={item}>{item}</li>)}
        </ol>
      </section>
    </div>
  );
}
