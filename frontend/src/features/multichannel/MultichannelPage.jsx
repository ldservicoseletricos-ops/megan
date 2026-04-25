import React, { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

const fallbackDashboard = {
  title: 'Megan OS 4.7 — MULTICANAL TOTAL',
  focus: 'Central única para WhatsApp, Email, Telegram, Instagram, Site, CRM e Google Workspace.',
  status: 'offline_preview',
  metrics: { activeChannels: 0, connectedChannels: 0, queuedMessages: 0, routedToday: 0, responseCoverage: 0, averageResponseMinutes: 0 },
  channels: [],
  inbox: [],
  automations: [],
  recentActions: []
};

function MetricCard({ label, value, caption }) {
  return <article className="autoempresa-metric-card"><span>{label}</span><strong>{value}</strong><p>{caption}</p></article>;
}

function ChannelCard({ channel }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{channel.name}</strong><span>{channel.status}</span></div>
      <p>{channel.purpose}</p>
      <footer><em>{channel.queue} pendências</em><b>{channel.health}% saúde</b></footer>
    </article>
  );
}

function InboxCard({ message }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{message.contact}</strong><span>{message.channel}</span></div>
      <p>{message.text}</p>
      <footer><em>{message.intent}</em><b>{message.priority}</b></footer>
    </article>
  );
}

function AutomationCard({ automation }) {
  return (
    <article className="autoempresa-lead-card">
      <div><strong>{automation.name}</strong><span>{automation.status}</span></div>
      <p>{automation.action}</p>
      <footer><em>{automation.trigger}</em><b>ativo</b></footer>
    </article>
  );
}

export default function MultichannelPage() {
  const [dashboard, setDashboard] = useState(fallbackDashboard);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ channel: 'WhatsApp', contact: 'Novo lead', text: 'Quero saber preço e prazo de implantação.' });

  async function loadDashboard() {
    try {
      setError('');
      const data = await apiGet('/api/multichannel/dashboard');
      setDashboard(data || fallbackDashboard);
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o multicanal.');
      setDashboard(fallbackDashboard);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function routeMessage(event) {
    event.preventDefault();
    setWorking(true);
    try {
      await apiPost('/api/multichannel/route-message', form);
      setForm((current) => ({ ...current, contact: 'Novo lead', text: 'Quero agendar uma demonstração.' }));
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao rotear mensagem.');
    } finally {
      setWorking(false);
    }
  }

  async function executeNext() {
    setWorking(true);
    try {
      await apiPost('/api/multichannel/execute-next', {});
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Falha ao executar próxima ação.');
    } finally {
      setWorking(false);
    }
  }

  const metrics = dashboard.metrics || fallbackDashboard.metrics;
  const channelNames = useMemo(() => (dashboard.channels || []).map((item) => item.name).join(' • '), [dashboard.channels]);

  return (
    <div className="autoempresa-page">
      <section className="autoempresa-hero">
        <div>
          <span className="omega-kicker">FASE 4.7</span>
          <h1>{dashboard.title}</h1>
          <p>{dashboard.focus}</p>
          <div className="autoempresa-actions">
            <button onClick={executeNext} disabled={working}>{working ? 'Executando...' : 'Executar próxima ação'}</button>
            <button className="ghost" onClick={loadDashboard} disabled={loading}>Atualizar central</button>
          </div>
          {error ? <small className="autoempresa-error">{error}</small> : null}
        </div>
        <aside><strong>Canais conectados</strong><b>{metrics.connectedChannels}/{metrics.activeChannels}</b><span>{channelNames || dashboard.status}</span></aside>
      </section>

      <section className="autoempresa-grid-metrics">
        <MetricCard label="Canais" value={metrics.activeChannels} caption="pontos de contato" />
        <MetricCard label="Conectados" value={metrics.connectedChannels} caption="prontos para operar" />
        <MetricCard label="Fila" value={metrics.queuedMessages} caption="mensagens e tarefas" />
        <MetricCard label="Hoje" value={metrics.routedToday} caption="roteamentos feitos" />
        <MetricCard label="Cobertura" value={`${metrics.responseCoverage}%`} caption="respostas assistidas" />
        <MetricCard label="Tempo médio" value={`${metrics.averageResponseMinutes}m`} caption="resposta estimada" />
      </section>

      <section className="autoempresa-panel">
        <div className="autoempresa-panel-title"><span>Entrada multicanal simulada</span><strong>Roteia para CRM, agenda, proposta ou cobrança</strong></div>
        <form className="autoempresa-form" onSubmit={routeMessage}>
          <select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}>
            <option>WhatsApp</option><option>Email</option><option>Telegram</option><option>Instagram</option><option>Site</option><option>CRM</option><option>Google Workspace</option>
          </select>
          <input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} placeholder="Contato" />
          <input value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} placeholder="Mensagem recebida" />
          <button type="submit" disabled={working}>Roteiar mensagem</button>
        </form>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Canais integrados</span><strong>WhatsApp, Email, Telegram, Instagram, Site, CRM e Workspace</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.channels || []).map((channel) => <ChannelCard key={channel.id} channel={channel} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Inbox unificado</span><strong>Mensagens priorizadas</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.inbox || []).slice(0, 8).map((message) => <InboxCard key={message.id} message={message} />)}</div>
        </div>
      </section>

      <section className="autoempresa-two-columns">
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Automações ativas</span><strong>Execução entre apps</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.automations || []).map((automation) => <AutomationCard key={automation.id} automation={automation} />)}</div>
        </div>
        <div className="autoempresa-panel">
          <div className="autoempresa-panel-title"><span>Ações recentes</span><strong>Histórico operacional</strong></div>
          <div className="autoempresa-leads-list">{(dashboard.recentActions || []).slice(0, 8).map((action) => <article className="autoempresa-lead-card" key={action.id}><div><strong>{action.title}</strong><span>feito</span></div><p>{action.result}</p><footer><em>{new Date(action.createdAt).toLocaleString('pt-BR')}</em><b>4.7</b></footer></article>)}</div>
        </div>
      </section>
    </div>
  );
}
