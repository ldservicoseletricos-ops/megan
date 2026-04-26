
import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 4.8 — VOZ + CELULAR + PRESENÇA REAL',
  focus: 'App Android/iPhone, wake word “Ok Megan”, comandos por voz e uso contínuo supervisionado.',
  status: 'offline_preview',
  wakeWord: { phrase: 'Ok Megan', status: 'preview', sensitivity: 'balanced', privacy: 'local_first_supervised' },
  devices: [],
  capabilities: [],
  commandExamples: [],
  sessions: [],
  metrics: { devicesReady: 0, wakeWordHealth: 0, commandsToday: 0, continuousPresence: 0, safetyBlocks: 0, averageLatencyMs: 0 }
};

function MetricCard({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function StatusCard({ item }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{item.title || item.name}</strong><span>{item.status}</span></div>
      <p>{item.detail || `${item.platform} • microfone: ${item.microphone} • notificações: ${item.notifications}`}</p>
      <footer><em>{item.id}</em><b>{item.batteryMode || '4.8'}</b></footer>
    </article>
  );
}

function SessionCard({ session }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{session.command}</strong><span>{session.status}</span></div>
      <p>{session.nextAction || session.intent}</p>
      <footer><em>{session.source}</em><b>{session.risk || 'low'}</b></footer>
    </article>
  );
}

export default function VoiceMobilePresencePage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [command, setCommand] = useState('Ok Megan, leia minhas pendências de hoje');
  const [device, setDevice] = useState({ name: 'Celular principal do Luiz', platform: 'Android' });

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/voice-mobile-presence/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar voz + celular.');
      setDashboard(fallbackDashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function runCommand(event) {
    event.preventDefault();
    setWorking(true);
    try {
      await apiPost('/api/voice-mobile-presence/voice-command', { command, source: 'Web/PWA' });
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao processar comando de voz.');
    } finally {
      setWorking(false);
    }
  }

  async function registerDevice(event) {
    event.preventDefault();
    setWorking(true);
    try {
      await apiPost('/api/voice-mobile-presence/device/register', device);
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao registrar dispositivo.');
    } finally {
      setWorking(false);
    }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const deviceNames = useMemo(() => (dashboard.devices || []).map((item) => item.platform).join(' • '), [dashboard.devices]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 4.8</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={loadDashboard} disabled={loading}>{loading ? 'Carregando...' : 'Atualizar presença'}</button>
            <button className="ghost" onClick={() => setCommand('Ok Megan, responder esse cliente')} disabled={working}>Testar comando cliente</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Wake word</strong><b>{dashboard.wakeWord?.phrase || 'Ok Megan'}</b><span>{dashboard.wakeWord?.status} • {deviceNames || dashboard.status}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Dispositivos" value={metrics.devicesReady} caption="prontos ou em PWA" />
        <MetricCard label="Wake word" value={`${metrics.wakeWordHealth}%`} caption="saúde da ativação" />
        <MetricCard label="Comandos hoje" value={metrics.commandsToday} caption="voz processada" />
        <MetricCard label="Presença" value={`${metrics.continuousPresence}%`} caption="uso contínuo" />
        <MetricCard label="Bloqueios" value={metrics.safetyBlocks} caption="segurança ativa" />
        <MetricCard label="Latência" value={`${metrics.averageLatencyMs}ms`} caption="média local" />
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Comando por voz</span><strong>Simula “Ok Megan” com portão de segurança</strong></div>
          <form className="autoempresa-form" onSubmit={runCommand}>
            <input value={command} onChange={(event) => setCommand(event.target.value)} placeholder="Ex: Ok Megan, organizar meu dia" />
            <button type="submit" disabled={working}>{working ? 'Processando...' : 'Executar comando'}</button>
          </form>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Registrar celular</span><strong>Android, iPhone ou PWA</strong></div>
          <form className="autoempresa-form" onSubmit={registerDevice}>
            <input value={device.name} onChange={(event) => setDevice({ ...device, name: event.target.value })} placeholder="Nome do dispositivo" />
            <select value={device.platform} onChange={(event) => setDevice({ ...device, platform: event.target.value })}>
              <option>Android</option><option>iOS</option><option>Web/PWA</option>
            </select>
            <button type="submit" disabled={working}>Registrar</button>
          </form>
        </div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Dispositivos</span><strong>Presença real supervisionada</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.devices || []).map((item) => <StatusCard key={item.id} item={item} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Capacidades 4.8</span><strong>Voz, mobile e segurança</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.capabilities || []).map((item) => <StatusCard key={item.id} item={item} />)}</div>
        </div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Exemplos de comando</span><strong>Prontos para evoluir no app</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.commandExamples || []).map((item) => <article className="autoempresa-lead-card" key={item.text}><div><strong>{item.text}</strong><span>{item.intent}</span></div><p>{item.action}</p><footer><em>risco {item.risk}</em><b>Ok Megan</b></footer></article>)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Sessões recentes</span><strong>Histórico de voz</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.sessions || []).slice(0, 8).map((session) => <SessionCard key={session.id} session={session} />)}</div>
        </div>
      </section>
    </div>
  );
}
