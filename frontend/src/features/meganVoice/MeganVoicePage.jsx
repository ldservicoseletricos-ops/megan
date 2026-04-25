import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json();
}

function StatCard({ label, value, caption }) {
  return (
    <article className="omega-overview-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

function VoiceButton({ listening, onWake }) {
  return (
    <button className={`voice-orb ${listening ? 'listening' : ''}`} onClick={onWake} type="button">
      <span className="voice-orb-ring" />
      <strong>{listening ? 'Ouvindo...' : 'Ok Megan'}</strong>
      <em>{listening ? 'Fale seu comando' : 'Ativar voz'}</em>
    </button>
  );
}

export default function MeganVoicePage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phrase, setPhrase] = useState('Ok Megan, organizar meu dia');
  const [environment, setEnvironment] = useState('mobile');
  const [intent, setIntent] = useState('daily_planning');

  async function load() {
    setError('');
    try {
      const data = await api('/api/megan-voice/dashboard');
      setDashboard(data);
    } catch (err) {
      setError(err.message || 'Falha ao carregar Megan Voice.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function wake() {
    const data = await api('/api/megan-voice/wake', {
      method: 'POST',
      body: JSON.stringify({ environment }),
    });
    setDashboard(data.dashboard);
  }

  async function sendCommand() {
    const data = await api('/api/megan-voice/command', {
      method: 'POST',
      body: JSON.stringify({ phrase, environment, intent }),
    });
    setDashboard(data.dashboard);
  }

  async function confirmFirst(approved = true) {
    const pending = dashboard?.safetyQueue?.[0];
    if (!pending) return;
    const data = await api('/api/megan-voice/safety/confirm', {
      method: 'POST',
      body: JSON.stringify({ confirmationId: pending.id, approved }),
    });
    setDashboard(data.dashboard);
  }

  const summary = dashboard?.summary || {};
  const listening = Boolean(dashboard?.voiceCore?.listening);

  const selectedEnvironment = useMemo(() => {
    return dashboard?.environments?.find((item) => item.id === environment);
  }, [dashboard, environment]);

  if (loading) {
    return <div className="omega-loading-card"><span className="omega-kicker">MEGAN VOICE</span><h2>Carregando voz total...</h2></div>;
  }

  return (
    <div className="feature-page voice-page">
      <section className="omega-hero-card voice-hero">
        <div>
          <span className="omega-kicker">MEGAN OS 5.4</span>
          <h1>MEGAN VOICE</h1>
          <p>Assistente por voz total para celular, carro, casa e escritório com wake word “Ok Megan”.</p>
          {error ? <strong className="omega-error">{error}</strong> : null}
        </div>
        <VoiceButton listening={listening} onWake={wake} />
      </section>

      <section className="omega-overview-rail voice-stats">
        <StatCard label="Wake word" value={summary.wakeWord || 'Ok Megan'} caption={dashboard?.wakeWord?.status || 'aguardando'} />
        <StatCard label="Dispositivos" value={String(summary.activeDevices || 0)} caption="ativos agora" />
        <StatCard label="Ambientes" value={String(summary.preparedEnvironments || 0)} caption="celular, carro, casa e escritório" />
        <StatCard label="Confirmações" value={String(summary.pendingConfirmations || 0)} caption="ações sensíveis pendentes" />
      </section>

      <section className="voice-command-grid">
        <article className="omega-panel-card voice-command-card">
          <span className="omega-kicker">COMANDO POR VOZ</span>
          <h2>Enviar comando supervisionado</h2>
          <label>
            Frase
            <input value={phrase} onChange={(event) => setPhrase(event.target.value)} />
          </label>
          <label>
            Ambiente
            <select value={environment} onChange={(event) => setEnvironment(event.target.value)}>
              <option value="mobile">Celular</option>
              <option value="car">Carro</option>
              <option value="home">Casa</option>
              <option value="office">Escritório</option>
            </select>
          </label>
          <label>
            Intenção
            <select value={intent} onChange={(event) => setIntent(event.target.value)}>
              <option value="daily_planning">Organizar meu dia</option>
              <option value="navigation_start">Iniciar navegação</option>
              <option value="customer_reply">Responder cliente</option>
              <option value="reminder_finance">Lembrete financeiro</option>
              <option value="productivity">Produtividade</option>
              <option value="general_assistant">Assistente geral</option>
            </select>
          </label>
          <button className="omega-primary-button" onClick={sendCommand} type="button">Executar comando</button>
          <p className="voice-safe-note">Comandos de carro, cliente, envio, cobrança e publicação entram em confirmação antes de executar.</p>
        </article>

        <article className="omega-panel-card voice-command-card">
          <span className="omega-kicker">AMBIENTE ATIVO</span>
          <h2>{selectedEnvironment?.name || 'Celular'}</h2>
          <p>Status: <strong>{selectedEnvironment?.status || 'ativo'}</strong></p>
          <p>Risco: <strong>{selectedEnvironment?.riskLevel || 'médio'}</strong></p>
          <div className="voice-chip-list">
            {(selectedEnvironment?.capabilities || []).map((item) => <span key={item}>{item}</span>)}
          </div>
          {dashboard?.safetyQueue?.length ? (
            <div className="voice-confirm-box">
              <strong>Confirmação pendente</strong>
              <p>{dashboard.safetyQueue[0].phrase}</p>
              <button className="omega-primary-button" onClick={() => confirmFirst(true)} type="button">Confirmar</button>
              <button className="omega-secondary-button" onClick={() => confirmFirst(false)} type="button">Cancelar</button>
            </div>
          ) : <p>Nenhuma ação sensível pendente.</p>}
        </article>
      </section>

      <section className="voice-command-grid">
        <article className="omega-panel-card">
          <span className="omega-kicker">DISPOSITIVOS</span>
          <h2>Conexões preparadas</h2>
          <div className="voice-list">
            {(dashboard?.devices || []).map((device) => (
              <div key={device.id} className="voice-list-item">
                <strong>{device.name}</strong>
                <span>{device.type} • {device.platform}</span>
                <em>{device.status}</em>
              </div>
            ))}
          </div>
        </article>

        <article className="omega-panel-card">
          <span className="omega-kicker">ATIVIDADE</span>
          <h2>Histórico de voz</h2>
          <div className="voice-list">
            {(dashboard?.activity || []).slice(0, 8).map((item) => (
              <div key={item.id} className="voice-list-item">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
                <em>{new Date(item.createdAt).toLocaleString('pt-BR')}</em>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
